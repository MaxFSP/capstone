import { type Image } from "./IImages";

export interface Part {
  part_id: number;
  name: string;
  part_number: string;
  condition: string;
  length: number;
  location_id: number;
  quantity: number;
  length_unit: string;
  width: number;
  width_unit: string;
  height: number;
  height_unit: string;
  compatible_machines: string;
  location_name: string;
  created_at: Date;
  images: Image[];
}

export type PartCondition = "Good" | "Bad" | "Excellent" | "Poor" | "New";
export type PartUnit = "cm" | "mm";

export interface CreatePart {
  name: string;
  part_number: string;
  condition: string;
  quantity: number;
  acquisition_date: Date;
  location_id: number;
  length: number;
  length_unit: string;
  width: number;
  width_unit: string;
  height: number;
  height_unit: string;
  compatible_machines: string;
}
