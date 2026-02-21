import useSWR from "swr";
import type { AnalyticsSummary } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
};

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
  driverId?: string;
}

function buildQuery(filters: AnalyticsFilters): string {
  const p = new URLSearchParams();
  if (filters.startDate) p.set("startDate", filters.startDate);
  if (filters.endDate)   p.set("endDate",   filters.endDate);
  if (filters.vehicleId) p.set("vehicleId", filters.vehicleId);
  if (filters.driverId)  p.set("driverId",  filters.driverId);
  return p.toString() ? `?${p.toString()}` : "";
}

export function useAnalytics(filters: AnalyticsFilters = {}) {
  const query = buildQuery(filters);
  const { data, error, isLoading } = useSWR<{ data: AnalyticsSummary }>(
    `/api/analytics${query}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { analytics: data?.data ?? null, isLoading, error };
}
