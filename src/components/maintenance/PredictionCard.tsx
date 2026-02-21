"use client";

import useSWR from "swr";
import { AlertTriangle, CheckCircle2, Clock, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatOdometer, getMaintenanceTypeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MaintenancePrediction } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const URGENCY_CONFIG = {
  OVERDUE:  { color: "border-red-200 bg-red-50",    icon: AlertTriangle, iconColor: "text-red-500",   label: "Overdue"   },
  DUE_SOON: { color: "border-amber-200 bg-amber-50", icon: Clock,         iconColor: "text-amber-500", label: "Due Soon"  },
  UPCOMING: { color: "border-blue-200 bg-blue-50",   icon: Clock,         iconColor: "text-blue-500",  label: "Upcoming"  },
  OK:       { color: "border-gray-200 bg-gray-50",   icon: CheckCircle2,  iconColor: "text-gray-400",  label: "OK"        },
};

export function PredictionCard({ vehicleId }: { vehicleId: string }) {
  const { data, isLoading } = useSWR<{ data: MaintenancePrediction[] }>(
    `/api/ai/maintenance-prediction?vehicleId=${vehicleId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) return (
    <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
  );

  const predictions = data?.data ?? [];
  const hasAlerts   = predictions.some((p) => p.urgency !== "OK");

  return (
    <div className="space-y-2">
      {!hasAlerts && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm text-emerald-700">All maintenance schedules are on track</p>
        </div>
      )}
      {predictions.filter((p) => p.urgency !== "OK").map((pred) => {
        const cfg = URGENCY_CONFIG[pred.urgency];
        const Icon = cfg.icon;
        return (
          <div key={pred.type} className={cn("flex items-start gap-3 p-3 rounded-lg border", cfg.color)}>
            <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", cfg.iconColor)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{getMaintenanceTypeLabel(pred.type)}</p>
                <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", cfg.iconColor)}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {pred.kmUntilDue <= 0
                  ? `Overdue by ${formatOdometer(Math.abs(pred.kmUntilDue))}`
                  : `Due in ${formatOdometer(pred.kmUntilDue)}`
                }
                {pred.estimatedDaysUntilDue !== null && ` (~${pred.estimatedDaysUntilDue} days)`}
              </p>
              {pred.lastServiceDate && (
                <p className="text-xs text-gray-400">
                  Last service: {new Date(pred.lastServiceDate).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {predictions.filter((p) => p.urgency === "OK").map((pred) => {
        const cfg = URGENCY_CONFIG.OK;
        const Icon = cfg.icon;
        return (
          <div key={pred.type} className={cn("flex items-center gap-3 p-2.5 rounded-lg border", cfg.color)}>
            <Icon className={cn("h-4 w-4 shrink-0", cfg.iconColor)} />
            <div className="flex-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">{getMaintenanceTypeLabel(pred.type)}</p>
              <p className="text-xs text-gray-400">Due in {formatOdometer(pred.kmUntilDue)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
