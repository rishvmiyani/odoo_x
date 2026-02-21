import { StatusPill } from "@/components/shared/StatusPill";
import type { TripStatus } from "@prisma/client";

export function TripStatusPill({ status }: { status: TripStatus }) {
  return <StatusPill status={status} type="trip" />;
}
