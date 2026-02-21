import useSWR, { mutate } from "swr";
import type { TripStatus } from "@prisma/client";
import type { TripWithRelations } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
};

interface TripFilters {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(filters: TripFilters): string {
  const p = new URLSearchParams();
  if (filters.status)   p.set("status",   filters.status);
  if (filters.vehicleId)p.set("vehicleId",filters.vehicleId);
  if (filters.driverId) p.set("driverId", filters.driverId);
  if (filters.search)   p.set("search",   filters.search);
  if (filters.page)     p.set("page",     String(filters.page));
  if (filters.pageSize) p.set("pageSize", String(filters.pageSize));
  return p.toString() ? `?${p.toString()}` : "";
}

export function useTrips(filters: TripFilters = {}) {
  const query = buildQuery(filters);
  const { data, error, isLoading } = useSWR<{
    data: TripWithRelations[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/api/trips${query}`, fetcher);

  return {
    trips:    data?.data    ?? [],
    total:    data?.total   ?? 0,
    page:     data?.page    ?? 1,
    pageSize: data?.pageSize ?? 20,
    isLoading,
    error,
    refresh: () => mutate(`/api/trips${query}`),
  };
}

export function useTrip(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ data: TripWithRelations }>(
    id ? `/api/trips/${id}` : null,
    fetcher
  );
  return { trip: data?.data ?? null, isLoading, error, mutate: revalidate };
}

export async function createTrip(body: Record<string, unknown>) {
  const res  = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create trip");
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/trips"), undefined, { revalidate: true });
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/vehicles"), undefined, { revalidate: true });
  await mutate((key: string) => typeof key === "string" && key.startsWith("/api/drivers"), undefined, { revalidate: true });
  return json.data;
}

export async function completeTrip(
  id: string,
  body: { endOdometer: number; revenue: number; distanceKm?: number }
) {
  const res  = await fetch(`/api/trips/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete", ...body }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to complete trip");
  await mutate((key: string) => typeof key === "string" && (key.startsWith("/api/trips") || key.startsWith("/api/vehicles") || key.startsWith("/api/drivers")), undefined, { revalidate: true });
  return json.data;
}

export async function cancelTrip(id: string, cancelReason: string) {
  const res  = await fetch(`/api/trips/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", cancelReason }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to cancel trip");
  await mutate((key: string) => typeof key === "string" && (key.startsWith("/api/trips") || key.startsWith("/api/vehicles") || key.startsWith("/api/drivers")), undefined, { revalidate: true });
  return json.data;
}
