import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id }   = await params;
  const body     = await req.json();
  const { action, ...rest } = body;

  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

  // Handle resolve action
  if (action === "resolve") {
    const [updated] = await prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id },
        data:  { isResolved: true, resolvedAt: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: log.vehicleId },
        data:  { status: "AVAILABLE" },
      }),
    ]);
    return NextResponse.json({ data: updated });
  }

  // Generic update — strip any non-DB fields just in case
  const { action: _action, ...cleanData } = body;
  const updated = await prisma.maintenanceLog.update({
    where: { id },
    data:  cleanData,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.maintenanceLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
