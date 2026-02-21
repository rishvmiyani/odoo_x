import type { FuelExpense } from "@prisma/client";
import type { FuelAnomalyResult, FuelAnomaly } from "@/types";

const Z_THRESHOLD = 2.0;
const MIN_SAMPLES = 3;

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[], mu: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mu, 2), 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

export function detectFuelAnomalies(
  vehicleId: string,
  fuelExpenses: FuelExpense[]
): FuelAnomalyResult {
  const sorted = [...fuelExpenses].sort(
    (a, b) => a.odometerAtFuel - b.odometerAtFuel
  );

  const points: { expenseId: string; fuelDate: Date; efficiency: number }[] =
    [];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    const distance = curr.odometerAtFuel - prev.odometerAtFuel;
    if (distance > 0 && curr.liters > 0) {
      points.push({
        expenseId: curr.id,
        fuelDate: new Date(curr.fuelDate),
        efficiency: Number((distance / curr.liters).toFixed(2)),
      });
    }
  }

  if (points.length < MIN_SAMPLES) {
    return { vehicleId, meanEfficiency: points[0]?.efficiency ?? 0, stdDev: 0, anomalies: [] };
  }

  const values = points.map((p) => p.efficiency);
  const mu = mean(values);
  const sigma = stdDev(values, mu);

  const anomalies: FuelAnomaly[] = points
    .map((point) => {
      const zScore = sigma > 0 ? (point.efficiency - mu) / sigma : 0;
      if (Math.abs(zScore) < Z_THRESHOLD) return null;
      return {
        expenseId: point.expenseId,
        fuelDate: point.fuelDate,
        efficiency: point.efficiency,
        zScore: Number(zScore.toFixed(2)),
        anomalyType: (zScore > 0 ? "HIGH" : "LOW") as "HIGH" | "LOW",
        message:
          zScore > Z_THRESHOLD
            ? "Unusually high efficiency — verify odometer reading"
            : "Unusually low efficiency — possible fuel theft or leak",
      };
    })
    .filter((a): a is FuelAnomaly => a !== null);

  return {
    vehicleId,
    meanEfficiency: Number(mu.toFixed(2)),
    stdDev: Number(sigma.toFixed(2)),
    anomalies,
  };
}
