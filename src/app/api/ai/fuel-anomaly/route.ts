import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectFuelAnomalies } from "@/lib/ai/fuel-anomaly-detector";
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

    const expenses = await prisma.fuelExpense.findMany({
      where: { vehicleId },
      orderBy: { odometerAtFuel: "asc" },
    });

    const result = detectFuelAnomalies(vehicleId, expenses);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Anomaly detection failed" }, { status: 500 });
  }
}
