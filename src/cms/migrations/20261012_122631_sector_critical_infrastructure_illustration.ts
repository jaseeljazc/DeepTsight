import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_home_perth_context_sectors_illustration" ADD VALUE 'sector-critical-infrastructure';
  ALTER TYPE "public"."enum__home_v_version_perth_context_sectors_illustration" ADD VALUE 'sector-critical-infrastructure';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_perth_context_sectors" ALTER COLUMN "illustration" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_perth_context_sectors_illustration";
  CREATE TYPE "public"."enum_home_perth_context_sectors_illustration" AS ENUM('sector-oil-gas-upstream', 'sector-oil-gas-downstream', 'sector-mining', 'sector-water', 'sector-power', 'sector-remote-operations');
  ALTER TABLE "home_perth_context_sectors" ALTER COLUMN "illustration" SET DATA TYPE "public"."enum_home_perth_context_sectors_illustration" USING "illustration"::"public"."enum_home_perth_context_sectors_illustration";
  ALTER TABLE "_home_v_version_perth_context_sectors" ALTER COLUMN "illustration" SET DATA TYPE text;
  DROP TYPE "public"."enum__home_v_version_perth_context_sectors_illustration";
  CREATE TYPE "public"."enum__home_v_version_perth_context_sectors_illustration" AS ENUM('sector-oil-gas-upstream', 'sector-oil-gas-downstream', 'sector-mining', 'sector-water', 'sector-power', 'sector-remote-operations');
  ALTER TABLE "_home_v_version_perth_context_sectors" ALTER COLUMN "illustration" SET DATA TYPE "public"."enum__home_v_version_perth_context_sectors_illustration" USING "illustration"::"public"."enum__home_v_version_perth_context_sectors_illustration";`)
}
