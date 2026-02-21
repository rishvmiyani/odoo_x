import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where:   { id },
    include: { vehicle: true, driver: true },
  });

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ data: trip });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body    = await req.json();
  const { action, endOdometer, revenue, cancelReason } = body;

  const trip = await prisma.trip.findUnique({
    where: { id }, include: { vehicle: true, driver: true },
  });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  if (action === "COMPLETE") {
    const distanceKm = trip.startOdometer
      ? endOdometer - trip.startOdometer
      : undefined;

    const [updated] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data:  {
          status: "COMPLETED", completedAt: new Date(),
          endOdometer, distanceKm, revenue: revenue ?? 0,
        },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data:  { status: "AVAILABLE", currentOdometer: endOdometer },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data:  { status: "OFF_DUTY", completedTrips: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ data: updated });
  }

  if (action === "CANCEL") {
    const [updated] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data:  { status: "CANCELLED", cancelReason },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data:  { status: "AVAILABLE" },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data:  { status: "OFF_DUTY" },
      }),
    ]);
    return NextResponse.json({ data: updated });
  }

  const updated = await prisma.trip.update({ where: { id }, data: body });
  return NextResponse.json({ data: updated });
}
