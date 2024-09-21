import { z } from 'zod';

// DeleteImage schema
export const deleteImageSchema = z.object({
  image_id: z.number().nonnegative(),
  image_key: z.string().min(1, 'Image key is required'),
  type: z.string().min(1, 'Type is required'),
});

export type DeleteImage = z.infer<typeof deleteImageSchema>;

// FullImage schema
export const fullImageSchema = z.object({
  image_id: z.string().min(1, 'Image ID is required'),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
  created_at: z.date(),
});

export type FullImage = z.infer<typeof fullImageSchema>;

// Image schema
export const imageSchema = z.object({
  image_id: z.number().nonnegative(),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type Image = z.infer<typeof imageSchema>;

// CreateImage schema
export const createImageSchema = z.object({
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type CreateImage = z.infer<typeof createImageSchema>;

// CreateMachineryImage schema
export const createMachineryImageSchema = z.object({
  machine_id: z.string().min(1, 'Machine ID is required'),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type CreateMachineryImage = z.infer<typeof createMachineryImageSchema>;

// CreatePartImage schema
export const createPartImageSchema = z.object({
  part_id: z.string().min(1, 'Part ID is required'),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type CreatePartImage = z.infer<typeof createPartImageSchema>;

// CreateToolImage schema
export const createToolImageSchema = z.object({
  tool_id: z.string().min(1, 'Tool ID is required'),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type CreateToolImage = z.infer<typeof createToolImageSchema>;

// UpdateImage schema
export const updateImageSchema = z.object({
  image_id: z.string().min(1, 'Image ID is required'),
  image_key: z.string().min(1, 'Image key is required'),
  image_url: z.string().url('Invalid URL'),
});

export type UpdateImage = z.infer<typeof updateImageSchema>;
