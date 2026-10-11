import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_perth_context_sectors_illustration" AS ENUM('sector-oil-gas-upstream', 'sector-oil-gas-downstream', 'sector-mining', 'sector-water', 'sector-power', 'sector-remote-operations');
  CREATE TYPE "public"."enum__home_v_version_perth_context_sectors_illustration" AS ENUM('sector-oil-gas-upstream', 'sector-oil-gas-downstream', 'sector-mining', 'sector-water', 'sector-power', 'sector-remote-operations');
  CREATE TABLE "home_delivery_approach_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "_home_v_version_delivery_approach_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "about_experience_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "_about_v_version_experience_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "svc_lc_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "svc_lc_phases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"subtitle" varchar
  );
  
  CREATE TABLE "pages_services_lifecycle_engage_modes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "_svc_lc_activities_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_svc_lc_phases_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_services_lifecycle_engage_modes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_perth_context_sectors" ADD COLUMN "illustration" "enum_home_perth_context_sectors_illustration";
  ALTER TABLE "home" ADD COLUMN "why_deep_tsight_mission" varchar;
  ALTER TABLE "_home_v_version_perth_context_sectors" ADD COLUMN "illustration" "enum__home_v_version_perth_context_sectors_illustration";
  ALTER TABLE "_home_v" ADD COLUMN "version_why_deep_tsight_mission" varchar;
  ALTER TABLE "about" ADD COLUMN "experience_title" varchar;
  ALTER TABLE "about" ADD COLUMN "experience_intro" varchar;
  ALTER TABLE "about" ADD COLUMN "experience_note" varchar;
  ALTER TABLE "_about_v" ADD COLUMN "version_experience_title" varchar;
  ALTER TABLE "_about_v" ADD COLUMN "version_experience_intro" varchar;
  ALTER TABLE "_about_v" ADD COLUMN "version_experience_note" varchar;
  ALTER TABLE "pages" ADD COLUMN "services_lifecycle_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "services_lifecycle_intro" varchar;
  ALTER TABLE "pages" ADD COLUMN "services_lifecycle_engage_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "services_lifecycle_note" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_services_lifecycle_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_services_lifecycle_intro" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_services_lifecycle_engage_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_services_lifecycle_note" varchar;
  ALTER TABLE "home_delivery_approach_values" ADD CONSTRAINT "home_delivery_approach_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_delivery_approach_values" ADD CONSTRAINT "_home_v_version_delivery_approach_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_experience_items" ADD CONSTRAINT "about_experience_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_experience_items" ADD CONSTRAINT "_about_v_version_experience_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "svc_lc_activities" ADD CONSTRAINT "svc_lc_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."svc_lc_phases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "svc_lc_phases" ADD CONSTRAINT "svc_lc_phases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_services_lifecycle_engage_modes" ADD CONSTRAINT "pages_services_lifecycle_engage_modes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_svc_lc_activities_v" ADD CONSTRAINT "_svc_lc_activities_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_svc_lc_phases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_svc_lc_phases_v" ADD CONSTRAINT "_svc_lc_phases_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_services_lifecycle_engage_modes" ADD CONSTRAINT "_pages_v_version_services_lifecycle_engage_modes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_delivery_approach_values_order_idx" ON "home_delivery_approach_values" USING btree ("_order");
  CREATE INDEX "home_delivery_approach_values_parent_id_idx" ON "home_delivery_approach_values" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_delivery_approach_values_order_idx" ON "_home_v_version_delivery_approach_values" USING btree ("_order");
  CREATE INDEX "_home_v_version_delivery_approach_values_parent_id_idx" ON "_home_v_version_delivery_approach_values" USING btree ("_parent_id");
  CREATE INDEX "about_experience_items_order_idx" ON "about_experience_items" USING btree ("_order");
  CREATE INDEX "about_experience_items_parent_id_idx" ON "about_experience_items" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_experience_items_order_idx" ON "_about_v_version_experience_items" USING btree ("_order");
  CREATE INDEX "_about_v_version_experience_items_parent_id_idx" ON "_about_v_version_experience_items" USING btree ("_parent_id");
  CREATE INDEX "svc_lc_activities_order_idx" ON "svc_lc_activities" USING btree ("_order");
  CREATE INDEX "svc_lc_activities_parent_id_idx" ON "svc_lc_activities" USING btree ("_parent_id");
  CREATE INDEX "svc_lc_phases_order_idx" ON "svc_lc_phases" USING btree ("_order");
  CREATE INDEX "svc_lc_phases_parent_id_idx" ON "svc_lc_phases" USING btree ("_parent_id");
  CREATE INDEX "pages_services_lifecycle_engage_modes_order_idx" ON "pages_services_lifecycle_engage_modes" USING btree ("_order");
  CREATE INDEX "pages_services_lifecycle_engage_modes_parent_id_idx" ON "pages_services_lifecycle_engage_modes" USING btree ("_parent_id");
  CREATE INDEX "_svc_lc_activities_v_order_idx" ON "_svc_lc_activities_v" USING btree ("_order");
  CREATE INDEX "_svc_lc_activities_v_parent_id_idx" ON "_svc_lc_activities_v" USING btree ("_parent_id");
  CREATE INDEX "_svc_lc_phases_v_order_idx" ON "_svc_lc_phases_v" USING btree ("_order");
  CREATE INDEX "_svc_lc_phases_v_parent_id_idx" ON "_svc_lc_phases_v" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_services_lifecycle_engage_modes_order_idx" ON "_pages_v_version_services_lifecycle_engage_modes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_services_lifecycle_engage_modes_parent_id_idx" ON "_pages_v_version_services_lifecycle_engage_modes" USING btree ("_parent_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_delivery_approach_values" CASCADE;
  DROP TABLE "_home_v_version_delivery_approach_values" CASCADE;
  DROP TABLE "about_experience_items" CASCADE;
  DROP TABLE "_about_v_version_experience_items" CASCADE;
  DROP TABLE "svc_lc_activities" CASCADE;
  DROP TABLE "svc_lc_phases" CASCADE;
  DROP TABLE "pages_services_lifecycle_engage_modes" CASCADE;
  DROP TABLE "_svc_lc_activities_v" CASCADE;
  DROP TABLE "_svc_lc_phases_v" CASCADE;
  DROP TABLE "_pages_v_version_services_lifecycle_engage_modes" CASCADE;
  ALTER TABLE "home_perth_context_sectors" DROP COLUMN "illustration";
  ALTER TABLE "home" DROP COLUMN "why_deep_tsight_mission";
  ALTER TABLE "_home_v_version_perth_context_sectors" DROP COLUMN "illustration";
  ALTER TABLE "_home_v" DROP COLUMN "version_why_deep_tsight_mission";
  ALTER TABLE "about" DROP COLUMN "experience_title";
  ALTER TABLE "about" DROP COLUMN "experience_intro";
  ALTER TABLE "about" DROP COLUMN "experience_note";
  ALTER TABLE "_about_v" DROP COLUMN "version_experience_title";
  ALTER TABLE "_about_v" DROP COLUMN "version_experience_intro";
  ALTER TABLE "_about_v" DROP COLUMN "version_experience_note";
  ALTER TABLE "pages" DROP COLUMN "services_lifecycle_title";
  ALTER TABLE "pages" DROP COLUMN "services_lifecycle_intro";
  ALTER TABLE "pages" DROP COLUMN "services_lifecycle_engage_title";
  ALTER TABLE "pages" DROP COLUMN "services_lifecycle_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_services_lifecycle_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_services_lifecycle_intro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_services_lifecycle_engage_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_services_lifecycle_note";
  DROP TYPE "public"."enum_home_perth_context_sectors_illustration";
  DROP TYPE "public"."enum__home_v_version_perth_context_sectors_illustration";`);
}
