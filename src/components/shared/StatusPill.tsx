import { cn, getVehicleStatusColor, getTripStatusColor, getDriverStatusColor } from "@/lib/utils";

interface StatusPillProps {
  status: string;
  type:   "vehicle" | "trip" | "driver";
}

export function StatusPill({ status, type }: StatusPillProps) {
  const colorClass =
    type === "vehicle" ? getVehicleStatusColor(status) :
    type === "trip"    ? getTripStatusColor(status)    :
                         getDriverStatusColor(status);

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", colorClass)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
