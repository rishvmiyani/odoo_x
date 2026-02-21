"use client";

import { useState }      from "react";
import { useParams, useRouter } from "next/navigation";
import { toast }         from "sonner";
import { ArchiveX, RotateCcw, Fuel, Wrench, Brain } from "lucide-react";
import { useVehicle, retireVehicle, restoreVehicle } from "@/hooks/useVehicles";
import { PredictionCard }    from "@/components/maintenance/PredictionCard";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { ConfirmDialog }     from "@/components/shared/ConfirmDialog";
import { PageHeader }        from "@/components/layout/PageHeader";
import { Button }            from "@/components/ui/button";
import { Skeleton }          from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill }        from "@/components/shared/StatusPill";
import { formatCurrency, formatDate, formatOdometer, formatWeight, getMaintenanceTypeLabel } from "@/lib/utils";

export default function VehicleDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { vehicle, isLoading, mutate } = useVehicle(id);
  const [showRetire, setShowRetire] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!vehicle) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Vehicle not found</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/vehicles")}>Back to Registry</Button>
    </div>
  );

  const handleRetireRestore = async () => {
    setProcessing(true);
    try {
      if (vehicle.isRetired) {
        await restoreVehicle(id);
        toast.success(`${vehicle.name} restored to fleet`);
      } else {
        await retireVehicle(id);
        toast.success(`${vehicle.name} retired from fleet`);
      }
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setProcessing(false);
      setShowRetire(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <PageHeader
        title={vehicle.name}
        description={`${vehicle.model} · ${vehicle.licensePlate}`}
        breadcrumbs={[
          { label: "Command Center",   href: "/dashboard" },
          { label: "Vehicle Registry", href: "/vehicles"  },
          { label: vehicle.name                           },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <VehicleStatusBadge status={vehicle.status} />
            <Button size="sm" variant="outline" className="h-8 text-xs"
              onClick={() => setShowRetire(true)}
              disabled={vehicle.status === "ON_TRIP"}>
              {vehicle.isRetired
                ? <><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restore</>
                : <><ArchiveX   className="h-3.5 w-3.5 mr-1.5" />Retire</>}
            </Button>
          </div>
        }
      />

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Max Capacity",  value: formatWeight(vehicle.maxCapacity)       },
          { label: "Odometer",      value: formatOdometer(vehicle.currentOdometer) },
          { label: "Region",        value: vehicle.region ?? "—"                   },
          { label: "Type",          value: vehicle.type.charAt(0) + vehicle.type.slice(1).toLowerCase() },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
            <p className="text-base font-semibold text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Fuel Cost",         value: formatCurrency(vehicle.totalFuelCost),         color: "text-blue-600"   },
          { label: "Total Maintenance Cost",   value: formatCurrency(vehicle.totalMaintenanceCost),  color: "text-amber-600"  },
          { label: "Total Operational Cost",   value: formatCurrency(vehicle.totalOperationalCost),  color: "text-gray-900"   },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ai">
        <TabsList className="h-9">
          <TabsTrigger value="ai"          className="text-xs gap-1.5"><Brain  className="h-3.5 w-3.5" />AI Predictions</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs gap-1.5"><Wrench className="h-3.5 w-3.5" />Maintenance ({vehicle.maintenanceLogs.length})</TabsTrigger>
          <TabsTrigger value="fuel"        className="text-xs gap-1.5"><Fuel   className="h-3.5 w-3.5" />Fuel ({vehicle.fuelExpenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Predictive Maintenance Alerts</h3>
            <PredictionCard vehicleId={id} />
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Type","Description","Cost","Date","Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicle.maintenanceLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">No maintenance records</td></tr>
                ) : vehicle.maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{getMaintenanceTypeLabel(log.type)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{log.description}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(log.cost)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.serviceDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {log.isResolved ? "Resolved" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="mt-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Date","Liters","Cost/Liter","Total Cost","Odometer","Station"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicle.fuelExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">No fuel records</td></tr>
                ) : vehicle.fuelExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(exp.fuelDate)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{exp.liters} L</td>
                    <td className="px-4 py-3 text-xs text-gray-500">₹{exp.costPerLiter}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(exp.totalCost)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatOdometer(exp.odometerAtFuel)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-xs">{exp.station ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showRetire}
        onOpenChange={setShowRetire}
        title={vehicle.isRetired ? "Restore this vehicle?" : "Retire this vehicle?"}
        description={vehicle.isRetired
          ? `${vehicle.name} will be restored to AVAILABLE status.`
          : `${vehicle.name} will be retired and removed from dispatcher selections permanently.`}
        variant={vehicle.isRetired ? "default" : "danger"}
        confirmLabel={vehicle.isRetired ? "Restore" : "Retire Vehicle"}
        isLoading={processing}
        onConfirm={handleRetireRestore}
      />
    </div>
  );
}
