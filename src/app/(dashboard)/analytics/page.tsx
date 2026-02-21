"use client";

import { useState }              from "react";
import { useAnalytics }          from "@/hooks/useAnalytics";
import { FuelEfficiencyChart }   from "@/components/analytics/FuelEfficiencyChart";
import { CostBreakdownChart }    from "@/components/analytics/CostBreakdownChart";
import { VehicleRoiChart }       from "@/components/analytics/VehicleRoiChart";
import { ExportButtons }         from "@/components/analytics/ExportButtons";
import { SafetyScoreRing }       from "@/components/drivers/SafetyScoreRing";
import { PageHeader }            from "@/components/layout/PageHeader";
import { Skeleton }              from "@/components/ui/skeleton";
import { Input }                 from "@/components/ui/input";
import { Label }                 from "@/components/ui/label";
import { formatCurrency, formatEfficiency } from "@/lib/utils";
import { subMonths, format }     from "date-fns";

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), "yyyy-MM-dd"));
  const [endDate,   setEndDate]   = useState(format(new Date(), "yyyy-MM-dd"));

  const { analytics, isLoading } = useAnalytics({ startDate, endDate });
  const kpi = analytics?.kpiSummary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Data-driven fleet performance and financial insights"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Analytics" }]}
        actions={<ExportButtons summary={analytics} startDate={startDate} endDate={endDate} />}
      />

      {/* Date range filter */}
      <div className="flex items-center gap-4 flex-wrap bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap">From</Label>
          <Input type="date" value={startDate} max={endDate}
            onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap">To</Label>
          <Input type="date" value={endDate} min={startDate} max={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs w-36" />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Efficiency",  value: isLoading ? "—" : formatEfficiency(kpi?.avgEfficiency ?? 0)  },
          { label: "Total Op Cost",   value: isLoading ? "—" : formatCurrency(kpi?.totalCost ?? 0)         },
          { label: "Top Vehicle",     value: isLoading ? "—" : kpi?.topVehicle?.name ?? "—"                },
          { label: "Top Driver",      value: isLoading ? "—" : kpi?.topDriver?.name  ?? "—"                },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
            {isLoading
              ? <Skeleton className="h-6 w-24 mt-1" />
              : <p className="text-sm font-bold text-gray-900 mt-1 truncate">{item.value}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Fuel Efficiency by Vehicle (km/L)</h3>
          {isLoading ? <Skeleton className="h-[220px] w-full" />
            : <FuelEfficiencyChart data={analytics?.fuelEfficiencyPerVehicle ?? []} />}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Cost Breakdown</h3>
          {isLoading ? <Skeleton className="h-[220px] w-full" />
            : <CostBreakdownChart data={analytics?.costBreakdownPerMonth ?? []} />}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Vehicle ROI Analysis</h3>
          {isLoading ? <Skeleton className="h-[220px] w-full" />
            : <VehicleRoiChart data={analytics?.vehicleRoi ?? []} />}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Driver Safety Scores</h3>
          {isLoading ? <Skeleton className="h-[220px] w-full" /> : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {(analytics?.driverSafetyScores ?? [])
                .sort((a, b) => b.score - a.score)
                .map((driver) => (
                  <div key={driver.driverId} className="flex items-center gap-3">
                    <SafetyScoreRing score={driver.score} size={38} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{driver.name}</p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${driver.score}%`, backgroundColor: driver.score >= 80 ? "#10b981" : driver.score >= 60 ? "#f59e0b" : "#ef4444" }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{driver.score.toFixed(0)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle ROI Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Vehicle Financial Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Vehicle","Revenue","Fuel Cost","Maintenance","Total Cost","Acquisition","ROI"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                : (analytics?.vehicleRoi ?? []).map((v) => (
                    <tr key={v.vehicleId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vehicleName}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(v.totalRevenue)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(v.totalCost * 0.6)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(v.totalCost * 0.4)}</td>
                      <td className="px-4 py-3 text-red-600">{formatCurrency(v.totalCost)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatCurrency(v.acquisitionCost)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${v.roi >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {(v.roi * 100).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
