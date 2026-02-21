import Papa from "papaparse";
import { format } from "date-fns";
import type { AnalyticsSummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

function download(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAnalyticsCSV(summary: AnalyticsSummary) {
  const rows: Record<string, string | number>[] = [];

  summary.fuelEfficiencyPerVehicle.forEach((v) =>
    rows.push({ Section:"Fuel Efficiency", Vehicle: v.vehicleName, Plate: v.licensePlate, "km/L": v.kmPerLiter })
  );
  summary.vehicleRoi.forEach((v) =>
    rows.push({ Section:"Vehicle ROI", Vehicle: v.vehicleName, Plate: v.licensePlate,
      Revenue: v.totalRevenue, "Total Cost": v.totalCost, "Acquisition": v.acquisitionCost,
      "ROI %": (v.roi * 100).toFixed(2) })
  );
  summary.costBreakdownPerMonth.forEach((m) =>
    rows.push({ Section:"Monthly Costs", Month: m.month, "Fuel Cost": m.fuelCost,
      "Maintenance Cost": m.maintenanceCost, "Total Cost": m.totalCost })
  );
  summary.driverSafetyScores.forEach((d) =>
    rows.push({ Section:"Driver Safety", Driver: d.name, Score: d.score })
  );

  download(Papa.unparse(rows), "FleetFlow-Analytics");
}
