import { z } from 'zod';
import { imageSchema } from './IImages';

// Define the valid states for machinery
export const statesEnum = z.enum(['Available', 'Sold', 'Under Maintenance']);
export type States = z.infer<typeof statesEnum>;

// Machinery schema
export const machinerySchema = z.object({
  machine_id: z.number().nonnegative(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  location_id: z.number().nonnegative(),
  serial_number: z.string().min(1, 'Serial number is required'),
  acquisition_date: z.date(),
  observations: z.string().nullable(),
  created_at: z.date(),
  state: statesEnum,
  sold_price: z.number().nullable(),
  sold_to: z.string().nullable(),
  sold_date: z.date().nullable(),
  location_name: z.string().min(1, 'Location name is required'),
  images: z.array(imageSchema),
  availability: z.number().int().positive().max(1, 'State must be between 0 and 1'),
});

export type Machinery = z.infer<typeof machinerySchema>;

// MachineryImages schema
export const machineryImagesSchema = z.object({
  image_id: z.number().nonnegative(),
  machine_id: z.number().nonnegative(),
  image_url: z.string().url('Invalid image URL'),
  image_key: z.string().min(1, 'Image key is required'),
});

export type MachineryImages = z.infer<typeof machineryImagesSchema>;

// CreateMachinery schema
export const createMachinerySchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  serial_number: z.string().min(1, 'Serial number is required'),
  acquisition_date: z.date(),
  location_id: z.number().nonnegative(),
  observations: z.string().nullable(),
  state: statesEnum,
});

export type CreateMachinery = z.infer<typeof createMachinerySchema>;

// CreateImageForMachinery schema
export const createImageForMachinerySchema = z.object({
  machine_id: z.number().nonnegative(),
  image_url: z.string().url('Invalid image URL'),
  image_key: z.string().min(1, 'Image key is required'),
});

export type CreateImageForMachinery = z.infer<typeof createImageForMachinerySchema>;

// SellMachinery schema
export const sellMachinerySchema = z.object({
  machine_id: z.number().nonnegative(),
  sold_price: z.number().positive('Sold price must be a positive number'),
  sold_to: z.string().min(1, 'Sold to is required'),
  sold_date: z.date(),
});

export type SellMachinery = z.infer<typeof sellMachinerySchema>;

// SellDataValues schema
export const sellDataValuesSchema = z.object({
  machine_id: z.number().nonnegative(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  serial_number: z.string().min(1, 'Serial number is required'),
  sold_price: z.number().positive('Sold price must be a positive number'),
  sold_to: z.string().min(1, 'Sold to is required'),
  sold_date: z.date(),
});

export type SellDataValues = z.infer<typeof sellDataValuesSchema>;

// Machinery stock columns
export const machineryStockColumns = [
  { key: 'machine_id', label: 'Machine ID' },
  { key: 'images', label: 'Images' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'acquisition_date', label: 'Acquisition Date' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'observations', label: 'Observations' },
  { key: 'created_at', label: 'Created At' },
  { key: 'state', label: 'State' },
  { key: 'location_name', label: 'Location Name' },
];
