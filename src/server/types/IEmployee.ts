import { z } from 'zod';

// Helper function for phone number validation
const phoneRegex = /^[0-9]{8}$/;

// Employee schema
export const employeeSchema = z.object({
  employee_id: z.number().nonnegative(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  age: z.number().int().positive().max(120, 'Age must be between 1 and 120'),
  imageUrl: z.string().url().nullable(),
  hireDate: z.date(),
  phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number format'),
  job: z.string().min(1, 'Job title is required'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  imageKey: z.string().nullable(),
  state: z.number().int().positive().max(1, 'State must be between 0 and 1'),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeFormData = Partial<Employee>;

// CreateEmployee schema
export const createEmployeeSchema = employeeSchema.omit({
  employee_id: true,
  imageUrl: true,
  imageKey: true,
});

export type CreateEmployee = z.infer<typeof createEmployeeSchema>;

// UpdateEmployee schema
export const updateEmployeeSchema = employeeSchema.partial().required({
  employee_id: true,
  imageKey: true,
});

export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
