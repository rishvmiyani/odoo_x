"use client";

import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 }   from "lucide-react";
import { MaintenanceCreateSchema, type MaintenanceCreateInput } from "@/lib/validations/maintenance.schema";
import { useVehicles } from "@/hooks/useVehicles";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMaintenanceTypeLabel } from "@/lib/utils";
import type { MaintenanceType } from "@prisma/client";

const TYPES: MaintenanceType[] = ["OIL_CHANGE","TIRE_ROTATION","BRAKE_SERVICE","ENGINE_REPAIR","INSPECTION","OTHER"];

interface Props { onSubmit: (d: MaintenanceCreateInput) => Promise<void>; isLoading?: boolean; }

export function MaintenanceForm({ onSubmit, isLoading }: Props) {
  const { vehicles } = useVehicles({ excludeRetired: true });
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<MaintenanceCreateInput>({ resolver: zodResolver(MaintenanceCreateSchema) });

  const today = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vehicle <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("vehicleId", v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-sm">
                  {v.name} — {v.licensePlate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleId && <p className="text-xs text-red-600">{errors.vehicleId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Service Type <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("type", v as MaintenanceType)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-sm">{getMaintenanceTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Description <span className="text-red-500">*</span></Label>
          <Textarea placeholder="Describe the service performed..." rows={2}
            className="text-sm resize-none" {...register("description")} />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Service Cost (₹) <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} placeholder="e.g. 5000" className="h-9 text-sm"
            {...register("cost", { valueAsNumber: true })} />
          {errors.cost && <p className="text-xs text-red-600">{errors.cost.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Service Date <span className="text-red-500">*</span></Label>
          <Input type="datetime-local" max={today} className="h-9 text-sm" {...register("serviceDate")} />
          {errors.serviceDate && <p className="text-xs text-red-600">{errors.serviceDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Next Service At (km)</Label>
          <Input type="number" min={1} placeholder="e.g. 65000" className="h-9 text-sm"
            {...register("nextServiceKm", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vendor Name</Label>
          <Input placeholder="e.g. Sai Motors Surat" className="h-9 text-sm" {...register("vendorName")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Invoice Reference</Label>
          <Input placeholder="e.g. INV-2026-001" className="h-9 text-sm" {...register("invoiceRef")} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-9 text-sm bg-slate-900 hover:bg-slate-800 px-6" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Logging...</> : "Log Service"}
        </Button>
      </div>
    </form>
  );
}
