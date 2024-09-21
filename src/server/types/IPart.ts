import { z } from 'zod';
import { imageSchema } from './IImages';

// Define enums for part condition and unit
export const partConditionEnum = z.enum(['Good', 'Bad', 'Excellent', 'Poor', 'New']);
export type PartCondition = z.infer<typeof partConditionEnum>;

export const partUnitEnum = z.enum(['cm', 'mm']);
export type PartUnit = z.infer<typeof partUnitEnum>;

// Part schema
export const partSchema = z.object({
  part_id: z.number().nonnegative(),
  name: z.string().min(1, 'Name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  condition: partConditionEnum,
  length: z.number().nonnegative(),
  location_id: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  length_unit: partUnitEnum,
  width: z.number().nonnegative(),
  width_unit: partUnitEnum,
  height: z.number().nonnegative(),
  height_unit: partUnitEnum,
  compatible_machines: z.string(),
  location_name: z.string().min(1, 'Location name is required'),
  created_at: z.date(),
  images: z.array(imageSchema),
  state: z.number().int().positive().max(1, 'State must be between 0 and 1'),
});

export type Part = z.infer<typeof partSchema>;

// CreatePart schema
export const createPartSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  condition: partConditionEnum,
  quantity: z.number().int().nonnegative(),
  acquisition_date: z.date(),
  location_id: z.number().nonnegative(),
  length: z.number().nonnegative(),
  length_unit: partUnitEnum,
  width: z.number().nonnegative(),
  width_unit: partUnitEnum,
  height: z.number().nonnegative(),
  height_unit: partUnitEnum,
  compatible_machines: z.string(),
});

export type CreatePart = z.infer<typeof createPartSchema>;
