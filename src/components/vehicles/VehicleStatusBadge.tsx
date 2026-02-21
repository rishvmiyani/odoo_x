import { StatusPill } from "@/components/shared/StatusPill";
import type { VehicleStatus } from "@prisma/client";

export function VehicleStatusBadge({ status, className }: { status: VehicleStatus; className?: string }) {
  return <StatusPill status={status} type="vehicle" className={className} />;
}
