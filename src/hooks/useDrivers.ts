import useSWR, { mutate } from "swr";
import type { Driver, DriverStatus } from "@prisma/client";
import type { DriverWithTrips, SafetyScoreBreakdown } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
};

interface DriverFilters {
  status?: DriverStatus;
  search?: string;
  onlyAvailable?: boolean;
  vehicleType?: string;
}

function buildQuery(filters: DriverFilters): string {
  const p = new URLSearchParams();
  if (filters.status)        p.set("status",       filters.status);
  if (filters.search)        p.set("search",       filters.search);
  if (filters.onlyAvailable) p.set("onlyAvailable","true");
  if (filters.vehicleType)   p.set("vehicleType",  filters.vehicleType);
  return p.toString() ? `?${p.toString()}` : "";
}

export function useDrivers(filters: DriverFilters = {}) {
  const query = buildQuery(filters);
  const { data, error, isLoading } = useSWR<{ data: Driver[] }>(
    `/api/drivers${query}`,
    fetcher
  );
  return {
    drivers: data?.data ?? [],
    isLoading,
    error,
    refresh: () => mutate(`/api/drivers${query}`),
  };
}

export function useDriver(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{
    data: DriverWithTrips & { safetyBreakdown: SafetyScoreBreakdown };
  }>(id ? `/api/drivers/${id}` : null, fetcher);
  return { driver: data?.data ?? null, isLoading, error, mutate: revalidate };
}

export async function createDriver(body: Record<string, unknown>) {
  const res  = await fetch("/api/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create driver");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/drivers"), undefined, { revalidate: true });
  return json.data;
}

export async function updateDriver(id: string, body: Record<string, unknown>) {
  const res  = await fetch(`/api/drivers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to update driver");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/drivers"), undefined, { revalidate: true });
  return json.data;
}
