import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [vehicles, pendingCargo, recentTrips, openMaintenance] =
      await Promise.all([
        prisma.vehicle.findMany({ where: { isRetired: false } }),
        prisma.trip.count({ where: { status: { in: ["DRAFT", "DISPATCHED"] } } }),
        prisma.trip.findMany({
          include: { vehicle: true, driver: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.maintenanceLog.findMany({
          where: { isResolved: false },
          include: { vehicle: true },
          orderBy: { serviceDate: "desc" },
          take: 8,
        }),
      ]);

    const activityData = await Promise.all(
      Array.from({ length: 14 }, (_, i) => {
        const day   = subDays(new Date(), 13 - i);
        const start = startOfDay(day);
        const end   = endOfDay(day);
        return prisma.trip
          .count({ where: { createdAt: { gte: start, lte: end } } })
          .then((count) => ({ date: format(start, "MMM dd"), count }));
      })
    );

    const total    = vehicles.length;
    const onTrip   = vehicles.filter((v) => v.status === "ON_TRIP").length;
    const inShop   = vehicles.filter((v) => v.status === "IN_SHOP").length;
    const available= vehicles.filter((v) => v.status === "AVAILABLE").length;
    const oos      = vehicles.filter((v) => v.status === "OUT_OF_SERVICE").length;

    return NextResponse.json({
      data: {
        kpis: {
          activeFleet:       onTrip,
          maintenanceAlerts: inShop,
          utilizationRate:   total > 0 ? Number(((onTrip / total) * 100).toFixed(1)) : 0,
          pendingCargo,
          totalVehicles:     total,
          availableVehicles: available,
        },
        statusCounts: [
          { status: "AVAILABLE",       count: available },
          { status: "ON_TRIP",         count: onTrip    },
          { status: "IN_SHOP",         count: inShop    },
          { status: "OUT_OF_SERVICE",  count: oos       },
        ],
        recentTrips,
        activityData,
        openMaintenance,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
