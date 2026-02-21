"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter }      from "next/navigation";
import { MoreHorizontal, Eye, XCircle } from "lucide-react";
import type { TripWithRelations }       from "@/types";
import { DataTable }      from "@/components/shared/DataTable";
import { TripStatusPill } from "./TripStatusPill";
import { Button }         from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDateTime, formatWeight, truncateText } from "@/lib/utils";

interface TripTableProps {
  trips:     TripWithRelations[];
  isLoading: boolean;
  onCancel:  (trip: TripWithRelations) => void;
}

export function TripTable({ trips, isLoading, onCancel }: TripTableProps) {
  const router = useRouter();

  const columns: ColumnDef<TripWithRelations>[] = [
    {
      accessorKey: "tripCode",
      header: "Trip Code",
      cell: ({ row }) => (
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
          {row.original.tripCode.slice(-10)}
        </code>
      ),
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.vehicle?.name ?? "—"}</p>
          <p className="text-xs text-gray-400">{row.original.vehicle?.licensePlate}</p>
        </div>
      ),
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.driver?.name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "originAddress",
      header: "Route",
      cell: ({ row }) => (
        <div>
          <p className="text-xs text-gray-700">{truncateText(row.original.originAddress, 25)}</p>
          <p className="text-xs text-gray-400">→ {truncateText(row.original.destinationAddress, 25)}</p>
        </div>
      ),
    },
    {
      accessorKey: "cargoWeight",
      header: "Cargo",
      cell: ({ row }) => <span className="text-sm text-gray-600">{formatWeight(row.original.cargoWeight)}</span>,
    },
    {
      accessorKey: "scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatDateTime(row.original.scheduledAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TripStatusPill status={row.original.status} />,
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
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem className="text-sm cursor-pointer"
              onClick={() => router.push(`/trips/${row.original.id}`)}>
              <Eye className="h-3.5 w-3.5 mr-2" /> View Details
            </DropdownMenuItem>
            {["DRAFT", "DISPATCHED"].includes(row.original.status) && (
              <DropdownMenuItem className="text-sm text-red-600 cursor-pointer"
                onClick={() => onCancel(row.original)}>
                <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel Trip
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
      data={trips}
      isLoading={isLoading}
      searchPlaceholder="Search by code, origin or destination..."
    />
  );
}
