"use client";

import { useState }    from "react";
import { useRouter }   from "next/navigation";
import { toast }       from "sonner";
import { createTrip }  from "@/hooks/useTrips";
import { TripForm }    from "@/components/trips/TripForm";
import { PageHeader }  from "@/components/layout/PageHeader";
import type { TripCreateInput } from "@/lib/validations/trip.schema";

export default function NewTripPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: TripCreateInput) => {
    setLoading(true);
    try {
      await createTrip({ ...data, scheduledAt: new Date(data.scheduledAt).toISOString() });
      toast.success("Trip dispatched successfully");
      router.push("/trips");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Create New Trip"
        description="Assign a vehicle and driver to dispatch cargo"
        breadcrumbs={[
          { label: "Command Center",  href: "/dashboard" },
          { label: "Trip Dispatcher", href: "/trips"     },
          { label: "Create New Trip"                      },
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TripForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
