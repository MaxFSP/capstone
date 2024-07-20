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

export type MachineryData = {
  machine_id: number;
  brand: string;
  model: string;
  year: number;
  serial_number: string;
  acquisition_date: Date;
  location_id: number;
  observations: string | null;
  created_at: Date;
  state: string;
  sold_price: number | null;
  sold_to: string | null;
  sold_date: Date | null;
  location_name: string;
  images: string[];
};
