import type { MaintenanceLog, MaintenanceType } from "@prisma/client";
import type { MaintenancePrediction } from "@/types";

const SERVICE_INTERVALS_KM: Record<MaintenanceType, number> = {
  OIL_CHANGE: 5000,
  TIRE_ROTATION: 10000,
  BRAKE_SERVICE: 20000,
  ENGINE_REPAIR: 30000,
  INSPECTION: 15000,
  OTHER: 10000,
};

const MONITORED_TYPES: MaintenanceType[] = [
  "OIL_CHANGE",
  "TIRE_ROTATION",
  "BRAKE_SERVICE",
  "ENGINE_REPAIR",
  "INSPECTION",
];

export function predictMaintenance(
  currentOdometer: number,
  maintenanceLogs: MaintenanceLog[],
  vehicleCreatedAt: Date,
  baseOdometer: number = 0
): MaintenancePrediction[] {
  const daysSinceCreation = Math.max(
    1,
    (Date.now() - vehicleCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalKm = currentOdometer - baseOdometer;
  const avgDailyKm = totalKm > 0 ? totalKm / daysSinceCreation : 50;

  return MONITORED_TYPES.map((type) => {
    const logsOfType = maintenanceLogs
      .filter((log) => log.type === type)
      .sort(
        (a, b) =>
          new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
      );

    const lastLog = logsOfType[0] ?? null;
    const intervalKm = SERVICE_INTERVALS_KM[type];

    let nextServiceDueAtKm: number;
    let lastServiceOdometer: number | null = null;

    if (lastLog) {
      if (lastLog.nextServiceKm) {
        nextServiceDueAtKm = lastLog.nextServiceKm;
      } else {
        const daysSinceService = Math.max(
          0,
          (Date.now() - new Date(lastLog.serviceDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        lastServiceOdometer = Math.max(
          0,
          currentOdometer - daysSinceService * avgDailyKm
        );
        nextServiceDueAtKm = lastServiceOdometer + intervalKm;
      }
    } else {
      const kmSinceLast = currentOdometer % intervalKm;
      nextServiceDueAtKm = currentOdometer - kmSinceLast + intervalKm;
    }

    const kmUntilDue = nextServiceDueAtKm - currentOdometer;
    const estimatedDaysUntilDue =
      avgDailyKm > 0 ? Math.round(kmUntilDue / avgDailyKm) : null;

    let urgency: MaintenancePrediction["urgency"];
    if (kmUntilDue <= 0) urgency = "OVERDUE";
    else if (kmUntilDue <= 500) urgency = "DUE_SOON";
    else if (kmUntilDue <= 2000) urgency = "UPCOMING";
    else urgency = "OK";

    return {
      type,
      lastServiceOdometer,
      lastServiceDate: lastLog ? new Date(lastLog.serviceDate) : null,
      nextServiceDueAtKm: Math.max(0, nextServiceDueAtKm),
      kmUntilDue,
      urgency,
      estimatedDaysUntilDue,
    };
  });
}
