"use client";

import { useState }                     from "react";
import { useParams, useRouter }         from "next/navigation";
import { CheckCircle2, XCircle, Truck } from "lucide-react";
import { toast }                        from "sonner";
import { useTrip, completeTrip, cancelTrip } from "@/hooks/useTrips";
import { TripStatusPill }               from "@/components/trips/TripStatusPill";
import { PageHeader }                   from "@/components/layout/PageHeader";
import { ConfirmDialog }                from "@/components/shared/ConfirmDialog";
import { Button }                       from "@/components/ui/button";
import { Input }                        from "@/components/ui/input";
import { Label }                        from "@/components/ui/label";
import { Skeleton }                     from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDateTime, formatOdometer, formatWeight } from "@/lib/utils";

export default function TripDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { trip, isLoading, mutate } = useTrip(id);

  const [showComplete, setShowComplete] = useState(false);
  const [showCancel,   setShowCancel]   = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [endOdometer,  setEndOdometer]  = useState("");
  const [revenue,      setRevenue]      = useState("");
  const [processing,   setProcessing]   = useState(false);

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
  if (!trip) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Trip not found</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/trips")}>Back to Trips</Button>
    </div>
  );

  const handleComplete = async () => {
    if (!endOdometer) return;
    const endOdo = parseFloat(endOdometer);
    if (trip.startOdometer && endOdo < trip.startOdometer) {
      toast.error("End odometer cannot be less than start odometer");
      return;
    }
    setProcessing(true);
    try {
      await completeTrip(id, { endOdometer: endOdo, revenue: parseFloat(revenue) || 0 });
      toast.success("Trip marked as completed");
      mutate();
      setShowComplete(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to complete trip");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setProcessing(true);
    try {
      await cancelTrip(id, cancelReason);
      toast.success("Trip cancelled");
      mutate();
      setShowCancel(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel trip");
    } finally {
      setProcessing(false);
    }
  };

  const infoItems = [
    { label: "Vehicle",      value: trip.vehicle?.name          },
    { label: "License Plate",value: trip.vehicle?.licensePlate  },
    { label: "Driver",       value: trip.driver?.name           },
    { label: "Cargo Weight", value: formatWeight(trip.cargoWeight)},
    { label: "Scheduled",    value: formatDateTime(trip.scheduledAt) },
    { label: "Start Odometer",value: trip.startOdometer ? formatOdometer(trip.startOdometer) : "—" },
    { label: "End Odometer", value: trip.endOdometer  ? formatOdometer(trip.endOdometer)  : "—" },
    { label: "Distance",     value: trip.distanceKm   ? `${trip.distanceKm} km` : "—" },
    { label: "Revenue",      value: trip.revenue ? formatCurrency(trip.revenue) : "—" },
    { label: "Cargo Desc",   value: trip.cargoDescription ?? "—" },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title={`Trip ${trip.tripCode.slice(-10)}`}
        breadcrumbs={[
          { label: "Command Center",  href: "/dashboard" },
          { label: "Trip Dispatcher", href: "/trips"     },
          { label: trip.tripCode.slice(-10)               },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <TripStatusPill status={trip.status} />
            {trip.status === "DISPATCHED" && (
              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowComplete(true)}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete Trip
              </Button>
            )}
            {["DRAFT","DISPATCHED"].includes(trip.status) && (
              <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowCancel(true)}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel
              </Button>
            )}
          </div>
        }
      />

      {/* Route */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-blue-500" /> Route
        </h3>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <div className="h-8 w-0.5 bg-gray-200 my-1" />
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Origin</p>
              <p className="text-sm font-medium text-gray-900">{trip.originAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Destination</p>
              <p className="text-sm font-medium text-gray-900">{trip.destinationAddress}</p>
            </div>
          </div>
        </div>
        {trip.notes && (
          <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded p-2">{trip.notes}</p>
        )}
        {trip.cancelReason && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 rounded p-2">
            Cancelled: {trip.cancelReason}
          </p>
        )}
      </div>

      {/* Details grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Trip Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {infoItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
              <p className="text-sm text-gray-900 mt-0.5 font-medium">{item.value ?? "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Complete dialog */}
      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Complete Trip</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">End Odometer (km) <span className="text-red-500">*</span></Label>
              <Input type="number" min={trip.startOdometer ?? 0} placeholder={`Min: ${trip.startOdometer ?? 0}`}
                value={endOdometer} onChange={(e) => setEndOdometer(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Revenue Collected (₹)</Label>
              <Input type="number" min={0} placeholder="0" value={revenue}
                onChange={(e) => setRevenue(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowComplete(false)}>Cancel</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!endOdometer || processing} onClick={handleComplete}>
              {processing ? "Processing..." : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={showCancel} onOpenChange={setShowCancel}
        title="Cancel this trip?"
        description="This will release the vehicle and driver back to available status."
        variant="danger" confirmLabel="Cancel Trip" isLoading={processing}
        onConfirm={handleCancel}>
        <div className="mt-3">
          <Label className="text-xs">Reason <span className="text-red-500">*</span></Label>
          <Input className="mt-1 h-9 text-sm" value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation" />
        </div>
      </ConfirmDialog>
    </div>
  );
}
