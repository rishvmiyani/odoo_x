import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateVehicleROI } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { ApiResponse, AnalyticsSummary } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : subMonths(new Date(), 3);
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();

    const [vehicles, completedTrips, fuelExpenses, maintenanceLogs, drivers] =
      await Promise.all([
        prisma.vehicle.findMany({ where: { isRetired: false } }),
        prisma.trip.findMany({
          where: { status: "COMPLETED", completedAt: { gte: startDate, lte: endDate } },
        }),
        prisma.fuelExpense.findMany({
          where: { fuelDate: { gte: startDate, lte: endDate } },
        }),
        prisma.maintenanceLog.findMany({
          where: { serviceDate: { gte: startDate, lte: endDate } },
        }),
        prisma.driver.findMany(),
      ]);

    const fuelEfficiencyPerVehicle = vehicles.map((v) => {
      const vTrips  = completedTrips.filter((t) => t.vehicleId === v.id && t.startOdometer && t.endOdometer);
      const vFuel   = fuelExpenses.filter((f) => f.vehicleId === v.id);
      const totalDist = vTrips.reduce((s, t) => s + ((t.endOdometer ?? 0) - (t.startOdometer ?? 0)), 0);
      const totalLiters = vFuel.reduce((s, f) => s + f.liters, 0);
      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        kmPerLiter: totalLiters > 0 ? Number((totalDist / totalLiters).toFixed(2)) : 0,
      };
    });

    const costBreakdownPerMonth = Array.from({ length: 6 }, (_, i) => {
      const target = subMonths(new Date(), 5 - i);
      const start  = startOfMonth(target);
      const end    = endOfMonth(target);
      const fuelCost = fuelExpenses
        .filter((f) => new Date(f.fuelDate) >= start && new Date(f.fuelDate) <= end)
        .reduce((s, f) => s + f.totalCost, 0);
      const maintenanceCost = maintenanceLogs
        .filter((m) => new Date(m.serviceDate) >= start && new Date(m.serviceDate) <= end)
        .reduce((s, m) => s + m.cost, 0);
      return {
        month: format(target, "MMM yyyy"),
        fuelCost: Number(fuelCost.toFixed(2)),
        maintenanceCost: Number(maintenanceCost.toFixed(2)),
        totalCost: Number((fuelCost + maintenanceCost).toFixed(2)),
      };
    });

    const vehicleRoi = vehicles.map((v) => {
      const vTrips = completedTrips.filter((t) => t.vehicleId === v.id);
      const totalRevenue = vTrips.reduce((s, t) => s + (t.revenue ?? 0), 0);
      const fuelCost = fuelExpenses.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.totalCost, 0);
      const maintCost = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCost: Number((fuelCost + maintCost).toFixed(2)),
        acquisitionCost: v.acquisitionCost,
        roi: calculateVehicleROI(totalRevenue, maintCost, fuelCost, v.acquisitionCost),
      };
    });

    const driverSafetyScores = drivers.map((d) => ({
      driverId: d.id,
      name: d.name,
      score: d.safetyScore,
    }));

    const validEff = fuelEfficiencyPerVehicle.filter((v) => v.kmPerLiter > 0);
    const avgEfficiency = validEff.length > 0
      ? validEff.reduce((s, v) => s + v.kmPerLiter, 0) / validEff.length
      : 0;
    const totalCost = costBreakdownPerMonth.reduce((s, m) => s + m.totalCost, 0);
    const topVehicle = vehicleRoi.length > 0 ? [...vehicleRoi].sort((a, b) => b.roi - a.roi)[0] : null;
    const topDriver  = driverSafetyScores.length > 0 ? [...driverSafetyScores].sort((a, b) => b.score - a.score)[0] : null;

    const summary: AnalyticsSummary = {
      fuelEfficiencyPerVehicle,
      costBreakdownPerMonth,
      vehicleRoi,
      driverSafetyScores,
      kpiSummary: {
        avgEfficiency: Number(avgEfficiency.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        topVehicle: topVehicle ? { name: topVehicle.vehicleName, roi: topVehicle.roi } : null,
        topDriver: topDriver ? { name: topDriver.name, score: topDriver.score } : null,
      },
    };

    return NextResponse.json({ data: summary });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
