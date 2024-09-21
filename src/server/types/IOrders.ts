import { z } from "zod";


export const workOrderSchema = z.object({
  order_id: z.number().nonnegative(),
  name: z.string().min(1, "Name is required"),
  machine_serial: z.string().min(1, "Machine serial is required"),
  userName: z.string().min(1, "User name is required"),
  observations: z.string().nullable(),
  start_date: z.date(),
  end_date: z.date().nullable(),
  state: z.number().int().min(0).max(1),
  machine_id: z.number(),
  assigned_user: z.number(),
});


export type WorkOrders = z.infer<typeof workOrderSchema>;

export const workOrdersWithUserSchema = workOrderSchema.extend({
  userName: z.string(),
  machine_serial: z.string(),
});

export type WorkOrdersWithUser = z.infer<typeof workOrdersWithUserSchema>;

export const workOrderWithMachineSchema = workOrderSchema.extend({
  machineName: z.string(),
  machineSerial: z.string(),
});

export type WorkOrderWithMachine = z.infer<typeof workOrderWithMachineSchema>;

export const createWorkOrderSchema = z.object({
  name: z.string(),
  machine_id: z.number(),
  observations: z.string(),
  start_date: z.date(),
  assigned_user: z.number(),
});

export type CreateWorkOrder = z.infer<typeof createWorkOrderSchema>;

export const updateWorkOrderSchema = z.object({
  order_id: z.number(),
  name: z.string().optional(),
  machine_id: z.number().optional(),
  observations: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  assigned_user: z.number().optional(),
});

export type UpdateWorkOrder = z.infer<typeof updateWorkOrderSchema>;
