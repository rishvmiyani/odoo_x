import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelExpense,
  UserRole,
  VehicleStatus,
  VehicleType,
  TripStatus,
  DriverStatus,
  MaintenanceType,
} from "@prisma/client";

// ─── RBAC ────────────────────────────────────────────────────────────────────

export type Permission =
  | "vehicles:read"
  | "vehicles:write"
  | "trips:read"
  | "trips:write"
  | "drivers:read"
  | "drivers:write"
  | "maintenance:read"
  | "maintenance:write"
  | "fuel:read"
  | "fuel:write"
  | "analytics:read"
  | "analytics:export";



// ─── Extended relation types ────────────────────────────────────────────────

export type VehicleWithRelations = Vehicle & {
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelExpenses: FuelExpense[];
};

export type TripWithRelations = Trip & {
  vehicle: Vehicle;
  driver: Driver;
  fuelExpenses: FuelExpense[];
};

export type DriverWithTrips = Driver & {
  trips: TripWithRelations[];
};

export type MaintenanceWithVehicle = MaintenanceLog & {
  vehicle: Vehicle;
};

export type FuelExpenseWithRelations = FuelExpense & {
  vehicle: Vehicle;
  trip?: Trip | null;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardKpis {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
  totalVehicles: number;
}

export interface FleetStatusCount {
  status: VehicleStatus;
  count: number;
}

export interface TripActivityData {
  date: string;
  count: number;
}

// ─── AI Engine types ─────────────────────────────────────────────────────────

export interface MaintenancePrediction {
  type: MaintenanceType;
  lastServiceOdometer: number | null;
  lastServiceDate: Date | null;
  nextServiceDueAtKm: number;
  kmUntilDue: number;
  urgency: "OVERDUE" | "DUE_SOON" | "UPCOMING" | "OK";
  estimatedDaysUntilDue: number | null;
}

export interface SafetyScoreBreakdown {
  driverId: string;
  completionRate: number;
  licenseValid: boolean;
  isSuspended: boolean;
  completionPoints: number;
  licensePoints: number;
  suspensionPenalty: number;
  finalScore: number;
}

export interface FuelAnomaly {
  expenseId: string;
  fuelDate: Date;
  efficiency: number;
  zScore: number;
  anomalyType: "HIGH" | "LOW";
  message: string;
}

export interface FuelAnomalyResult {
  vehicleId: string;
  meanEfficiency: number;
  stdDev: number;
  anomalies: FuelAnomaly[];
}

export interface CostPrediction {
  vehicleId: string;
  monthlyHistory: { month: string; totalCost: number }[];
  predictedNextMonthCost: number;
  trend: "INCREASING" | "STABLE" | "DECREASING";
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface FuelEfficiencyData {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  kmPerLiter: number;
}

export interface CostBreakdownData {
  month: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
}

export interface VehicleRoiData {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalRevenue: number;
  totalCost: number;
  acquisitionCost: number;
  roi: number;
}

export interface AnalyticsSummary {
  fuelEfficiencyPerVehicle: FuelEfficiencyData[];
  costBreakdownPerMonth: CostBreakdownData[];
  vehicleRoi: VehicleRoiData[];
  driverSafetyScores: { driverId: string; name: string; score: number }[];
  kpiSummary: {
    avgEfficiency: number;
    totalCost: number;
    topVehicle: { name: string; roi: number } | null;
    topDriver: { name: string; score: number } | null;
  };
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── RBAC ────────────────────────────────────────────────────────────────────

export type Permission =
  | "vehicles:read"
  | "vehicles:write"
  | "trips:read"
  | "trips:write"
  | "drivers:read"
  | "drivers:write"
  | "maintenance:read"
  | "maintenance:write"
  | "fuel:read"
  | "fuel:write"
  | "analytics:read"
  | "analytics:export";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  FLEET_MANAGER: [
    "vehicles:read","vehicles:write",
    "trips:read","trips:write",
    "drivers:read","drivers:write",
    "maintenance:read","maintenance:write",
    "fuel:read","fuel:write",
    "analytics:read","analytics:export",
  ],
  DISPATCHER: [
    "vehicles:read",
    "trips:read","trips:write",
    "drivers:read",
    "maintenance:read",
    "fuel:read",
    "analytics:read",
  ],
  SAFETY_OFFICER: [
    "vehicles:read",
    "trips:read",
    "drivers:read","drivers:write",
    "maintenance:read",
    "fuel:read",
    "analytics:read",
  ],
  FINANCIAL_ANALYST: [
    "vehicles:read",
    "trips:read",
    "drivers:read",
    "maintenance:read",
    "fuel:read","fuel:write",
    "analytics:read","analytics:export",
  ],
};
