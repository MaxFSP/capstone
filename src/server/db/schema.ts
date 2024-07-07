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

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
const createTable = pgTableCreator((name) => `capstone_${name}`);

// Role Table
export const roles = createTable("role", {
  rol_id: serial("rol_id").primaryKey(),
  rol_name: text("rol_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Fix Table
export const fixes = createTable(
  "fix",
  {
    fix_id: serial("fix_id").primaryKey(),
    name: text("name").notNull(),
    part_id: serial("part_id").references(() => partStock.part_id),
    tool_id: serial("tool_id").references(() => toolStock.tool_id),
    machine_id: serial("machine_id").references(
      () => machineryStock.machine_id,
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (fix_index) => ({
    partIndex: index("part_idx").on(fix_index.part_id),
    toolIndex: index("tool_idx").on(fix_index.tool_id),
    machineIndex: index("machine_idx").on(fix_index.machine_id),
  }),
);

// Machinery Stock Table
export const machineryStock = createTable(
  "machinery_stock",
  {
    machine_id: serial("machine_id").primaryKey(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    license_plate: text("license_plate").notNull(),
    accquisition_date: timestamp("accquisition_date").notNull(),
    serial_number: text("serial_number").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    comments: text("comments"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (machinery_index) => ({
    brandIndex: index("brand_idx").on(machinery_index.brand),
    modelIndex: index("model_idx").on(machinery_index.model),
    licensePlateIndex: index("license_plate_idx").on(
      machinery_index.license_plate,
    ),
  }),
);

// User Table
export const users = createTable(
  "user",
  {
    user_id: serial("user_id").primaryKey(),
    username: text("username").notNull(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    profile_image_url: text("profile_image_url").notNull(),
    rol_id: serial("rol_id").references(() => roles.rol_id),
    clerk_id: text("clerk_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (user_index) => ({
    usernameIndex: index("username_idx").on(user_index.username),
    firstNameIndex: index("first_name_idx").on(user_index.first_name),
    lastNameIndex: index("last_name_idx").on(user_index.last_name),
    rolIndex: index("rol_idx").on(user_index.rol_id),
  }),
);

// Tool Stock Table
export const toolStock = createTable(
  "tool_stock",
  {
    tool_id: serial("tool_id").primaryKey(),
    name: text("name").notNull(),
    usage: varchar("usage", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (tool_index) => ({
    nameIndex: index("name_tool_idx").on(tool_index.name),
    usageIndex: index("usage_tool_idx").on(tool_index.usage),
    quantityIndex: index("quantity_tool_idx").on(tool_index.quantity),
  }),
);

// Part Stock Table
export const partStock = createTable(
  "part_stock",
  {
    part_id: serial("part_id").primaryKey(),
    name: text("name").notNull(),
    usage: text("usage").notNull(),
    quantity: integer("quantity").notNull(),
    location_id: serial("location_id").references(() => locations.location_id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (part_index) => ({
    nameIndex: index("name_part__idx").on(part_index.name),
    usageIndex: index("usage_part_idx").on(part_index.usage),
    quantityIndex: index("quantity_part_idx").on(part_index.quantity),
  }),
);

// Repair Order Table
export const repairOrders = createTable(
  "repair_order",
  {
    order_id: serial("order_id").primaryKey().notNull(),
    name: text("name").notNull(),
    user_id: serial("user_id").references(() => users.user_id),
    fix_id: serial("fix_id").references(() => fixes.fix_id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (repair_order_index) => ({
    nameIndex: index("name_repair_idx").on(repair_order_index.name),
    userIndex: index("user_repair_idx").on(repair_order_index.user_id),
    fixIndex: index("fix_repair_idx").on(repair_order_index.fix_id),
  }),
);

export const locations = createTable(
  "location",
  {
    location_id: serial("location_id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (location_index) => ({
    nameIndex: index("name_location_idx").on(location_index.name),
    addressIndex: index("address_location_idx").on(location_index.address),
  }),
);
