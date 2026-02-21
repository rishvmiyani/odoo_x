import { z } from "zod";
import { VehicleType } from "@prisma/client";

export const VehicleCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  model: z.string().min(2, "Model must be at least 2 characters"),
  licensePlate: z
    .string()
    .min(4, "License plate must be at least 4 characters")
    .transform((val) => val.toUpperCase().trim()),
  type: z.nativeEnum(VehicleType, { required_error: "Vehicle type is required" }),
  maxCapacity: z
    .number({ required_error: "Capacity is required" })
    .positive("Capacity must be a positive number"),
  currentOdometer: z.number().min(0, "Odometer cannot be negative").default(0),
  region: z.string().optional(),
  acquisitionCost: z.number().min(0).default(0),
  acquisitionDate: z.string().optional().nullable(),
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

export type VehicleCreateInput = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof VehicleUpdateSchema>;
