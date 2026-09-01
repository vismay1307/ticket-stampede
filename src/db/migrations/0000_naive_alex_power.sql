CREATE TABLE "tickets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"total_quantity" integer NOT NULL,
	"available_quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
