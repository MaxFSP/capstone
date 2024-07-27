import { type Image } from "./IImages";

export interface Tool {
  tool_id: number;
  name: string;
  brand: string;
  location_id: number;
  category: string;
  tool_type: string;
  condition: string;
  quantity: number;
  acquisition_date: Date;
  observations: string;
  created_at: Date;
  location_name: string;
  images: Image[];
}

export type ToolCondition = "Good" | "Bad" | "Excellent" | "Poor";

export interface CreateTool {
  name: string;
  brand: string;
  category: string;
  tool_type: string;
  condition: string;
  quantity: number;
  acquisition_date: Date;
  location_id: number;
  observations: string;
}
