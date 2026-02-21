import useSWR, { mutate } from "swr";
import type { Vehicle, VehicleStatus, VehicleType } from "@prisma/client";
import type { VehicleWithRelations } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
};

interface VehicleFilters {
  type?: VehicleType;
  status?: VehicleStatus;
  region?: string;
  search?: string;
  onlyAvailable?: boolean;
  minCapacity?: number;
  excludeRetired?: boolean;
}

function buildQuery(filters: VehicleFilters): string {
  const p = new URLSearchParams();
  if (filters.type)                      p.set("type",          filters.type);
  if (filters.status)                    p.set("status",        filters.status);
  if (filters.region)                    p.set("region",        filters.region);
  if (filters.search)                    p.set("search",        filters.search);
  if (filters.onlyAvailable)             p.set("onlyAvailable", "true");
  if (filters.minCapacity)               p.set("minCapacity",   String(filters.minCapacity));
  if (filters.excludeRetired === false)  p.set("excludeRetired","false");
  return p.toString() ? `?${p.toString()}` : "";
}

export function useVehicles(filters: VehicleFilters = {}) {
  const query = buildQuery(filters);
  const { data, error, isLoading } = useSWR<{ data: Vehicle[] }>(
    `/api/vehicles${query}`,
    fetcher
  );
  return {
    vehicles: data?.data ?? [],
    isLoading,
    error,
    refresh: () => mutate(`/api/vehicles${query}`),
  };
}

export function useVehicle(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ data: VehicleWithRelations & { totalFuelCost: number; totalMaintenanceCost: number; totalOperationalCost: number } }>(
    id ? `/api/vehicles/${id}` : null,
    fetcher
  );
  return { vehicle: data?.data ?? null, isLoading, error, mutate: revalidate };
}

export async function createVehicle(body: Record<string, unknown>) {
  const res  = await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create vehicle");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/vehicles"), undefined, { revalidate: true });
  return json.data;
}

export async function updateVehicle(id: string, body: Record<string, unknown>) {
  const res  = await fetch(`/api/vehicles/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to update vehicle");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/vehicles"), undefined, { revalidate: true });
  return json.data;
}

export async function deleteVehicle(id: string) {
  const res  = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to delete vehicle");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/vehicles"), undefined, { revalidate: true });
  return json.data;
}

export const retireVehicle  = (id: string) => updateVehicle(id, { action: "retire" });
export const restoreVehicle = (id: string) => updateVehicle(id, { action: "restore" });
