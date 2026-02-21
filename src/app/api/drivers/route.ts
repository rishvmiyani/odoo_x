import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DriverCreateSchema } from "@/lib/validations/driver.schema";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status       = searchParams.get("status");
    const search       = searchParams.get("search");
    const onlyAvailable = searchParams.get("onlyAvailable") === "true";
    const vehicleType  = searchParams.get("vehicleType");

    const drivers = await prisma.driver.findMany({
      where: {
        ...(onlyAvailable ? { status: "OFF_DUTY" } : status ? { status: status as never } : {}),
        ...(vehicleType && { licenseCategory: { has: vehicleType } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { licenseNumber: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: drivers });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = DriverCreateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const [existingEmail, existingLicense] = await Promise.all([
      prisma.driver.findUnique({ where: { email: validated.data.email } }),
      prisma.driver.findUnique({ where: { licenseNumber: validated.data.licenseNumber } }),
    ]);

    if (existingEmail) {
      return NextResponse.json<ApiResponse<never>>({ error: "Email already in use" }, { status: 409 });
    }
    if (existingLicense) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "License number already registered" },
        { status: 409 }
      );
    }

    const driver = await prisma.driver.create({
      data: { ...validated.data, licenseExpiry: new Date(validated.data.licenseExpiry) },
    });

    return NextResponse.json({ data: driver }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to create driver" }, { status: 500 });
  }
}
