const rolesColumns = [
  { key: 'rol_id', label: 'Rol ID' },
  { key: 'rol_name', label: 'Rol Name' },
  { key: 'created_at', label: 'Created At' },
];

const machineryStockColumns = [
  { key: 'machine_id', label: 'Machine ID' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'acquisition_date', label: 'Acquisition Date' },
  { key: 'serial_number', label: 'Serial Number' },
  // { key: "location_id", label: "Location ID" },
  { key: 'observations', label: 'Observations' },
  { key: 'created_at', label: 'Created At' },
  { key: 'state', label: 'State' },
  { key: 'location_name', label: 'Location Name' },
];

const soldMachineryStockColumns = [
  { key: 'machine_id', label: 'Machine ID' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'acquisition_date', label: 'Acquisition Date' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'location_id', label: 'Location ID' },
  { key: 'observations', label: 'Observations' },
  { key: 'created_at', label: 'Created At' },
  { key: 'state', label: 'State' },
  { key: 'sold_price', label: 'Sold Price' },
  { key: 'sold_to', label: 'Sold To' },
  { key: 'sold_date', label: 'Sold Date' },
];

const usersColumns = [
  { key: 'user_id', label: 'User ID' },
  { key: 'username', label: 'Username' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'profile_image_url', label: 'Profile Image URL' },
  { key: 'rol_id', label: 'Rol ID' },
  { key: 'clerk_id', label: 'Clerk ID' },
  { key: 'created_at', label: 'Created At' },
];

const toolStockColumns = [
  { key: 'tool_id', label: 'Tool ID' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'tool_type', label: 'Tool Type' },
  { key: 'condition', label: 'Condition' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'acquisition_date', label: 'Acquisition Date' },
  { key: 'location_id', label: 'Location ID' },
  { key: 'observations', label: 'Observations' },
  { key: 'created_at', label: 'Created At' },
];

const partStockColumns = [
  { key: 'part_id', label: 'Part ID' },
  { key: 'name', label: 'Name' },
  { key: 'part_number', label: 'Part Number' },
  { key: 'condition', label: 'Condition' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'location_id', label: 'Location ID' },
  { key: 'length', label: 'Length' },
  { key: 'length_unit', label: 'Length Unit' },
  { key: 'width', label: 'Width' },
  { key: 'width_unit', label: 'Width Unit' },
  { key: 'height', label: 'Height' },
  { key: 'height_unit', label: 'Height Unit' },
  { key: 'compatible_machines', label: 'Compatible Machines' },
  { key: 'created_at', label: 'Created At' },
];

const locationsColumns = [
  { key: 'location_id', label: 'Location ID' },
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'created_at', label: 'Created At' },
];

// constants.ts
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const JOB_TYPES: string[] = ['Mechanic', 'Painter', 'Engineer', 'Parts Specialist', 'Sales'];

export {
  partStockColumns,
  machineryStockColumns,
  soldMachineryStockColumns,
  toolStockColumns,
  usersColumns,
  rolesColumns,
  locationsColumns,
};
