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

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips:           { include: { driver: true }, orderBy: { createdAt: "desc" }, take: 15 },
      maintenanceLogs: { orderBy: { serviceDate: "desc" } },
      fuelExpenses:    { orderBy: { fuelDate: "desc" } },
    },
  });

  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  return NextResponse.json({ data: vehicle });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body    = await req.json();

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data:  body,
  });

  return NextResponse.json({ data: vehicle });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.vehicle.update({
    where: { id },
    data:  { isRetired: true, status: "OUT_OF_SERVICE" },
  });

  return NextResponse.json({ success: true });
}
