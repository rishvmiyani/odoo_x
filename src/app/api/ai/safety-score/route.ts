import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSafetyScore, updateDriverSafetyScore } from "@/lib/ai/safety-scorer";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const driverId = new URL(req.url).searchParams.get("driverId");
    if (!driverId) {
      return NextResponse.json<ApiResponse<never>>({ error: "driverId is required" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json<ApiResponse<never>>({ error: "Driver not found" }, { status: 404 });
    }

    const breakdown = computeSafetyScore(driver);
    return NextResponse.json({ data: breakdown });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to compute score" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<never>>({ error: "Unauthorized" }, { status: 401 });
    }

    const { driverId } = await req.json();
    if (!driverId) {
      return NextResponse.json<ApiResponse<never>>({ error: "driverId is required" }, { status: 400 });
    }

    const score = await updateDriverSafetyScore(driverId);
    return NextResponse.json({ data: { score } });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json<ApiResponse<never>>({ error: "Failed to update score" }, { status: 500 });
  }
}
