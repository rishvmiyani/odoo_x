import { z } from "zod";

export const TripCreateSchema = z.object({
  vehicleId: z.string().cuid("Please select a valid vehicle"),
  driverId: z.string().cuid("Please select a valid driver"),
  originAddress: z.string().min(3, "Origin address is required"),
  destinationAddress: z.string().min(3, "Destination address is required"),
  cargoDescription: z.string().optional(),
  cargoWeight: z
    .number({ required_error: "Cargo weight is required" })
    .positive("Cargo weight must be greater than 0"),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

export const TripCompleteSchema = z.object({
  action: z.literal("complete"),
  endOdometer: z
    .number({ required_error: "End odometer reading is required" })
    .positive("End odometer must be a positive number"),
  revenue: z.number().min(0, "Revenue cannot be negative").default(0),
  distanceKm: z.number().positive().optional(),
});

export const TripCancelSchema = z.object({
  action: z.literal("cancel"),
  cancelReason: z.string().min(5, "Please provide a reason for cancellation"),
});

export const TripActionSchema = z.discriminatedUnion("action", [
  TripCompleteSchema,
  TripCancelSchema,
]);

export type TripCreateInput = z.infer<typeof TripCreateSchema>;
export type TripCompleteInput = z.infer<typeof TripCompleteSchema>;
export type TripCancelInput = z.infer<typeof TripCancelSchema>;
export type TripActionInput = z.infer<typeof TripActionSchema>;
