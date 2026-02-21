"use client";

import { useState }    from "react";
import { useRouter }   from "next/navigation";
import { toast }       from "sonner";
import { useForm }     from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 }     from "lucide-react";
import { FuelExpenseCreateSchema, type FuelExpenseCreateInput } from "@/lib/validations/fuel.schema";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips }    from "@/hooks/useTrips";
import { PageHeader }  from "@/components/layout/PageHeader";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { Label }       from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function NewFuelExpensePage() {
  const router    = useRouter();
  const [loading, setLoading] = useState(false);
  const { vehicles } = useVehicles({ excludeRetired: true });
  const { trips }    = useTrips({ status: "COMPLETED" });

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<FuelExpenseCreateInput>({ resolver: zodResolver(FuelExpenseCreateSchema) });

  const liters      = watch("liters")      || 0;
  const costPerLiter = watch("costPerLiter") || 0;
  const liveTotal   = Number((liters * costPerLiter).toFixed(2));

  const onSubmit = async (data: FuelExpenseCreateInput) => {
    setLoading(true);
    try {
      const res  = await fetch("/api/fuel-expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fuelDate: new Date(data.fuelDate).toISOString() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Fuel expense logged");
      router.push("/fuel-expenses");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log fuel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Log Fuel Expense"
        description="Record a fuel fill-up for a vehicle"
        breadcrumbs={[
          { label: "Command Center", href: "/dashboard"     },
          { label: "Fuel & Expenses",href: "/fuel-expenses" },
          { label: "Log Fuel"                               },
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Vehicle <span className="text-red-500">*</span></Label>
              <Select onValueChange={(v) => setValue("vehicleId", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id} className="text-sm">{v.name} — {v.licensePlate}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.vehicleId && <p className="text-xs text-red-600">{errors.vehicleId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Liters Filled <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" min={0.1} placeholder="e.g. 45" className="h-9 text-sm"
                {...register("liters", { valueAsNumber: true })} />
              {errors.liters && <p className="text-xs text-red-600">{errors.liters.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cost per Liter (₹) <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" min={0} placeholder="e.g. 95.50" className="h-9 text-sm"
                {...register("costPerLiter", { valueAsNumber: true })} />
              {errors.costPerLiter && <p className="text-xs text-red-600">{errors.costPerLiter.message}</p>}
            </div>
            {liveTotal > 0 && (
              <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Computed Total: <span className="font-bold">{formatCurrency(liveTotal)}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Odometer at Fill (km) <span className="text-red-500">*</span></Label>
              <Input type="number" min={0} placeholder="Current reading" className="h-9 text-sm"
                {...register("odometerAtFuel", { valueAsNumber: true })} />
              {errors.odometerAtFuel && <p className="text-xs text-red-600">{errors.odometerAtFuel.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Fuel Date <span className="text-red-500">*</span></Label>
              <Input type="datetime-local" max={new Date().toISOString().slice(0,16)} className="h-9 text-sm"
                {...register("fuelDate")} />
              {errors.fuelDate && <p className="text-xs text-red-600">{errors.fuelDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Fuel Station</Label>
              <Input placeholder="e.g. Indian Oil, NH-48" className="h-9 text-sm" {...register("station")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Link to Trip (optional)</Label>
              <Select onValueChange={(v) => setValue("tripId", v === "none" ? undefined : v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select trip (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">No trip</SelectItem>
                  {trips.slice(0, 20).map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-sm">
                      {t.tripCode.slice(-10)} — {t.vehicle?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="h-9 text-sm bg-slate-900 hover:bg-slate-800 px-6" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
