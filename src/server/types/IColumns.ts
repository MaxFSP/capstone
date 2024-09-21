import { z } from "zod";

// Column schema
export const columnSchema = z.object({
  column_id: z.number().nonnegative(),
  title: z.string().min(1, "Title is required"),
  position: z.number().int().nonnegative(),
  order_id: z.number().nonnegative(),
  state: z.number().int().min(0).max(1)
});

export type Column = z.infer<typeof columnSchema>;

// CreateColumn schema
export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required"),
  position: z.number().int().nonnegative(),
  order_id: z.number().nonnegative()
});

export type CreateColumn = z.infer<typeof createColumnSchema>;
