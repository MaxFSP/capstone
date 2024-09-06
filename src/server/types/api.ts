import type { User } from "@clerk/nextjs/server";
import type { UpdateClerkUser } from "./IClerkUser";

export interface UpdateUserRequest {
  userId: string;
  orgId: string;
  formEmployee: UpdateClerkUser;
}

export interface UpdateUserResponse {
  message: string;
  error?: string;
}

export interface CreateUserResponse {
  data: User;
  message: string;
  error?: string;
}

export interface AddUserRoleResponse {
  message: string;
  error?: string;
}
