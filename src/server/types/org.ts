import { z } from "zod";

// Org schema
export const orgSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Organization name is required")
});

export type Org = z.infer<typeof orgSchema>;

// EmployeeInOrg schema
export const employeeInOrgSchema = z.object({
  orgId: z.string(),
  userId: z.string()
});

export type EmployeeInOrg = z.infer<typeof employeeInOrgSchema>;

// AddEmployee schema
export const addEmployeeSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.string().min(1, "Role is required")
});

export type AddEmployee = z.infer<typeof addEmployeeSchema>;
