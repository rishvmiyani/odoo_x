import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { AnalyticsSummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

type DocWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

export function generateAnalyticsPDF(summary: AnalyticsSummary, range: { start: string; end: string }) {
  const doc      = new jsPDF() as DocWithAutoTable;
  const pageW    = doc.internal.pageSize.width;

  // Header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FleetFlow AI", 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Operational Analytics & Financial Report", 14, 25);
  doc.text(`Period: ${range.start} — ${range.end}`, 14, 32);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, pageW - 14, 32, { align: "right" });

  doc.setTextColor(0, 0, 0);

  // KPI Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("KPI Summary", 14, 52);
  autoTable(doc, {
    startY: 56,
    head: [["Metric","Value"]],
    body: [
      ["Average Fleet Efficiency",      `${summary.kpiSummary.avgEfficiency} km/L`],
      ["Total Operational Cost",         formatCurrency(summary.kpiSummary.totalCost)],
      ["Top Vehicle (ROI)",              summary.kpiSummary.topVehicle ? `${summary.kpiSummary.topVehicle.name}  (${(summary.kpiSummary.topVehicle.roi * 100).toFixed(1)}%)` : "N/A"],
      ["Top Driver (Safety Score)",      summary.kpiSummary.topDriver  ? `${summary.kpiSummary.topDriver.name}  (${summary.kpiSummary.topDriver.score}/100)` : "N/A"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Fuel Efficiency
  const y1 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Fuel Efficiency by Vehicle", 14, y1);
  autoTable(doc, {
    startY: y1 + 4,
    head: [["Vehicle","License Plate","Efficiency (km/L)"]],
    body: summary.fuelEfficiencyPerVehicle.map((v) => [v.vehicleName, v.licensePlate, v.kmPerLiter.toFixed(2)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Vehicle ROI
  const y2 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Vehicle ROI Analysis", 14, y2);
  autoTable(doc, {
    startY: y2 + 4,
    head: [["Vehicle","Revenue","Total Cost","Acquisition","ROI"]],
    body: summary.vehicleRoi.map((v) => [
      v.vehicleName,
      formatCurrency(v.totalRevenue),
      formatCurrency(v.totalCost),
      formatCurrency(v.acquisitionCost),
      `${(v.roi * 100).toFixed(2)}%`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Driver Safety
  const y3 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Driver Safety Scores", 14, y3);
  autoTable(doc, {
    startY: y3 + 4,
    head: [["Driver","Safety Score","Rating"]],
    body: summary.driverSafetyScores.map((d) => [
      d.name,
      d.score.toFixed(1),
      d.score >= 80 ? "Good" : d.score >= 60 ? "Average" : "Poor",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(`FleetFlow-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
