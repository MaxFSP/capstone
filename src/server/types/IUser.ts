import { z } from "zod";

// Helper function for name validation
const nameRegex = /^[A-Za-z]+$/;
const validateName = (name: string) => nameRegex.test(name);

// User schema
export const userSchema = z.object({
  user_id: z.number(),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  first_name: z.string().refine(validateName, {
    message: "First name should only contain letters"
  }),
  last_name: z.string().refine(validateName, {
    message: "Last name should only contain letters"
  }),
  imageUrl: z.string().url("Invalid URL").nullable(),
  imageKey: z.string().nullable(),
  clerkRole: z.string(),
  clerk_id: z.string()
});

export type User = z.infer<typeof userSchema>;

// CreateUser schema
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  first_name: z.string().refine(validateName, {
    message: "First name should only contain letters"
  }),
  last_name: z.string().refine(validateName, {
    message: "Last name should only contain letters"
  }),
  imageUrl: z.string().url("Invalid URL"),
  imageKey: z.string(),
  clerkRole: z.string(),
  clerk_id: z.string()
});

export type CreateUser = z.infer<typeof createUserSchema>;

// UpdateUser schema
export const updateUserSchema = z.object({
  user_id: z.number(),
  username: z.string().min(3, "Username must be at least 3 characters long").optional(),
  first_name: z.string().refine(validateName, {
    message: "First name should only contain letters"
  }).optional(),
  last_name: z.string().refine(validateName, {
    message: "Last name should only contain letters"
  }).optional(),
  imageUrl: z.string().url("Invalid URL").optional(),
  imageKey: z.string().optional(),
  clerkRole: z.string().optional(),
  clerk_id: z.string().optional()
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
