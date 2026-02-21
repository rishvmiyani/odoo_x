import type { Driver } from "@prisma/client";
import type { SafetyScoreBreakdown } from "@/types";
import { prisma } from "@/lib/prisma";

export function computeSafetyScore(driver: Driver): SafetyScoreBreakdown {
  const completionRate =
    driver.totalTrips > 0 ? driver.completedTrips / driver.totalTrips : 1.0;

  const licenseValid = new Date(driver.licenseExpiry) > new Date();
  const isSuspended = driver.status === "SUSPENDED";

  const completionPoints = completionRate * 60;
  const licensePoints = licenseValid ? 25 : 0;
  const basePoints = 15;
  const suspensionPenalty = isSuspended ? -25 : 0;

  const raw = basePoints + completionPoints + licensePoints + suspensionPenalty;
  const finalScore = Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;

  return {
    driverId: driver.id,
    completionRate,
    licenseValid,
    isSuspended,
    completionPoints: Math.round(completionPoints),
    licensePoints,
    suspensionPenalty,
    finalScore,
  };
}

export async function updateDriverSafetyScore(driverId: string): Promise<number> {
  const driver = await prisma.driver.findUniqueOrThrow({
    where: { id: driverId },
  });
  const { finalScore } = computeSafetyScore(driver);
  await prisma.driver.update({
    where: { id: driverId },
    data: { safetyScore: finalScore },
  });
  return finalScore;
}
