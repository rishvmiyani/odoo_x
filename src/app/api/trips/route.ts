import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TripCreateSchema } from "@/lib/validations/trip.schema";
import { generateTripCode } from "@/lib/utils";
import type { TripStatus } from "@prisma/client";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status   = searchParams.get("status");
    const vehicleId = searchParams.get("vehicleId");
    const driverId  = searchParams.get("driverId");
    const search    = searchParams.get("search");
    const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize  = Math.min(100, parseInt(searchParams.get("pageSize") ?? "20"));

    const where = {
      ...(status    && { status: status as TripStatus }),
      ...(vehicleId && { vehicleId }),
      ...(driverId  && { driverId }),
      ...(search && {
        OR: [
          { tripCode:           { contains: search, mode: "insensitive" as const } },
          { originAddress:      { contains: search, mode: "insensitive" as const } },
          { destinationAddress: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [trips, total] = await prisma.$transaction([
      prisma.trip.findMany({
        where,
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: "desc" },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      prisma.trip.count({ where }),
    ]);

    return NextResponse.json({ data: trips, total, page, pageSize });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to fetch trips" },
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
    const validated = TripCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { vehicleId, driverId, cargoWeight, scheduledAt, ...rest } = validated.data;

    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      prisma.driver.findUnique({ where: { id: driverId } }),
    ]);

    if (!vehicle) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }
    if (!driver) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // ── Business rule validations ─────────────────────────────────────────────

    if (vehicle.status !== "AVAILABLE") {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Vehicle is currently ${vehicle.status.replace(/_/g, " ").toLowerCase()}` },
        { status: 422 }
      );
    }
    if (vehicle.isRetired) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Retired vehicles cannot be assigned to trips" },
        { status: 422 }
      );
    }
    if (driver.status === "SUSPENDED") {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Suspended drivers cannot be assigned to trips" },
        { status: 422 }
      );
    }
    if (driver.status !== "OFF_DUTY") {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Driver is currently ${driver.status.replace(/_/g, " ").toLowerCase()}` },
        { status: 422 }
      );
    }
    if (new Date(driver.licenseExpiry) < new Date()) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Driver license is expired and cannot be assigned" },
        { status: 422 }
      );
    }
    if (!driver.licenseCategory.includes(vehicle.type)) {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Driver is not licensed to operate a ${vehicle.type.toLowerCase()}` },
        { status: 422 }
      );
    }
    if (cargoWeight > vehicle.maxCapacity) {
      return NextResponse.json<ApiResponse<never>>(
        {
          error: `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity} kg)`,
        },
        { status: 422 }
      );
    }

    // ── Create trip + update vehicle + update driver in one transaction ───────

    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          tripCode:     generateTripCode(),
          vehicleId,
          driverId,
          cargoWeight,
          scheduledAt:  new Date(scheduledAt),
          status:       "DISPATCHED" as TripStatus,
          dispatchedAt: new Date(),
          startOdometer: vehicle.currentOdometer,
          ...rest,
        },
        include: { vehicle: true, driver: true },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data:  { status: "ON_TRIP" },
      });

      await tx.driver.update({
        where: { id: driverId },
        data:  { status: "ON_DUTY", totalTrips: { increment: 1 } },
      });

      return newTrip;
    });

    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
