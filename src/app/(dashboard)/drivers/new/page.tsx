"use client";

import { useState }    from "react";
import { useRouter }   from "next/navigation";
import { toast }       from "sonner";
import { useForm }     from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 }     from "lucide-react";
import { createDriver }from "@/hooks/useDrivers";
import { DriverCreateSchema, type DriverCreateInput } from "@/lib/validations/driver.schema";
import { PageHeader }  from "@/components/layout/PageHeader";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { Label }       from "@/components/ui/label";
import { Checkbox }    from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VehicleType } from "@prisma/client";

const VEHICLE_TYPES: VehicleType[] = ["TRUCK", "VAN", "BIKE"];

export default function NewDriverPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<DriverCreateInput>({ resolver: zodResolver(DriverCreateSchema), defaultValues: { licenseCategory: [], status: "OFF_DUTY" } });

  const categories = watch("licenseCategory") ?? [];

  const toggleCategory = (type: VehicleType) => {
    const updated = categories.includes(type)
      ? categories.filter((c) => c !== type)
      : [...categories, type];
    setValue("licenseCategory", updated);
  };

  const onSubmit = async (data: DriverCreateInput) => {
    setLoading(true);
    try {
      await createDriver({ ...data, licenseExpiry: new Date(data.licenseExpiry).toISOString() });
      toast.success("Driver added to system");
      router.push("/drivers");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Add New Driver"
        description="Register a driver and set license details"
        breadcrumbs={[
          { label: "Command Center",  href: "/dashboard" },
          { label: "Driver Profiles", href: "/drivers"   },
          { label: "Add Driver"                          },
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Ravi Kumar" className="h-9 text-sm" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="ravi@fleet.com" className="h-9 text-sm" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone</Label>
              <Input placeholder="e.g. 9876543210" className="h-9 text-sm" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">License Number <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. GJ0120190023456" className="h-9 text-sm" {...register("licenseNumber")} />
              {errors.licenseNumber && <p className="text-xs text-red-600">{errors.licenseNumber.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">License Categories <span className="text-red-500">*</span></Label>
              <div className="flex gap-4 mt-1">
                {VEHICLE_TYPES.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox id={type} checked={categories.includes(type)}
                      onCheckedChange={() => toggleCategory(type)} />
                    <label htmlFor={type} className="text-sm capitalize cursor-pointer">{type.toLowerCase()}</label>
                  </div>
                ))}
              </div>
              {errors.licenseCategory && <p className="text-xs text-red-600">{errors.licenseCategory.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">License Expiry <span className="text-red-500">*</span></Label>
              <Input type="date" min={new Date().toISOString().split("T")[0]} className="h-9 text-sm"
                {...register("licenseExpiry")} />
              {errors.licenseExpiry && <p className="text-xs text-red-600">{errors.licenseExpiry.message}</p>}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" className="h-9 text-sm bg-slate-900 hover:bg-slate-800 px-6" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Driver"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
