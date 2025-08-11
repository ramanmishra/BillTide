CREATE TABLE "users" (
	"owner_id" varchar(120) PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(200),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
