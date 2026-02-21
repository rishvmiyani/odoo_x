"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, ArchiveX, RotateCcw } from "lucide-react";
import type { Vehicle } from "@prisma/client";
import { DataTable }           from "@/components/shared/DataTable";
import { VehicleStatusBadge }  from "./VehicleStatusBadge";
import { Button }              from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatOdometer, formatWeight } from "@/lib/utils";

interface VehicleTableProps {
  vehicles:  Vehicle[];
  isLoading: boolean;
  onRetire:  (v: Vehicle) => void;
  onRestore: (v: Vehicle) => void;
}

export function VehicleTable({ vehicles, isLoading, onRetire, onRestore }: VehicleTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "name",
      header: "Vehicle",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          <p className="text-xs text-gray-400">{row.original.model}</p>
        </div>
      ),
    },
    {
      accessorKey: "licensePlate",
      header: "License Plate",
      cell: ({ row }) => (
        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono tracking-wider">
          {row.original.licensePlate}
        </code>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-gray-700 capitalize">
          {row.original.type.toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: "maxCapacity",
      header: "Max Capacity",
      cell: ({ row }) => <span className="text-sm text-gray-700">{formatWeight(row.original.maxCapacity)}</span>,
    },
    {
      accessorKey: "currentOdometer",
      header: "Odometer",
      cell: ({ row }) => <span className="text-sm text-gray-600">{formatOdometer(row.original.currentOdometer)}</span>,
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.region ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <VehicleStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 data-[state=open]:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => router.push(`/vehicles/${row.original.id}`)}>
              <Eye className="h-3.5 w-3.5 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.isRetired ? (
              <DropdownMenuItem className="text-sm text-emerald-600 cursor-pointer" onClick={() => onRestore(row.original)}>
                <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-sm text-red-600 cursor-pointer"
                onClick={() => onRetire(row.original)}
                disabled={row.original.status === "ON_TRIP"}>
                <ArchiveX className="h-3.5 w-3.5 mr-2" /> Retire
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={vehicles}
      isLoading={isLoading}
      searchPlaceholder="Search by name or plate..."
    />
  );
}
