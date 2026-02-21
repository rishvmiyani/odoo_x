"use client";

import { useState }       from "react";
import { useRouter }      from "next/navigation";
import { toast }          from "sonner";
import { createVehicle }  from "@/hooks/useVehicles";
import { VehicleForm }    from "@/components/vehicles/VehicleForm";
import { PageHeader }     from "@/components/layout/PageHeader";
import type { VehicleCreateInput } from "@/lib/validations/vehicle.schema";

export default function NewVehiclePage() {
  const router     = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: VehicleCreateInput) => {
    setLoading(true);
    try {
      await createVehicle({
        ...data,
        acquisitionDate: data.acquisitionDate
          ? new Date(data.acquisitionDate).toISOString()
          : null,
      });
      toast.success("Vehicle added to fleet");
      router.push("/vehicles");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Add New Vehicle"
        description="Register a new asset to the fleet"
        breadcrumbs={[
          { label: "Command Center",   href: "/dashboard" },
          { label: "Vehicle Registry", href: "/vehicles"  },
          { label: "Add New Vehicle"                       },
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <VehicleForm onSubmit={handleSubmit} isLoading={loading} submitLabel="Add to Fleet" />
      </div>
    </div>
  );
}
