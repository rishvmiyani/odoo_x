"use client";

import { useState }   from "react";
import { useRouter }  from "next/navigation";
import { Plus }       from "lucide-react";
import { toast }      from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import useSWR         from "swr";
import { DataTable }  from "@/components/shared/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button }     from "@/components/ui/button";
import { formatCurrency, formatDate, formatOdometer } from "@/lib/utils";
import type { FuelExpenseWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FuelExpensesPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR<{ data: FuelExpenseWithRelations[] }>("/api/fuel-expenses", fetcher);
  const expenses = data?.data ?? [];

  const totalCost = expenses.reduce((s, e) => s + e.totalCost, 0);

  const columns: ColumnDef<FuelExpenseWithRelations>[] = [
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
      accessorKey: "fuelDate",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(row.original.fuelDate)}</span>,
    },
    {
      accessorKey: "liters",
      header: "Liters",
      cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.liters} L</span>,
    },
    {
      accessorKey: "costPerLiter",
      header: "Rate",
      cell: ({ row }) => <span className="text-sm text-gray-600">₹{row.original.costPerLiter}/L</span>,
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }) => <span className="text-sm font-semibold text-gray-900">{formatCurrency(row.original.totalCost)}</span>,
    },
    {
      accessorKey: "odometerAtFuel",
      header: "Odometer",
      cell: ({ row }) => <span className="text-xs text-gray-500">{formatOdometer(row.original.odometerAtFuel)}</span>,
    },
    {
      accessorKey: "station",
      header: "Station",
      cell: ({ row }) => <span className="text-xs text-gray-400">{row.original.station ?? "—"}</span>,
    },
    {
      accessorKey: "trip",
      header: "Trip",
      cell: ({ row }) => row.original.trip ? (
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
          {(row.original.trip as { tripCode: string }).tripCode?.slice(-8) ?? "—"}
        </code>
      ) : <span className="text-xs text-gray-300">—</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fuel & Expenses"
        description="Fleet-wide fuel consumption and cost tracking"
        breadcrumbs={[{ label: "Command Center", href: "/dashboard" }, { label: "Fuel & Expenses" }]}
        actions={
          <Button size="sm" className="h-9 text-sm bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/fuel-expenses/new")}>
            <Plus className="h-4 w-4 mr-2" /> Log Fuel
          </Button>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Records",  value: expenses.length },
          { label: "Total Fuel Cost",value: formatCurrency(totalCost) },
          { label: "Total Liters",   value: `${expenses.reduce((s,e) => s + e.liters, 0).toFixed(0)} L` },
          { label: "Avg Cost/Fill",  value: expenses.length > 0 ? formatCurrency(totalCost / expenses.length) : "—" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={expenses} isLoading={isLoading} searchPlaceholder="Search by vehicle or station..." />
    </div>
  );
}
