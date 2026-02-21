import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { predictMaintenance } from "@/lib/ai/maintenance-predictor";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicleId = new URL(req.url).searchParams.get("vehicleId");
    if (!vehicleId) {
      return NextResponse.json<ApiResponse<never>>({ error: "vehicleId is required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { maintenanceLogs: { orderBy: { serviceDate: "desc" } } },
    });

    if (!vehicle) {
      return NextResponse.json<ApiResponse<never>>({ error: "Vehicle not found" }, { status: 404 });
    }

    const predictions = predictMaintenance(
      vehicle.currentOdometer,
      vehicle.maintenanceLogs,
      vehicle.createdAt
    );

    return NextResponse.json({ data: predictions });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Prediction failed" }, { status: 500 });
  }
}
