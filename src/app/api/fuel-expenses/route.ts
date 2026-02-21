import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FuelExpenseCreateSchema } from "@/lib/validations/fuel.schema";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const tripId    = searchParams.get("tripId");

    const expenses = await prisma.fuelExpense.findMany({
      where: {
        ...(vehicleId && { vehicleId }),
        ...(tripId    && { tripId }),
      },
      include: { vehicle: true, trip: true },
      orderBy: { fuelDate: "desc" },
    });

    return NextResponse.json({ data: expenses });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to fetch fuel expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = FuelExpenseCreateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const expense = await prisma.fuelExpense.create({
      data: { ...validated.data, fuelDate: new Date(validated.data.fuelDate) },
      include: { vehicle: true, trip: true },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to create fuel expense" }, { status: 500 });
  }
}
