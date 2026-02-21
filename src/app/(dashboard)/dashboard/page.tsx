"use client";

import useSWR from "swr";
import { Truck, Wrench, Activity, Package } from "lucide-react";
import { KpiCard }          from "@/components/dashboard/KpiCard";
import { FleetStatusChart } from "@/components/dashboard/FleetStatusChart";
import { TripActivityFeed } from "@/components/dashboard/TripActivityFeed";
import { AlertsPanel }      from "@/components/dashboard/AlertsPanel";
import { PageHeader }       from "@/components/layout/PageHeader";
import { StatusPill }       from "@/components/shared/StatusPill";
import { formatDateTime, formatWeight }  from "@/lib/utils";
import type { TripWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DashboardData {
  kpis: {
    activeFleet: number; maintenanceAlerts: number;
    utilizationRate: number; pendingCargo: number;
    totalVehicles: number; availableVehicles: number;
  };
  statusCounts:    { status: string; count: number }[];
  recentTrips:     TripWithRelations[];
  activityData:    { date: string; count: number }[];
  openMaintenance: { id: string; vehicle: { name: string }; type: string; description: string; serviceDate: string; cost: number }[];
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR<{ data: DashboardData }>("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  });

  const d = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        description="Real-time fleet overview and operational status"
        breadcrumbs={[{ label: "Command Center" }]}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Fleet"       value={d?.kpis.activeFleet        ?? 0} subtitle={`of ${d?.kpis.totalVehicles ?? 0} total vehicles`}   icon={Truck}    color="blue"    isLoading={isLoading} />
        <KpiCard title="Maintenance Alerts" value={d?.kpis.maintenanceAlerts  ?? 0} subtitle="vehicles currently in shop"                           icon={Wrench}   color="amber"   isLoading={isLoading} />
        <KpiCard title="Utilization Rate"   value={`${d?.kpis.utilizationRate ?? 0}%`} subtitle={`${d?.kpis.availableVehicles ?? 0} available now`} icon={Activity} color="emerald" isLoading={isLoading} />
        <KpiCard title="Pending Cargo"      value={d?.kpis.pendingCargo       ?? 0} subtitle="trips awaiting dispatch"                              icon={Package}  color="red"     isLoading={isLoading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Fleet Status Distribution</h2>
          {d?.statusCounts ? <FleetStatusChart data={d.statusCounts} /> : <div className="h-[210px] bg-gray-50 rounded animate-pulse" />}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Trip Activity — Last 14 Days</h2>
          {d?.activityData ? <TripActivityFeed data={d.activityData} /> : <div className="h-[210px] bg-gray-50 rounded animate-pulse" />}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Trips */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Trips</h2>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Trip Code","Vehicle","Driver","Cargo","Scheduled","Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(d?.recentTrips ?? []).map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{trip.tripCode.slice(-9)}</code></td>
                      <td className="py-2.5 pr-4 text-gray-700">{trip.vehicle?.name ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{trip.driver?.name ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{formatWeight(trip.cargoWeight)}</td>
                      <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{formatDateTime(trip.scheduledAt)}</td>
                      <td className="py-2.5"><StatusPill status={trip.status} type="trip" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!d?.recentTrips || d.recentTrips.length === 0) && (
                <p className="text-center text-sm text-gray-400 py-8">No trips recorded yet</p>
              )}
            </div>
          )}
        </div>

        {/* AI Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Maintenance Alerts</h2>
          <AlertsPanel
            alerts={(d?.openMaintenance as never) ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
