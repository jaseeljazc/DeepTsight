import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN "version_seo_og_image_id" integer;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_seo_seo_og_image_idx" ON "services" USING btree ("seo_og_image_id");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP CONSTRAINT "services_seo_og_image_id_media_id_fk";
  
  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk";
  
  DROP INDEX "services_seo_seo_og_image_idx";
  DROP INDEX "_services_v_version_seo_version_seo_og_image_idx";
  ALTER TABLE "services" DROP COLUMN "seo_og_image_id";
  ALTER TABLE "_services_v" DROP COLUMN "version_seo_og_image_id";`);
}
