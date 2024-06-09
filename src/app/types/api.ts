import type { User } from "@clerk/nextjs/server";
import type { BaseEmployee } from "./employee";

export interface UpdateUserRequest {
  userId: string;
  formEmployee: BaseEmployee & {
    department?: string[];
    password?: string;
  };
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
