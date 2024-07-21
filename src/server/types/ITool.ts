export interface Tool {
  tool_id: number;
  name: string;
  brand: string;
  category: string;
  tool_type: string;
  condition: string;
  quantity: number;
  acquisition_date: Date;
  observations: string | null;
  created_at: Date;
  location_name: string;
  images: string[];
}
