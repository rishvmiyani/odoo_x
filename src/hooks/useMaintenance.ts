import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMaintenance(params?: { isResolved?: boolean }) {
  const query = params?.isResolved !== undefined
    ? `?isResolved=${params.isResolved}`
    : "";

  const { data, isLoading, mutate } = useSWR(
    `/api/maintenance${query}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  return {
    logs:      data?.data ?? [],
    isLoading,
    refresh:   mutate,
  };
}

export async function createMaintenanceLog(data: Record<string, unknown>) {
  const res  = await fetch("/api/maintenance", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create log");
  return json.data;
}

export async function resolveMaintenanceLog(id: string) {
  const res  = await fetch(`/api/maintenance/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action: "resolve" }),   // ← sends action field
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to resolve");
  return json.data;
}
