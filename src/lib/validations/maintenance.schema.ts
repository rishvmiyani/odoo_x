import { z } from "zod";

export const MaintenanceCreateSchema = z.object({
  vehicleId:    z.string().min(1, "Vehicle is required"),
  type:         z.enum(["OIL_CHANGE","TIRE_ROTATION","BRAKE_SERVICE","ENGINE_REPAIR","INSPECTION","OTHER"]),
  description:  z.string().min(3, "Description is required"),
  cost:         z.number().min(1, "Cost must be > 0"),
  serviceDate:  z.string().min(1, "Date is required"),
  nextServiceKm:z.number().optional(),
  vendorName:   z.string().optional(),
  invoiceRef:   z.string().optional(),
});

export const MaintenanceUpdateSchema = MaintenanceCreateSchema.partial();

export type MaintenanceCreateInput = z.infer<typeof MaintenanceCreateSchema>;
export type MaintenanceUpdateInput = z.infer<typeof MaintenanceUpdateSchema>;
