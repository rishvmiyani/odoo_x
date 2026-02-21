import type { FuelExpense, MaintenanceLog } from "@prisma/client";
import type { CostPrediction } from "@/types";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

function linearRegression(y: number[]): { slope: number; intercept: number } {
  const n = y.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function predictNextMonthCost(
  vehicleId: string,
  fuelExpenses: FuelExpense[],
  maintenanceLogs: MaintenanceLog[],
  monthsBack = 6
): CostPrediction {
  const now = new Date();

  const monthlyHistory = Array.from({ length: monthsBack }, (_, i) => {
    const target = subMonths(now, monthsBack - 1 - i);
    const start = startOfMonth(target);
    const end = endOfMonth(target);

    const fuelCost = fuelExpenses
      .filter((e) => {
        const d = new Date(e.fuelDate);
        return d >= start && d <= end;
      })
      .reduce((s, e) => s + e.totalCost, 0);

    const maintenanceCost = maintenanceLogs
      .filter((m) => {
        const d = new Date(m.serviceDate);
        return d >= start && d <= end;
      })
      .reduce((s, m) => s + m.cost, 0);

    return {
      month: format(target, "MMM yyyy"),
      totalCost: Number((fuelCost + maintenanceCost).toFixed(2)),
    };
  });

  const { slope, intercept } = linearRegression(
    monthlyHistory.map((m) => m.totalCost)
  );
  const predicted = Math.max(0, slope * (monthsBack + 1) + intercept);

  const trend: CostPrediction["trend"] =
    slope > 50 ? "INCREASING" : slope < -50 ? "DECREASING" : "STABLE";

  return {
    vehicleId,
    monthlyHistory,
    predictedNextMonthCost: Number(predicted.toFixed(2)),
    trend,
  };
}
