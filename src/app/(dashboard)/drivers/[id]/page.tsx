"use client";

import { useState }     from "react";
import { useParams, useRouter } from "next/navigation";
import { toast }        from "sonner";
import { ShieldOff, ShieldCheck, Navigation } from "lucide-react";
import { useDriver, updateDriver } from "@/hooks/useDrivers";
import { SafetyScoreRing }    from "@/components/drivers/SafetyScoreRing";
import { LicenseExpiryBadge } from "@/components/drivers/LicenseExpiryBadge";
import { PageHeader }         from "@/components/layout/PageHeader";
import { ConfirmDialog }      from "@/components/shared/ConfirmDialog";
import { StatusPill }         from "@/components/shared/StatusPill";
import { Skeleton }           from "@/components/ui/skeleton";
import { Button }             from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripStatusPill }     from "@/components/trips/TripStatusPill";
import { formatCurrency, formatDateTime, formatWeight } from "@/lib/utils";

export default function DriverDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { driver, isLoading, mutate } = useDriver(id);
  const [showSuspend, setShowSuspend] = useState(false);
  const [processing,  setProcessing]  = useState(false);

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!driver) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Driver not found</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/drivers")}>
        Back to Drivers
      </Button>
    </div>
  );

  const isSuspended = driver.status === "SUSPENDED";

  const handleSuspendToggle = async () => {
    setProcessing(true);
    try {
      const newStatus = isSuspended ? "OFF_DUTY" : "SUSPENDED";
      await updateDriver(id, { status: newStatus });
      toast.success(isSuspended ? `${driver.name} reinstated` : `${driver.name} suspended`);
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setProcessing(false);
      setShowSuspend(false);
    }
  };

  const safetyBreakdown = driver.safetyBreakdown;

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title={driver.name}
        description={`License: ${driver.licenseNumber}`}
        breadcrumbs={[
          { label: "Command Center",  href: "/dashboard" },
          { label: "Driver Profiles", href: "/drivers"   },
          { label: driver.name                           },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill status={driver.status} type="driver" />
            {driver.status !== "ON_DUTY" && (
              <Button size="sm" variant="outline"
                className={`h-8 text-xs ${isSuspended ? "text-emerald-600 border-emerald-200" : "text-red-600 border-red-200"}`}
                onClick={() => setShowSuspend(true)}>
                {isSuspended
                  ? <><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Reinstate</>
                  : <><ShieldOff   className="h-3.5 w-3.5 mr-1.5" />Suspend</>}
              </Button>
            )}
          </div>
        }
      />

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Safety Ring */}
          <div className="flex flex-col items-center gap-1">
            <SafetyScoreRing score={driver.safetyScore} size={72} />
            <span className="text-xs text-gray-400 font-medium">Safety Score</span>
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 min-w-0">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p>
              <p className="text-sm text-gray-900 mt-0.5">{driver.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone</p>
              <p className="text-sm text-gray-900 mt-0.5">{driver.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total Trips</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {driver.completedTrips} / {driver.totalTrips}
                <span className="text-xs text-gray-400 font-normal"> completed</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">License Category</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {driver.licenseCategory.map((c) => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">License Expiry</p>
              <div className="mt-1">
                <LicenseExpiryBadge expiryDate={driver.licenseExpiry} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Score Breakdown */}
      {safetyBreakdown && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Safety Score Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Trip Completion",    value: safetyBreakdown.tripCompletionRate,  max: 40, color: "bg-blue-500"    },
              { label: "On-Time Rate",       value: safetyBreakdown.onTimeRate,          max: 30, color: "bg-emerald-500" },
              { label: "License Validity",   value: safetyBreakdown.licenseValidity,     max: 20, color: "bg-amber-500"   },
              { label: "Incident Deduction", value: safetyBreakdown.incidentDeduction,   max: 10, color: "bg-red-500"     },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {item.value.toFixed(1)}/{item.max}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.color}`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Total: <span className="font-semibold text-gray-700">{driver.safetyScore.toFixed(1)} / 100</span>
          </p>
        </div>
      )}

      {/* Tabs: Trip History */}
      <Tabs defaultValue="trips">
        <TabsList className="h-9">
          <TabsTrigger value="trips" className="text-xs gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> Trip History ({driver.trips?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Trip Code","Route","Cargo","Scheduled","Revenue","Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!driver.trips || driver.trips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                      No trips recorded for this driver
                    </td>
                  </tr>
                ) : driver.trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                        {trip.tripCode.slice(-9)}
                      </code>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs text-gray-700 truncate">{trip.originAddress}</p>
                      <p className="text-xs text-gray-400 truncate">→ {trip.destinationAddress}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatWeight(trip.cargoWeight)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(trip.scheduledAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">
                      {trip.revenue ? formatCurrency(trip.revenue) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <TripStatusPill status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showSuspend}
        onOpenChange={setShowSuspend}
        title={isSuspended ? "Reinstate this driver?" : "Suspend this driver?"}
        description={
          isSuspended
            ? `${driver.name} will be returned to OFF_DUTY status and can be assigned trips again.`
            : `${driver.name} will be suspended and blocked from all new trip assignments.`
        }
        variant={isSuspended ? "default" : "danger"}
        confirmLabel={isSuspended ? "Reinstate Driver" : "Suspend Driver"}
        isLoading={processing}
        onConfirm={handleSuspendToggle}
      />
    </div>
  );
}
