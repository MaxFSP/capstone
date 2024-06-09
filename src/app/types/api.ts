import type { User } from "@clerk/nextjs/server";
import type { UpdateEmployee } from "./employee";

export interface UpdateUserRequest {
  userId: string;
  formEmployee: UpdateEmployee;
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
