"use client";

import { useState }         from "react";
import { useRouter }        from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast }            from "sonner";
import { type ColumnDef }   from "@tanstack/react-table";
import { useMaintenance, resolveMaintenanceLog } from "@/hooks/useMaintenance";
import { DataTable }        from "@/components/shared/DataTable";
import { ConfirmDialog }    from "@/components/shared/ConfirmDialog";
import { PageHeader }       from "@/components/layout/PageHeader";
import { Button }           from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, getMaintenanceTypeLabel } from "@/lib/utils";
import type { MaintenanceWithVehicle } from "@/types";

export default function MaintenancePage() {
  const router  = useRouter();
  const [filter,       setFilter]       = useState<"all" | "active" | "resolved">("all");
  const [resolveTarget,setResolveTarget]= useState<MaintenanceWithVehicle | null>(null);
  const [processing,   setProcessing]   = useState(false);

  const { logs, isLoading, refresh } = useMaintenance({
    isResolved: filter === "all" ? undefined : filter === "resolved",
  });

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setProcessing(true);
    try {
      await resolveMaintenanceLog(resolveTarget.id);
      toast.success(`${resolveTarget.vehicle.name} returned to fleet`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resolve");
    } finally {
      setProcessing(false);
      setResolveTarget(null);
    }
  };

  const columns: ColumnDef<MaintenanceWithVehicle>[] = [
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.vehicle.name}</p>
          <p className="text-xs text-gray-400">{row.original.vehicle.licensePlate}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="text-xs font-medium text-gray-700">{getMaintenanceTypeLabel(row.original.type)}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-xs text-gray-500 line-clamp-2 max-w-xs">{row.original.description}</span>,
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => <span className="text-sm font-medium text-gray-900">{formatCurrency(row.original.cost)}</span>,
    },
    {
      accessorKey: "serviceDate",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(row.original.serviceDate)}</span>,
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
      cell: ({ row }) => <span className="text-xs text-gray-400">{row.original.vendorName ?? "—"}</span>,
    },
    {
      accessorKey: "isResolved",
      header: "Status",
      cell: ({ row }) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.original.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {row.original.isResolved ? "Resolved" : "In Shop"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => !row.original.isResolved ? (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-200"
          onClick={() => setResolveTarget(row.original)}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Maintenance Logs"
        description="Service history and vehicle health tracking"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Maintenance Logs" }]}
        actions={
          <Button size="sm" className="h-9 text-sm bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/maintenance/new")}>
            <Plus className="h-4 w-4 mr-2" /> Log Service
          </Button>
        }
      />
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as "all"|"active"|"resolved")}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all"      className="text-xs">All Records</SelectItem>
            <SelectItem value="active"   className="text-xs">Active (In Shop)</SelectItem>
            <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 ml-auto">{logs.length} records</span>
      </div>
      <DataTable columns={columns} data={logs} isLoading={isLoading} searchPlaceholder="Search by vehicle or type..." />
      <ConfirmDialog
        open={!!resolveTarget} onOpenChange={(o) => !o && setResolveTarget(null)}
        title="Mark service as resolved?"
        description={`${resolveTarget?.vehicle.name} will be returned to the fleet with AVAILABLE status.`}
        variant="default" confirmLabel="Resolve & Return to Fleet"
        isLoading={processing} onConfirm={handleResolve} />
    </div>
  );
}
