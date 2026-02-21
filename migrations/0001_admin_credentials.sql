CREATE TYPE "public"."admin_role" AS ENUM('system', 'custom');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" "public"."admin_role" DEFAULT 'custom' NOT NULL,
    "secret_key" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
