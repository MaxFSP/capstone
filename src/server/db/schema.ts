import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  integer,
  text,
  serial,
} from "drizzle-orm/pg-core";

const createTable = pgTableCreator((name) => `capstone_${name}`);

// Role Table
export const roles = createTable("role", {
  rol_id: serial("rol_id").primaryKey(),
  rol_name: text("rol_name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Machinery Stock Table
export const machineryStock = createTable(
  "machinery_stock",
  {
    machine_id: serial("machine_id").primaryKey(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    serial_number: text("serial_number").notNull(),
    acquisition_date: timestamp("acquisition_date").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    observations: text("observations"),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    state: text("state").notNull(), // "Available", "Sold", "Under Maintenance"
    sold_price: integer("sold_price"),
    sold_to: text("sold_to"),
    sold_date: timestamp("sold_date"),
  },
  (machinery_index) => ({
    machine_id: index("machine_id_idx").on(machinery_index.machine_id),
  }),
);

// Machinery Images Table

export const machineryImages = createTable("machinery_images", {
  image_id: serial("image_id").primaryKey(),
  machine_id: serial("machine_id").references(() => machineryStock.machine_id),
  image_url: text("image_url").notNull(),
  image_key: text("image_key").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// User Table
export const users = createTable(
  "user",
  {
    user_id: serial("user_id").primaryKey(),
    username: text("username").notNull(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    imageUrl: text("image_url"),
    imageKey: text("image_key"),
    clerkRole: text("clerk_role").notNull(),
    clerk_id: text("clerk_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (user_index) => ({
    user_id: index("user_id_idx").on(user_index.user_id),
  }),
);

// Tool Stock Table
export const toolStock = createTable(
  "tool_stock",
  {
    tool_id: serial("tool_id").primaryKey(),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    tool_type: text("tool_type").notNull(),
    condition: varchar("condition", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    acquisition_date: timestamp("acquisition_date").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    observations: text("observations"),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (tool_index) => ({
    tool_id: index("tool_id_idx").on(tool_index.tool_id),
  }),
);

// Tool Images Table
export const toolImages = createTable("tool_images", {
  image_id: serial("image_id").primaryKey(),
  tool_id: serial("tool_id").references(() => toolStock.tool_id),
  image_url: text("image_url").notNull(),
  image_key: text("image_key").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Part Stock Table
export const partStock = createTable(
  "part_stock",
  {
    part_id: serial("part_id").primaryKey(),
    name: text("name").notNull(),
    part_number: text("part_number").notNull(),
    condition: varchar("condition", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    length: integer("length").notNull(), // Length of the part
    length_unit: varchar("length_unit", { length: 2 }).notNull(), // Unit for length (cm, mm)
    width: integer("width").notNull(), // Width of the part
    width_unit: varchar("width_unit", { length: 2 }).notNull(), // Unit for width (cm, mm)
    height: integer("height").notNull(), // Height of the part
    height_unit: varchar("height_unit", { length: 2 }).notNull(), // Unit for height (cm, mm)
    compatible_machines: text("compatible_machines"), // Optional field for machines not in stock
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (part_index) => ({
    part_id: index("part_id_idx").on(part_index.part_id),
  }),
);

// Part Machinery Table

export const partMachinery = createTable(
  "part_machinery",
  {
    part_id: serial("part_id")
      .references(() => partStock.part_id)
      .notNull(),
    machine_id: serial("machine_id")
      .references(() => machineryStock.machine_id)
      .notNull(),
  },
  (partMachinery_index) => ({
    part_machinery_idx: index("part_machinery_idx").on(
      partMachinery_index.part_id,
      partMachinery_index.machine_id,
    ),
  }),
);

// Part Images Table
export const partImages = createTable("part_images", {
  image_id: serial("image_id").primaryKey(),
  part_id: serial("part_id").references(() => partStock.part_id),
  image_url: text("image_url").notNull(),
  image_key: text("image_key").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const locations = createTable(
  "location",
  {
    location_id: serial("location_id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (location_index) => ({
    nameIndex: index("name_location_idx").on(location_index.name),
    addressIndex: index("address_location_idx").on(location_index.address),
  }),
);

export const employees = createTable(
  "employee",
  {
    employee_id: serial("employee_id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    age: integer("age").notNull(),
    imageUrl: text("image_url"),
    hireDate: timestamp("hire_date").notNull(),
    phoneNumber: text("phone_number").notNull(),
    job: text("job").notNull(),
    bloodType: text("blood_type").notNull(),
    imageKey: text("image_key"),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (employee_index) => ({
    id: index("id_idx").on(employee_index.employee_id),
  }),
);

export const workOrders = createTable(
  "work_order",
  {
    order_id: serial("order_id").primaryKey().notNull(),
    name: text("name").notNull(),
    machine_id: serial("machine_id").references(
      () => machineryStock.machine_id,
    ),
    observations: text("observations"),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date"),
    assigned_user: serial("assigned_to").references(() => users.user_id),

    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (workOrder_index) => ({
    order_id: index("order_id_idx").on(workOrder_index.order_id),
  }),
);

export const workTasks = createTable(
  "work_task",
  {
    task_id: serial("task_id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").notNull(),
    order_id: serial("order_id").references(() => workOrders.order_id),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date"),
    column_id: serial("column_id").references(() => workColumns.column_id),
    assigned_to: serial("assigned_to").references(() => employees.employee_id),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (workTask_index) => ({
    task_id: index("task_id_idx").on(workTask_index.task_id),
  }),
);

export const workColumns = createTable(
  "work_column",
  {
    column_id: serial("column_id").primaryKey().notNull(),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (workColumn_index) => ({
    column_id: index("column_id_idx").on(workColumn_index.column_id),
  }),
);
