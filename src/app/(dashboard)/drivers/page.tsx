"use client";

import { useState }     from "react";
import { useRouter }    from "next/navigation";
import { Plus }         from "lucide-react";
import { toast }        from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { useDrivers, updateDriver } from "@/hooks/useDrivers";
import { DataTable }    from "@/components/shared/DataTable";
import { PageHeader }   from "@/components/layout/PageHeader";
import { Button }       from "@/components/ui/button";
import { StatusPill }   from "@/components/shared/StatusPill";
import { SafetyScoreRing }    from "@/components/drivers/SafetyScoreRing";
import { LicenseExpiryBadge } from "@/components/drivers/LicenseExpiryBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, ShieldOff, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Driver, DriverStatus } from "@prisma/client";

const STATUS_OPTS: { value: DriverStatus | "ALL"; label: string }[] = [
  { value: "ALL",       label: "All Drivers"  },
  { value: "ON_DUTY",   label: "On Duty"      },
  { value: "OFF_DUTY",  label: "Off Duty"     },
  { value: "SUSPENDED", label: "Suspended"    },
];

export default function DriversPage() {
  const router  = useRouter();
  const [filter, setFilter] = useState<DriverStatus | "ALL">("ALL");
  const { drivers, isLoading, refresh } = useDrivers({
    status: filter !== "ALL" ? filter : undefined,
  });

  const toggleSuspend = async (driver: Driver) => {
    try {
      const newStatus: DriverStatus = driver.status === "SUSPENDED" ? "OFF_DUTY" : "SUSPENDED";
      await updateDriver(driver.id, { status: newStatus });
      toast.success(`${driver.name} is now ${newStatus.replace("_", " ").toLowerCase()}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.name}</p>
          <p className="text-xs text-gray-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "licenseNumber",
      header: "License",
      cell: ({ row }) => (
        <div>
          <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{row.original.licenseNumber}</code>
          <div className="flex gap-1 mt-1 flex-wrap">
            {row.original.licenseCategory.map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0 rounded">{c}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "licenseExpiry",
      header: "License Expiry",
      cell: ({ row }) => <LicenseExpiryBadge expiryDate={row.original.licenseExpiry} />,
    },
    {
      accessorKey: "safetyScore",
      header: "Safety Score",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <SafetyScoreRing score={row.original.safetyScore} size={40} />
          <span className="text-xs text-gray-500">{row.original.completedTrips}/{row.original.totalTrips} trips</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusPill status={row.original.status} type="driver" />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="text-sm cursor-pointer"
              onClick={() => router.push(`/drivers/${row.original.id}`)}>
              <Eye className="h-3.5 w-3.5 mr-2" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm cursor-pointer"
              disabled={row.original.status === "ON_DUTY"}
              onClick={() => toggleSuspend(row.original)}>
              {row.original.status === "SUSPENDED"
                ? <><ShieldCheck className="h-3.5 w-3.5 mr-2 text-emerald-600" />Reinstate</>
                : <><ShieldOff   className="h-3.5 w-3.5 mr-2 text-red-500"     />Suspend</>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Driver Profiles"
        description="Compliance monitoring and safety management"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Driver Profiles" }]}
        actions={
          <Button size="sm" className="h-9 text-sm bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/drivers/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Driver
          </Button>
        }
      />
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as DriverStatus | "ALL")}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400 ml-auto">{drivers.length} drivers</span>
      </div>
      <DataTable columns={columns} data={drivers} isLoading={isLoading} searchPlaceholder="Search by name or license..." />
    </div>
  );
}
