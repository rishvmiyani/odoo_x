"use client";

import { useState }       from "react";
import { useRouter }      from "next/navigation";
import { Plus }           from "lucide-react";
import { toast }          from "sonner";
import { useForm }        from "react-hook-form";
import { useTrips, cancelTrip } from "@/hooks/useTrips";
import { TripTable }      from "@/components/trips/TripTable";
import { PageHeader }     from "@/components/layout/PageHeader";
import { ConfirmDialog }  from "@/components/shared/ConfirmDialog";
import { Button }         from "@/components/ui/button";
import { Input }          from "@/components/ui/input";
import { Label }          from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { TripStatus }        from "@prisma/client";
import type { TripWithRelations } from "@/types";

const STATUS_OPTIONS: { value: TripStatus | "ALL"; label: string }[] = [
  { value: "ALL",        label: "All Statuses" },
  { value: "DRAFT",      label: "Draft"        },
  { value: "DISPATCHED", label: "Dispatched"   },
  { value: "COMPLETED",  label: "Completed"    },
  { value: "CANCELLED",  label: "Cancelled"    },
];

export default function TripsPage() {
  const router = useRouter();
  const [statusFilter,  setStatusFilter]  = useState<TripStatus | "ALL">("ALL");
  const [cancelTarget,  setCancelTarget]  = useState<TripWithRelations | null>(null);
  const [cancelReason,  setCancelReason]  = useState("");
  const [isProcessing,  setIsProcessing]  = useState(false);

  const { trips, total, isLoading, refresh } = useTrips({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setIsProcessing(true);
    try {
      await cancelTrip(cancelTarget.id, cancelReason);
      toast.success("Trip cancelled successfully");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel trip");
    } finally {
      setIsProcessing(false);
      setCancelTarget(null);
      setCancelReason("");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trip Dispatcher"
        description="Manage fleet trips and cargo assignments"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Trip Dispatcher" }]}
        actions={
          <Button size="sm" className="h-9 text-sm bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/trips/new")}>
            <Plus className="h-4 w-4 mr-2" /> Create Trip
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TripStatus | "ALL")}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 ml-auto">{total} trips</span>
      </div>

      <TripTable trips={trips} isLoading={isLoading}
        onCancel={(trip) => { setCancelTarget(trip); setCancelReason(""); }} />

      {/* Cancel dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Cancel Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">
              Cancelling <span className="font-medium text-gray-900">{cancelTarget?.tripCode.slice(-10)}</span>.
              This will release the vehicle and driver.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason for cancellation <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Customer cancelled order"
                value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>Back</Button>
            <Button variant="destructive" size="sm" disabled={!cancelReason.trim() || isProcessing}
              onClick={handleCancel}>
              {isProcessing ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
