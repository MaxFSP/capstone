import { z } from "zod";

// Location schema
export const locationSchema = z.object({
  location_id: z.number().nonnegative(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  created_at: z.date()
});

export type ILocation = z.infer<typeof locationSchema>;
