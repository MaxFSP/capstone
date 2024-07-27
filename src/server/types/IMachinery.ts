import { type Image } from "./IImages";

export interface Machinery {
  machine_id: number;
  brand: string;
  model: string;
  year: number;
  location_id: number;
  serial_number: string;
  acquisition_date: Date;
  observations: string;
  created_at: Date;
  state: string;
  sold_price: number | null;
  sold_to: string | null;
  sold_date: Date | null;
  location_name: string;
  images: Image[];
}

export interface MachineryImages {
  image_id: number;
  machine_id: number;
  image_url: string;
  image_key: string;
}

export interface CreateMachinery {
  brand: string;
  model: string;
  year: number;
  serial_number: string;
  acquisition_date: Date;
  location_id: number;
  observations: string;
  state: string;
}

export type States = "Available" | "Sold" | "Under Maintenance";

export interface CreateImageForMachinery {
  machine_id: number;
  image_url: string;
  image_key: string;
}

export interface SellMachinery {
  machine_id: number;
  sold_price: number;
  sold_to: string;
  sold_date: Date;
}

export interface SellDataValues {
  machine_id: number;
  brand: string;
  model: string;
  year: number;
  serial_number: string;
  sold_price: number;
  sold_to: string;
  sold_date: Date;
}

export const machineryStockColumns = [
  { key: "machine_id", label: "Machine ID" },
  { key: "images", label: "Images" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "acquisition_date", label: "Acquisition Date" },
  { key: "serial_number", label: "Serial Number" },
  { key: "observations", label: "Observations" },
  { key: "created_at", label: "Created At" },
  { key: "state", label: "State" },
  { key: "location_name", label: "Location Name" },
];
