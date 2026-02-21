"use client";

import { TripStatusPill } from "@/components/trips/TripStatusPill";
import { formatDateTime, formatWeight } from "@/lib/utils";
import type { TripWithRelations } from "@/types";

export function TripActivityFeed({ trips }: { trips: TripWithRelations[] }) {
  if (!trips || trips.length === 0) return (
    <p className="text-sm text-gray-400 py-6 text-center">No recent trips</p>
  );

  return (
    <div className="space-y-3">
      {trips.slice(0, 6).map((trip) => (
        <div key={trip.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center mt-1 shrink-0">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="h-5 w-px bg-gray-200 my-0.5" />
            <div className="h-2 w-2 rounded-full bg-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-900 truncate">{trip.originAddress}</p>
              <TripStatusPill status={trip.status} />
            </div>
            <p className="text-xs text-gray-400 truncate">→ {trip.destinationAddress}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {trip.driver?.name ?? "—"} · {formatWeight(trip.cargoWeight)} · {formatDateTime(trip.scheduledAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
