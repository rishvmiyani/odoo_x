"use client";

import { useState }      from "react";
import { useForm }       from "react-hook-form";
import { zodResolver }   from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { TripCreateSchema, type TripCreateInput } from "@/lib/validations/trip.schema";
import { useVehicles }   from "@/hooks/useVehicles";
import { useDrivers }    from "@/hooks/useDrivers";
import { Button }        from "@/components/ui/button";
import { Input }         from "@/components/ui/input";
import { Label }         from "@/components/ui/label";
import { Textarea }      from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatWeight, getLicenseExpiryStatus } from "@/lib/utils";
import type { Vehicle } from "@prisma/client";

interface TripFormProps {
  onSubmit:   (data: TripCreateInput) => Promise<void>;
  isLoading?: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [step,            setStep]            = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { register, handleSubmit, setValue, watch, trigger,
    formState: { errors } } = useForm<TripCreateInput>({ resolver: zodResolver(TripCreateSchema) });

  const cargoWeight = watch("cargoWeight");
  const vehicleId   = watch("vehicleId");
  const driverId    = watch("driverId");

  const { vehicles, isLoading: loadingVehicles } = useVehicles({
    onlyAvailable: true,
    minCapacity:   cargoWeight > 0 ? cargoWeight : undefined,
  });

  const { drivers, isLoading: loadingDrivers } = useDrivers({
    onlyAvailable: true,
    vehicleType:   selectedVehicle?.type,
  });

  const handleVehicleSelect = (id: string) => {
    setValue("vehicleId", id);
    setValue("driverId",  "");
    const found = vehicles.find((v) => v.id === id) ?? null;
    setSelectedVehicle(found);
  };

  const goToStep2 = async () => {
    const ok = await trigger(["originAddress","destinationAddress","cargoWeight","scheduledAt"]);
    if (ok) setStep(2);
  };

  const currentDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold transition-colors ${
              step === s ? "bg-slate-900 text-white" : step > s ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
            }`}>{s}</div>
            <span className={`text-sm ${step === s ? "font-medium text-gray-900" : "text-gray-400"}`}>
              {s === 1 ? "Route Details" : "Assignment"}
            </span>
            {s < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Origin Address <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Surat Warehouse, Ring Road" className="h-9 text-sm" {...register("originAddress")} />
              {errors.originAddress && <p className="text-xs text-red-600">{errors.originAddress.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Destination Address <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Ahmedabad Distribution Hub" className="h-9 text-sm" {...register("destinationAddress")} />
              {errors.destinationAddress && <p className="text-xs text-red-600">{errors.destinationAddress.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Cargo Weight (kg) <span className="text-red-500">*</span></Label>
                <Input type="number" min={1} placeholder="e.g. 3000" className="h-9 text-sm"
                  {...register("cargoWeight", { valueAsNumber: true })} />
                {errors.cargoWeight && <p className="text-xs text-red-600">{errors.cargoWeight.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Scheduled Date & Time <span className="text-red-500">*</span></Label>
                <Input type="datetime-local" min={currentDate} className="h-9 text-sm"
                  {...register("scheduledAt")} />
                {errors.scheduledAt && <p className="text-xs text-red-600">{errors.scheduledAt.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cargo Description</Label>
              <Textarea placeholder="Optional: describe the cargo" className="text-sm resize-none" rows={2}
                {...register("cargoDescription")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea placeholder="Optional: any special instructions" className="text-sm resize-none" rows={2}
                {...register("notes")} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" className="h-9 bg-slate-900 hover:bg-slate-800 text-sm px-6"
                onClick={goToStep2}>
                Next: Assign Vehicle <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Vehicle Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Available Vehicle <span className="text-red-500">*</span>
                {cargoWeight > 0 && <span className="text-gray-400 font-normal"> — filtered for {formatWeight(cargoWeight)} cargo</span>}
              </Label>
              {vehicles.length === 0 && !loadingVehicles ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    No available vehicle with sufficient capacity ({formatWeight(cargoWeight)}) found.
                  </p>
                </div>
              ) : (
                <Select value={vehicleId ?? ""} onValueChange={handleVehicleSelect}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={loadingVehicles ? "Loading vehicles..." : "Select a vehicle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-sm">
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="font-medium">{v.name}</span>
                          <span className="text-xs text-gray-400">{v.licensePlate} · Max {formatWeight(v.maxCapacity)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.vehicleId && <p className="text-xs text-red-600">{errors.vehicleId.message}</p>}
            </div>

            {/* Driver Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Available Driver <span className="text-red-500">*</span>
                {selectedVehicle && <span className="text-gray-400 font-normal"> — licensed for {selectedVehicle.type.toLowerCase()}</span>}
              </Label>
              {!selectedVehicle ? (
                <div className="h-9 border border-gray-200 rounded-md bg-gray-50 flex items-center px-3">
                  <span className="text-sm text-gray-400">Select a vehicle first</span>
                </div>
              ) : drivers.length === 0 && !loadingDrivers ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">No qualified drivers available for this vehicle type.</p>
                </div>
              ) : (
                <Select value={driverId ?? ""} onValueChange={(v) => setValue("driverId", v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={loadingDrivers ? "Loading drivers..." : "Select a driver"} />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => {
                      const expiryStatus = getLicenseExpiryStatus(d.licenseExpiry);
                      return (
                        <SelectItem key={d.id} value={d.id} className="text-sm"
                          disabled={expiryStatus === "EXPIRED"}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span className="font-medium">{d.name}</span>
                            <span className={`text-xs ${
                              expiryStatus === "EXPIRED"      ? "text-red-500 font-medium"  :
                              expiryStatus === "EXPIRING_SOON"? "text-amber-500"             : "text-gray-400"
                            }`}>
                              {expiryStatus === "EXPIRED"       ? "License Expired"    :
                               expiryStatus === "EXPIRING_SOON" ? "Expiring Soon"      :
                               `Score: ${d.safetyScore}`}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {errors.driverId && <p className="text-xs text-red-600">{errors.driverId.message}</p>}
            </div>

            {/* Assignment summary */}
            {selectedVehicle && driverId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 space-y-1">
                <p className="font-medium">Assignment Summary</p>
                <p>Vehicle: {selectedVehicle.name} · Capacity: {formatWeight(selectedVehicle.maxCapacity)}</p>
                <p>Cargo: {formatWeight(cargoWeight)} · Remaining capacity: {formatWeight(selectedVehicle.maxCapacity - cargoWeight)}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" className="h-9 text-sm"
                onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <Button type="submit" className="h-9 bg-slate-900 hover:bg-slate-800 text-sm px-6"
                disabled={isLoading || !vehicleId || !driverId}>
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Dispatching...</> : "Dispatch Trip"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
