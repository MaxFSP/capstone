import { z } from 'zod';

// Define the valid conditions for tools
export const toolConditionEnum = z.enum(['Good', 'Bad', 'Excellent', 'Poor']);
export type ToolCondition = z.infer<typeof toolConditionEnum>;

// Tool schema
export const toolSchema = z.object({
  tool_id: z.number().nonnegative(),
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  location_id: z.number().nonnegative(),
  category: z.string().min(1, 'Category is required'),
  tool_type: z.string().min(1, 'Tool type is required'),
  condition: toolConditionEnum,
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
  acquisition_date: z.date(),
  observations: z.string().nullable(),
  created_at: z.date(),
  location_name: z.string().min(1, 'Location name is required'),
  state: z.number().int().positive().max(1, 'State must be between 0 and 1'),
  images: z.array(
    z.object({
      image_id: z.number().int().nonnegative(),
      image_key: z.string().min(1, 'Image key is required'),
      image_url: z.string().url('Invalid URL'),
    })
  ),
});

export type Tool = z.infer<typeof toolSchema>;

// CreateTool schema
export const createToolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  tool_type: z.string().min(1, 'Tool type is required'),
  condition: toolConditionEnum,
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
  acquisition_date: z.date(),
  location_id: z.number().nonnegative(),
  observations: z.string().nullable(),
});

export type CreateTool = z.infer<typeof createToolSchema>;
