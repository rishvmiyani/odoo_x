import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MaintenanceCreateSchema } from "@/lib/validations/maintenance.schema";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId  = searchParams.get("vehicleId");
    const isResolved = searchParams.get("isResolved");

    const logs = await prisma.maintenanceLog.findMany({
      where: {
        ...(vehicleId  && { vehicleId }),
        ...(isResolved !== null && { isResolved: isResolved === "true" }),
      },
      include: { vehicle: true },
      orderBy: { serviceDate: "desc" },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to fetch maintenance logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = MaintenanceCreateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: { ...validated.data, serviceDate: new Date(validated.data.serviceDate) },
        include: { vehicle: true },
      });
      await tx.vehicle.update({
        where: { id: validated.data.vehicleId },
        data: { status: "IN_SHOP" },
      });
      return log;
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to create maintenance log" }, { status: 500 });
  }
}
