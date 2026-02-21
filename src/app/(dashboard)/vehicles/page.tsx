"use client";

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { Plus }              from "lucide-react";
import { toast }             from "sonner";
import { useVehicles, retireVehicle, restoreVehicle } from "@/hooks/useVehicles";
import { VehicleTable }      from "@/components/vehicles/VehicleTable";
import { PageHeader }        from "@/components/layout/PageHeader";
import { ConfirmDialog }     from "@/components/shared/ConfirmDialog";
import { Button }            from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle, VehicleStatus, VehicleType } from "@prisma/client";

const STATUS_OPTIONS: { value: VehicleStatus | "ALL"; label: string }[] = [
  { value: "ALL",            label: "All Statuses"    },
  { value: "AVAILABLE",      label: "Available"       },
  { value: "ON_TRIP",        label: "On Trip"         },
  { value: "IN_SHOP",        label: "In Shop"         },
  { value: "OUT_OF_SERVICE", label: "Out of Service"  },
];

const TYPE_OPTIONS: { value: VehicleType | "ALL"; label: string }[] = [
  { value: "ALL",   label: "All Types" },
  { value: "TRUCK", label: "Truck"     },
  { value: "VAN",   label: "Van"       },
  { value: "BIKE",  label: "Bike"      },
];

export default function VehiclesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "ALL">("ALL");
  const [typeFilter,   setTypeFilter]   = useState<VehicleType   | "ALL">("ALL");
  const [actionTarget, setActionTarget] = useState<Vehicle | null>(null);
  const [actionType,   setActionType]   = useState<"retire" | "restore">("retire");
  const [isProcessing, setIsProcessing] = useState(false);

  const { vehicles, isLoading, refresh } = useVehicles({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    type:   typeFilter   !== "ALL" ? typeFilter   : undefined,
  });

  const handleConfirm = async () => {
    if (!actionTarget) return;
    setIsProcessing(true);
    try {
      if (actionType === "retire") {
        await retireVehicle(actionTarget.id);
        toast.success(`${actionTarget.name} marked as retired`);
      } else {
        await restoreVehicle(actionTarget.id);
        toast.success(`${actionTarget.name} restored to fleet`);
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setIsProcessing(false);
      setActionTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicle Registry"
        description="Manage and monitor all fleet assets"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Vehicle Registry" }]}
        actions={
          <Button size="sm" className="h-9 text-sm bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/vehicles/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus | "ALL")}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as VehicleType | "ALL")}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 ml-auto">{vehicles.length} vehicles</span>
      </div>

      <VehicleTable
        vehicles={vehicles}
        isLoading={isLoading}
        onRetire={(v) => { setActionTarget(v); setActionType("retire");  }}
        onRestore={(v) => { setActionTarget(v); setActionType("restore"); }}
      />

      <ConfirmDialog
        open={!!actionTarget}
        onOpenChange={(o) => !o && setActionTarget(null)}
        title={actionType === "retire" ? "Retire this vehicle?" : "Restore this vehicle?"}
        description={
          actionType === "retire"
            ? `${actionTarget?.name} will be marked as retired and removed from all dispatcher selections.`
            : `${actionTarget?.name} will be restored to the fleet with AVAILABLE status.`
        }
        variant={actionType === "retire" ? "danger" : "default"}
        confirmLabel={actionType === "retire" ? "Retire Vehicle" : "Restore Vehicle"}
        isLoading={isProcessing}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
