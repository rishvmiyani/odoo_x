import { z } from "zod";

export const DriverCreateSchema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().min(1, "Email is required").email("Invalid email address"),
  phone:           z.string().optional(),
  licenseNumber:   z.string().min(3, "License number is required"),
  licenseCategory: z.array(z.string()).min(1, "Select at least one category"),
  licenseExpiry:   z.string().min(1, "Expiry date is required"),
  safetyScore:     z.number().min(0).max(100).optional(),
});

export const DriverUpdateSchema = DriverCreateSchema.partial();

export type DriverCreateInput = z.infer<typeof DriverCreateSchema>;
export type DriverUpdateInput = z.infer<typeof DriverUpdateSchema>;
