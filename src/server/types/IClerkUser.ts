import { z } from "zod";
import { orgSchema } from "./org";

// BaseClerkUser schema
const baseClerkUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.array(z.string().email("Invalid email address")).nonempty("At least one email is required"),
  online: z.boolean().optional()
});

export type BaseClerkUser = z.infer<typeof baseClerkUserSchema>;

// CreateClerkUser schema
export const createClerkUserSchema = baseClerkUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export type CreateClerkUser = z.infer<typeof createClerkUserSchema>;

// UpdateClerkUser schema
export const updateClerkUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters long").optional(),
  email: z.array(z.string().email("Invalid email address")).nonempty("At least one email is required"),
  orgId: z.string().optional(),
  online: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long").optional()
});

export type UpdateClerkUser = z.infer<typeof updateClerkUserSchema>;

// ClerkUser schema
export const clerkUserSchema = baseClerkUserSchema.extend({
  id: z.string(),
  img: z.string().url("Invalid image URL"),
  org: z.union([orgSchema, z.array(orgSchema)])
});

export type ClerkUser = z.infer<typeof clerkUserSchema>;

// CreateClerkEmployeeWithOrg schema
export const createClerkEmployeeWithOrgSchema = createClerkUserSchema.extend({
  organizationId: z.string()
});

export type CreateClerkEmployeeWithOrg = z.infer<typeof createClerkEmployeeWithOrgSchema>;
