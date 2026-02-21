import { z } from "zod";

export const FuelExpenseCreateSchema = z.object({
  vehicleId:      z.string().min(1, "Vehicle is required"),
  tripId:         z.string().optional(),
  fuelDate:       z.string().min(1, "Date is required"),
  liters:         z.number().min(0.1, "Liters must be > 0"),
  costPerLiter:   z.number().min(0.1, "Cost per liter must be > 0"),
  odometerAtFuel: z.number().min(0, "Odometer must be >= 0"),
  station:        z.string().optional(),
});

export const FuelExpenseUpdateSchema = FuelExpenseCreateSchema.partial();

export type FuelExpenseCreateInput = z.infer<typeof FuelExpenseCreateSchema>;
export type FuelExpenseUpdateInput = z.infer<typeof FuelExpenseUpdateSchema>;
