CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"owner_id" varchar(120) NOT NULL,
	"name" varchar(200) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"billing_cycle" varchar(10) NOT NULL,
	"next_charge_date" varchar(30) NOT NULL,
	"category" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
