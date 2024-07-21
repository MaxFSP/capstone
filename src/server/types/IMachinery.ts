export interface Machinery {
  machine_id: number;
  brand: string;
  model: string;
  year: number;
  serial_number: string;
  acquisition_date: Date;
  observations: string | null;
  created_at: Date;
  state: string;
  sold_price: number | null;
  sold_to: string | null;
  sold_date: Date | null;
  location_name: string;
  images: string[];
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
