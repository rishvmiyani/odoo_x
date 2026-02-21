import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VehicleCreateSchema } from "@/lib/validations/vehicle.schema";
import type { VehicleStatus, VehicleType } from "@prisma/client";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type          = searchParams.get("type");
    const status        = searchParams.get("status");
    const region        = searchParams.get("region");
    const search        = searchParams.get("search");
    const onlyAvailable = searchParams.get("onlyAvailable") === "true";
    const minCapacity   = searchParams.get("minCapacity");
    const excludeRetired = searchParams.get("excludeRetired") !== "false";

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(excludeRetired && { isRetired: false }),
        ...(type   && { type:   type   as VehicleType   }),
        ...(status && !onlyAvailable && { status: status as VehicleStatus }),
        ...(onlyAvailable && { status: "AVAILABLE" as VehicleStatus }),
        ...(region && { region }),
        ...(minCapacity && { maxCapacity: { gte: parseFloat(minCapacity) } }),
        ...(search && {
          OR: [
            { name:         { contains: search, mode: "insensitive" } },
            { licensePlate: { contains: search, mode: "insensitive" } },
            { model:        { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: vehicles });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const body      = await req.json();
    const validated = VehicleCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: validated.data.licensePlate },
    });
    if (existing) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "A vehicle with this license plate already exists" },
        { status: 409 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validated.data,
        acquisitionDate: validated.data.acquisitionDate
          ? new Date(validated.data.acquisitionDate)
          : null,
      },
    });

    return NextResponse.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
