export interface Part {
  part_id: number;
  name: string;
  part_number: string;
  condition: string;
  length: number;
  quantity: number;
  length_unit: string;
  width: number;
  width_unit: string;
  height: number;
  height_unit: string;
  compatible_machines: string | null;
  location_name: string;
  created_at: Date;
  images: string[];
}

export type PartCondition = "good" | "bad" | "excellent" | "poor";
export type PartUnit = "cm" | "mm";
