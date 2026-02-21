"use client";

import { useState }              from "react";
import { useRouter }             from "next/navigation";
import { toast }                 from "sonner";
import { createMaintenanceLog }  from "@/hooks/useMaintenance";
import { MaintenanceForm }       from "@/components/maintenance/MaintenanceForm";
import { PageHeader }            from "@/components/layout/PageHeader";
import type { MaintenanceCreateInput } from "@/lib/validations/maintenance.schema";

export default function NewMaintenancePage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: MaintenanceCreateInput) => {
    setLoading(true);
    try {
      await createMaintenanceLog({ ...data, serviceDate: new Date(data.serviceDate).toISOString() });
      toast.success("Service logged. Vehicle status set to In Shop.");
      router.push("/maintenance");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Log Service"
        description="Record a maintenance or repair event"
        breadcrumbs={[
          { label: "Command Center",  href: "/dashboard"   },
          { label: "Maintenance Logs",href: "/maintenance" },
          { label: "Log Service"                           },
        ]}
      />
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        Logging a service will automatically set the vehicle status to <strong>In Shop</strong> and remove it from dispatcher selections.
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MaintenanceForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
