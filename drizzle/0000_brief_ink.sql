CREATE TABLE IF NOT EXISTS "capstone_employee" (
	"employee_id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"age" integer NOT NULL,
	"image_url" text,
	"hire_date" timestamp NOT NULL,
	"phone_number" text NOT NULL,
	"job" text NOT NULL,
	"blood_type" text NOT NULL,
	"image_key" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_location" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_machinery_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"machine_id" serial NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_machinery_stock" (
	"machine_id" serial PRIMARY KEY NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"serial_number" text NOT NULL,
	"acquisition_date" timestamp NOT NULL,
	"location_id" serial NOT NULL,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"state" text NOT NULL,
	"sold_price" integer,
	"sold_to" text,
	"sold_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_part_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"part_id" serial NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_part_machinery" (
	"part_id" serial NOT NULL,
	"machine_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_part_stock" (
	"part_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"part_number" text NOT NULL,
	"condition" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"location_id" serial NOT NULL,
	"length" integer NOT NULL,
	"length_unit" varchar(2) NOT NULL,
	"width" integer NOT NULL,
	"width_unit" varchar(2) NOT NULL,
	"height" integer NOT NULL,
	"height_unit" varchar(2) NOT NULL,
	"compatible_machines" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_parts_in_tasks" (
	"part_task_id" serial PRIMARY KEY NOT NULL,
	"task_id" serial NOT NULL,
	"part_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_role" (
	"rol_id" serial PRIMARY KEY NOT NULL,
	"rol_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_tool_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"tool_id" serial NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_tool_stock" (
	"tool_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category" text NOT NULL,
	"tool_type" text NOT NULL,
	"condition" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"acquisition_date" timestamp NOT NULL,
	"location_id" serial NOT NULL,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_tools_in_tasks" (
	"tool_task_id" serial PRIMARY KEY NOT NULL,
	"task_id" serial NOT NULL,
	"tool_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"image_url" text,
	"image_key" text,
	"clerk_role" text NOT NULL,
	"clerk_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_work_column" (
	"column_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"order_id" serial NOT NULL,
	"state" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_work_order" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"machine_id" serial NOT NULL,
	"observations" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"assigned_to" serial NOT NULL,
	"state" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_work_task" (
	"task_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"column_id" serial NOT NULL,
	"assigned_to" serial NOT NULL,
	"priority" text NOT NULL,
	"state" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_machinery_images" ADD CONSTRAINT "capstone_machinery_images_machine_id_capstone_machinery_stock_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."capstone_machinery_stock"("machine_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_machinery_stock" ADD CONSTRAINT "capstone_machinery_stock_location_id_capstone_location_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."capstone_location"("location_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_part_images" ADD CONSTRAINT "capstone_part_images_part_id_capstone_part_stock_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."capstone_part_stock"("part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_part_machinery" ADD CONSTRAINT "capstone_part_machinery_part_id_capstone_part_stock_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."capstone_part_stock"("part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_part_machinery" ADD CONSTRAINT "capstone_part_machinery_machine_id_capstone_machinery_stock_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."capstone_machinery_stock"("machine_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_part_stock" ADD CONSTRAINT "capstone_part_stock_location_id_capstone_location_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."capstone_location"("location_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_parts_in_tasks" ADD CONSTRAINT "capstone_parts_in_tasks_task_id_capstone_work_task_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."capstone_work_task"("task_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_parts_in_tasks" ADD CONSTRAINT "capstone_parts_in_tasks_part_id_capstone_part_stock_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."capstone_part_stock"("part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_tool_images" ADD CONSTRAINT "capstone_tool_images_tool_id_capstone_tool_stock_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."capstone_tool_stock"("tool_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_tool_stock" ADD CONSTRAINT "capstone_tool_stock_location_id_capstone_location_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."capstone_location"("location_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_tools_in_tasks" ADD CONSTRAINT "capstone_tools_in_tasks_task_id_capstone_work_task_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."capstone_work_task"("task_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_tools_in_tasks" ADD CONSTRAINT "capstone_tools_in_tasks_tool_id_capstone_tool_stock_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."capstone_tool_stock"("tool_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_work_column" ADD CONSTRAINT "capstone_work_column_order_id_capstone_work_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."capstone_work_order"("order_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_work_order" ADD CONSTRAINT "capstone_work_order_machine_id_capstone_machinery_stock_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."capstone_machinery_stock"("machine_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_work_order" ADD CONSTRAINT "capstone_work_order_assigned_to_capstone_user_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."capstone_user"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_work_task" ADD CONSTRAINT "capstone_work_task_column_id_capstone_work_column_column_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."capstone_work_column"("column_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_work_task" ADD CONSTRAINT "capstone_work_task_assigned_to_capstone_employee_employee_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."capstone_employee"("employee_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "id_idx" ON "capstone_employee" ("employee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_location_idx" ON "capstone_location" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "address_location_idx" ON "capstone_location" ("address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "machine_id_idx" ON "capstone_machinery_stock" ("machine_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_machinery_idx" ON "capstone_part_machinery" ("part_id","machine_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_id_idx" ON "capstone_part_stock" ("part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_task_id_idx" ON "capstone_parts_in_tasks" ("part_task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tool_id_idx" ON "capstone_tool_stock" ("tool_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tool_task_id_idx" ON "capstone_tools_in_tasks" ("tool_task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "capstone_user" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "column_id_idx" ON "capstone_work_column" ("column_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_idx" ON "capstone_work_order" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_id_idx" ON "capstone_work_task" ("task_id");