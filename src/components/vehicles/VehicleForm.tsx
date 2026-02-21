"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { VehicleCreateSchema, type VehicleCreateInput } from "@/lib/validations/vehicle.schema";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle, VehicleType } from "@prisma/client";

interface VehicleFormProps {
  defaultValues?: Partial<Vehicle>;
  onSubmit:       (data: VehicleCreateInput) => Promise<void>;
  isLoading?:     boolean;
  submitLabel?:   string;
}

const VEHICLE_TYPES: VehicleType[] = ["TRUCK", "VAN", "BIKE"];
const REGIONS = ["North", "South", "East", "West", "Central"];

export function VehicleForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save Vehicle" }: VehicleFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VehicleCreateInput>({
    resolver: zodResolver(VehicleCreateSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          acquisitionDate: defaultValues.acquisitionDate
            ? new Date(defaultValues.acquisitionDate).toISOString().split("T")[0]
            : undefined,
        }
      : { currentOdometer: 0, acquisitionCost: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vehicle Name <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g. Truck Alpha" className="h-9 text-sm" {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Model <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g. Tata LPT 1613" className="h-9 text-sm" {...register("model")} />
          {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">License Plate <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g. GJ-01-AA-1001" className="h-9 text-sm uppercase"
            {...register("licensePlate")} onChange={(e) => setValue("licensePlate", e.target.value.toUpperCase())} />
          {errors.licensePlate && <p className="text-xs text-red-600">{errors.licensePlate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vehicle Type <span className="text-red-500">*</span></Label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as VehicleType)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t} className="text-sm capitalize">{t.toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Max Capacity (kg) <span className="text-red-500">*</span></Label>
          <Input type="number" min={1} placeholder="e.g. 5000" className="h-9 text-sm"
            {...register("maxCapacity", { valueAsNumber: true })} />
          {errors.maxCapacity && <p className="text-xs text-red-600">{errors.maxCapacity.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Current Odometer (km)</Label>
          <Input type="number" min={0} placeholder="0" className="h-9 text-sm"
            {...register("currentOdometer", { valueAsNumber: true })} />
          {errors.currentOdometer && <p className="text-xs text-red-600">{errors.currentOdometer.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Region</Label>
          <Select value={watch("region") ?? ""} onValueChange={(v) => setValue("region", v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select region" /></SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Acquisition Cost (₹)</Label>
          <Input type="number" min={0} placeholder="0" className="h-9 text-sm"
            {...register("acquisitionCost", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Acquisition Date</Label>
          <Input type="date" className="h-9 text-sm" {...register("acquisitionDate")} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-9 text-sm bg-slate-900 hover:bg-slate-800 px-6" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
