import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

export function formatEfficiency(value: number): string {
  return `${value.toFixed(2)} km/L`;
}

export function formatOdometer(km: number): string {
  return `${km.toLocaleString("en-IN")} km`;
}

export function formatWeight(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMaintenanceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    OIL_CHANGE: "Oil Change",
    TIRE_ROTATION: "Tire Rotation",
    BRAKE_SERVICE: "Brake Service",
    ENGINE_REPAIR: "Engine Repair",
    INSPECTION: "Inspection",
    OTHER: "Other",
  };
  return map[type] ?? type;
}

export function getLicenseExpiryStatus(
  expiry: Date | string
): "VALID" | "EXPIRING_SOON" | "EXPIRED" {
  const diff = differenceInDays(new Date(expiry), new Date());
  if (diff < 0) return "EXPIRED";
  if (diff <= 30) return "EXPIRING_SOON";
  return "VALID";
}

export function getLicenseExpiryDays(expiry: Date | string): number {
  return differenceInDays(new Date(expiry), new Date());
}

export function getVehicleStatusColor(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ON_TRIP: "bg-blue-100 text-blue-700 border-blue-200",
    IN_SHOP: "bg-amber-100 text-amber-700 border-amber-200",
    OUT_OF_SERVICE: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

export function getTripStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    DISPATCHED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

export function getDriverStatusColor(status: string): string {
  const map: Record<string, string> = {
    ON_DUTY: "bg-blue-100 text-blue-700 border-blue-200",
    OFF_DUTY: "bg-gray-100 text-gray-700 border-gray-200",
    SUSPENDED: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

export function getSafetyScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    FLEET_MANAGER: "bg-blue-100 text-blue-700",
    DISPATCHER: "bg-violet-100 text-violet-700",
    SAFETY_OFFICER: "bg-amber-100 text-amber-700",
    FINANCIAL_ANALYST: "bg-emerald-100 text-emerald-700",
  };
  return map[role] ?? "bg-gray-100 text-gray-600";
}

export function generateTripCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRP-${timestamp}-${random}`;
}

export function calculateVehicleROI(
  revenue: number,
  acquisitionCost: number,
  maintenanceCost: number,
  fuelCost: number
): number {
  const totalCost = acquisitionCost + maintenanceCost + fuelCost;
  if (totalCost === 0) return 0;
  return parseFloat((((revenue - totalCost) / totalCost) * 100).toFixed(2));
}
