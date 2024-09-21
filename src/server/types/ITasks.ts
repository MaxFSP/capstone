import { z } from "zod";
import { partSchema } from "./IPart";
import { toolSchema } from "./ITool";

// Task schema
export const taskSchema = z.object({
  task_id: z.number().nonnegative(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  position: z.number().int().nonnegative(),
  start_date: z.date(),
  end_date: z.date(),
  column_id: z.number().nonnegative(),
  assigned_to: z.number().nonnegative(),
  priority: z.enum(["0", "1", "2"]), // 0 = low, 1 = medium, 2 = high
  state: z.number().int().min(0).max(1)
});

export type Task = z.infer<typeof taskSchema>;

// MovingTask schema
export const movingTaskSchema = z.object({
  task_id: z.number().nonnegative(),
  new_column_id: z.number().nonnegative(),
  new_position: z.number().int().nonnegative()
});

export type MovingTask = z.infer<typeof movingTaskSchema>;

// CreateTask schema
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  position: z.number().int().nonnegative(),
  start_date: z.date(),
  end_date: z.date(),
  column_id: z.number().nonnegative(),
  assigned_to: z.number().nonnegative(),
  priority: z.enum(["0", "1", "2"]) // 0 = low, 1 = medium, 2 = high
});

export type CreateTask = z.infer<typeof createTaskSchema>;

// TasksOnColumns schema
export const tasksOnColumnsSchema = z.record(z.string(), z.array(taskSchema));

export type TasksOnColumns = z.infer<typeof tasksOnColumnsSchema>;

// ToolInTask schema
export const toolInTaskSchema = z.object({
  task_id: z.number().nonnegative(),
  tool_id: z.number().nonnegative()
});

export type ToolInTask = z.infer<typeof toolInTaskSchema>;

// PartInTask schema
export const partInTaskSchema = z.object({
  task_id: z.number().nonnegative(),
  part_id: z.number().nonnegative()
});

export type PartInTask = z.infer<typeof partInTaskSchema>;

// ToolsAndParts schema
export const toolsAndPartsSchema = z.object({
  task_id: z.number().nonnegative(),
  tools: z.array(z.number().nonnegative()),
  parts: z.array(z.number().nonnegative())
});

export type ToolsAndParts = z.infer<typeof toolsAndPartsSchema>;

// taskWithToolsAndParts schema
export const taskWithToolsAndPartsSchema = z.object({
  task: taskSchema,
  toolsInTask: z.array(toolSchema),
  partsInTask: z.array(partSchema)
});

export type taskWithToolsAndParts = z.infer<typeof taskWithToolsAndPartsSchema>;
