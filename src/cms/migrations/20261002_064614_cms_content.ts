import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_icon" AS ENUM('Cpu', 'Network', 'Split', 'Gauge', 'Activity', 'Cable', 'Server', 'Workflow', 'Waypoints', 'Router', 'Cog', 'Wrench');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_icon" AS ENUM('Cpu', 'Network', 'Split', 'Gauge', 'Activity', 'Cable', 'Server', 'Workflow', 'Waypoints', 'Router', 'Cog', 'Wrench');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_proof_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__proof_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_credentials_category" AS ENUM('qualifications', 'registrations', 'certifications', 'platforms');
  CREATE TYPE "public"."enum_credentials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__credentials_v_version_category" AS ENUM('qualifications', 'registrations', 'certifications', 'platforms');
  CREATE TYPE "public"."enum__credentials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_credential_groups_category" AS ENUM('qualifications', 'registrations', 'certifications', 'platforms');
  CREATE TYPE "public"."enum_credential_groups_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__credential_groups_v_version_category" AS ENUM('qualifications', 'registrations', 'certifications', 'platforms');
  CREATE TYPE "public"."enum__credential_groups_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_kind" AS ENUM('image', 'slot');
  CREATE TYPE "public"."enum_media_asset_class" AS ENUM('photograph', 'illustration', 'issuer-badge');
  CREATE TYPE "public"."enum_media_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__media_v_version_kind" AS ENUM('image', 'slot');
  CREATE TYPE "public"."enum__media_v_version_asset_class" AS ENUM('photograph', 'illustration', 'issuer-badge');
  CREATE TYPE "public"."enum__media_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_article_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_legal_pages_slug" AS ENUM('privacy', 'terms', 'accessibility');
  CREATE TYPE "public"."enum_legal_pages_adviser_status" AS ENUM('pending-adviser', 'approved');
  CREATE TYPE "public"."enum_legal_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_pages_v_version_slug" AS ENUM('privacy', 'terms', 'accessibility');
  CREATE TYPE "public"."enum__legal_pages_v_version_adviser_status" AS ENUM('pending-adviser', 'approved');
  CREATE TYPE "public"."enum__legal_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_enquiries_email_status" AS ENUM('pending', 'sent', 'failed', 'simulated');
  CREATE TYPE "public"."enum_site_settings_social_links_platform" AS ENUM('linkedin', 'x', 'youtube', 'github', 'facebook', 'instagram');
  CREATE TYPE "public"."enum_site_settings_business_hours_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_social_links_platform" AS ENUM('linkedin', 'x', 'youtube', 'github', 'facebook', 'instagram');
  CREATE TYPE "public"."enum__site_settings_v_version_business_hours_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_seo_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__seo_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "services_scope_and_outputs_outputs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "services_scope_and_outputs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scope" varchar
  );
  
  CREATE TABLE "services_delivery_approach" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_standards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"short_title" varchar,
  	"summary" varchar,
  	"outcome" varchar,
  	"icon" "enum_services_icon",
  	"challenge" varchar,
  	"why_it_matters" varchar,
  	"capability" varchar,
  	"evidence" varchar,
  	"media_hero_id" integer,
  	"media_detail_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"first_published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "_services_v_version_scope_and_outputs_outputs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_scope_and_outputs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"scope" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_delivery_approach" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_standards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_short_title" varchar,
  	"version_summary" varchar,
  	"version_outcome" varchar,
  	"version_icon" "enum__services_v_version_icon",
  	"version_challenge" varchar,
  	"version_why_it_matters" varchar,
  	"version_capability" varchar,
  	"version_evidence" varchar,
  	"version_media_hero_id" integer,
  	"version_media_detail_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_enabled" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_first_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "proof_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legacy_id" varchar,
  	"sector" varchar,
  	"challenge" varchar,
  	"outcome" varchar,
  	"metric" varchar,
  	"disclosure_approved" boolean DEFAULT false,
  	"no_identifying_details_confirmed" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_proof_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_proof_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legacy_id" varchar,
  	"version_sector" varchar,
  	"version_challenge" varchar,
  	"version_outcome" varchar,
  	"version_metric" varchar,
  	"version_disclosure_approved" boolean DEFAULT false,
  	"version_no_identifying_details_confirmed" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__proof_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "credentials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legacy_id" varchar,
  	"category" "enum_credentials_category",
  	"title" varchar,
  	"issuer" varchar,
  	"identifier" varchar,
  	"year" varchar,
  	"expiry" varchar,
  	"url" varchar,
  	"badge_id" integer,
  	"verified" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_credentials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_credentials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legacy_id" varchar,
  	"version_category" "enum__credentials_v_version_category",
  	"version_title" varchar,
  	"version_issuer" varchar,
  	"version_identifier" varchar,
  	"version_year" varchar,
  	"version_expiry" varchar,
  	"version_url" varchar,
  	"version_badge_id" integer,
  	"version_verified" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__credentials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "credential_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_credential_groups_category",
  	"title" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_credential_groups_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_credential_groups_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" "enum__credential_groups_v_version_category",
  	"version_title" varchar,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__credential_groups_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legacy_id" varchar,
  	"kind" "enum_media_kind" DEFAULT 'image',
  	"asset_class" "enum_media_asset_class" DEFAULT 'photograph',
  	"alt" varchar,
  	"decorative" boolean DEFAULT false,
  	"caption" varchar,
  	"subject" varchar,
  	"prompt_ref" varchar,
  	"source" varchar,
  	"licence" varchar,
  	"usage_rights" varchar,
  	"attribution" varchar,
  	"approved_for_public" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_media_status" DEFAULT 'draft',
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legacy_id" varchar,
  	"version_kind" "enum__media_v_version_kind" DEFAULT 'image',
  	"version_asset_class" "enum__media_v_version_asset_class" DEFAULT 'photograph',
  	"version_alt" varchar,
  	"version_decorative" boolean DEFAULT false,
  	"version_caption" varchar,
  	"version_subject" varchar,
  	"version_prompt_ref" varchar,
  	"version_source" varchar,
  	"version_licence" varchar,
  	"version_usage_rights" varchar,
  	"version_attribution" varchar,
  	"version_approved_for_public" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__media_v_version_status" DEFAULT 'draft',
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"summary" varchar,
  	"body" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"reading_minutes" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"first_published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_categories_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_reading_minutes" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_first_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_categories_id" integer
  );
  
  CREATE TABLE "article_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"first_published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_article_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_article_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_first_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__article_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "legal_pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_legal_pages_slug",
  	"title" varchar,
  	"last_updated" varchar,
  	"reference" varchar,
  	"adviser_status" "enum_legal_pages_adviser_status" DEFAULT 'pending-adviser',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_legal_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_legal_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__legal_pages_v_version_slug",
  	"version_title" varchar,
  	"version_last_updated" varchar,
  	"version_reference" varchar,
  	"version_adviser_status" "enum__legal_pages_v_version_adviser_status" DEFAULT 'pending-adviser',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"read" boolean DEFAULT false,
  	"name" varchar NOT NULL,
  	"work_email" varchar NOT NULL,
  	"organisation" varchar,
  	"phone" varchar,
  	"enquiry_type_value" varchar NOT NULL,
  	"enquiry_type_label" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"email_status" "enum_enquiries_email_status" DEFAULT 'pending' NOT NULL,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiry_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_links_platform",
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_business_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_site_settings_business_hours_day",
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar,
  	"display_name" varchar,
  	"tagline" varchar,
  	"abn" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"linked_in" varchar,
  	"location_label" varchar,
  	"maps_url" varchar,
  	"response_time" varchar,
  	"service_area" varchar,
  	"office_address_street" varchar,
  	"office_address_locality" varchar,
  	"office_address_region" varchar,
  	"office_address_postcode" varchar,
  	"show_office_address" boolean DEFAULT false,
  	"show_business_hours" boolean DEFAULT false,
  	"nav_labels_home" varchar,
  	"nav_labels_about" varchar,
  	"nav_labels_services" varchar,
  	"nav_labels_credentials" varchar,
  	"nav_labels_insights" varchar,
  	"nav_labels_contact" varchar,
  	"cta_labels_primary" varchar,
  	"cta_labels_secondary" varchar,
  	"cta_labels_credentials" varchar,
  	"cta_labels_header" varchar,
  	"ui_labels_all_services" varchar,
  	"ui_labels_view_service" varchar,
  	"ui_labels_view_prefix" varchar,
  	"ui_labels_return_home" varchar,
  	"ui_labels_connect_on_linked_in" varchar,
  	"ui_labels_on_linked_in_suffix" varchar,
  	"ui_labels_or_email" varchar,
  	"ui_labels_or_call" varchar,
  	"ui_labels_open_in_maps" varchar,
  	"insights_enabled" boolean DEFAULT false,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__site_settings_v_version_social_links_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_business_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__site_settings_v_version_business_hours_day",
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_legal_name" varchar,
  	"version_display_name" varchar,
  	"version_tagline" varchar,
  	"version_abn" varchar,
  	"version_address" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_linked_in" varchar,
  	"version_location_label" varchar,
  	"version_maps_url" varchar,
  	"version_response_time" varchar,
  	"version_service_area" varchar,
  	"version_office_address_street" varchar,
  	"version_office_address_locality" varchar,
  	"version_office_address_region" varchar,
  	"version_office_address_postcode" varchar,
  	"version_show_office_address" boolean DEFAULT false,
  	"version_show_business_hours" boolean DEFAULT false,
  	"version_nav_labels_home" varchar,
  	"version_nav_labels_about" varchar,
  	"version_nav_labels_services" varchar,
  	"version_nav_labels_credentials" varchar,
  	"version_nav_labels_insights" varchar,
  	"version_nav_labels_contact" varchar,
  	"version_cta_labels_primary" varchar,
  	"version_cta_labels_secondary" varchar,
  	"version_cta_labels_credentials" varchar,
  	"version_cta_labels_header" varchar,
  	"version_ui_labels_all_services" varchar,
  	"version_ui_labels_view_service" varchar,
  	"version_ui_labels_view_prefix" varchar,
  	"version_ui_labels_return_home" varchar,
  	"version_ui_labels_connect_on_linked_in" varchar,
  	"version_ui_labels_on_linked_in_suffix" varchar,
  	"version_ui_labels_or_email" varchar,
  	"version_ui_labels_or_call" varchar,
  	"version_ui_labels_open_in_maps" varchar,
  	"version_insights_enabled" boolean DEFAULT false,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "home_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"mono" boolean DEFAULT false
  );
  
  CREATE TABLE "home_core_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"title" varchar,
  	"outcome" varchar
  );
  
  CREATE TABLE "home_why_deep_tsight_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "home_why_deep_tsight_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_problems_addressed_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"challenge" varchar,
  	"solution" varchar
  );
  
  CREATE TABLE "home_delivery_approach_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_perth_context_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_headline" varchar,
  	"hero_supporting_text" varchar,
  	"trust_strip_copy_title" varchar,
  	"trust_strip_copy_register_link_label" varchar,
  	"trust_strip_copy_category_labels_qualifications" varchar,
  	"trust_strip_copy_category_labels_registrations" varchar,
  	"trust_strip_copy_category_labels_certifications" varchar,
  	"trust_strip_copy_category_labels_platforms" varchar,
  	"core_capabilities_title" varchar,
  	"core_capabilities_intro" varchar,
  	"why_deep_tsight_title" varchar,
  	"why_deep_tsight_convergence_label" varchar,
  	"problems_addressed_title" varchar,
  	"delivery_approach_title" varchar,
  	"delivery_approach_intro" varchar,
  	"selected_proof_title" varchar,
  	"perth_context_title" varchar,
  	"perth_context_description" varchar,
  	"perth_context_office_area" varchar,
  	"final_cta_title" varchar,
  	"final_cta_supporting_text" varchar,
  	"media_problems_id" integer,
  	"media_why_id" integer,
  	"media_close_id" integer,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"credentials_id" integer,
  	"proof_items_id" integer
  );
  
  CREATE TABLE "_home_v_version_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"mono" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_core_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"title" varchar,
  	"outcome" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_why_deep_tsight_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_why_deep_tsight_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_problems_addressed_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"challenge" varchar,
  	"solution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_delivery_approach_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_perth_context_sectors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_headline" varchar,
  	"version_hero_supporting_text" varchar,
  	"version_trust_strip_copy_title" varchar,
  	"version_trust_strip_copy_register_link_label" varchar,
  	"version_trust_strip_copy_category_labels_qualifications" varchar,
  	"version_trust_strip_copy_category_labels_registrations" varchar,
  	"version_trust_strip_copy_category_labels_certifications" varchar,
  	"version_trust_strip_copy_category_labels_platforms" varchar,
  	"version_core_capabilities_title" varchar,
  	"version_core_capabilities_intro" varchar,
  	"version_why_deep_tsight_title" varchar,
  	"version_why_deep_tsight_convergence_label" varchar,
  	"version_problems_addressed_title" varchar,
  	"version_delivery_approach_title" varchar,
  	"version_delivery_approach_intro" varchar,
  	"version_selected_proof_title" varchar,
  	"version_perth_context_title" varchar,
  	"version_perth_context_description" varchar,
  	"version_perth_context_office_area" varchar,
  	"version_final_cta_title" varchar,
  	"version_final_cta_supporting_text" varchar,
  	"version_media_problems_id" integer,
  	"version_media_why_id" integer,
  	"version_media_close_id" integer,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_home_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"credentials_id" integer,
  	"proof_items_id" integer
  );
  
  CREATE TABLE "about_narrative_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "about_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "about_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"role" varchar,
  	"context" varchar
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"founder_name" varchar,
  	"founder_job_title" varchar,
  	"narrative_title" varchar,
  	"media_portrait_id" integer,
  	"media_site_id" integer,
  	"media_desk_id" integer,
  	"_status" "enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_about_v_version_narrative_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v_version_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v_version_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"role" varchar,
  	"context" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_founder_name" varchar,
  	"version_founder_job_title" varchar,
  	"version_narrative_title" varchar,
  	"version_media_portrait_id" integer,
  	"version_media_site_id" integer,
  	"version_media_desk_id" integer,
  	"version__status" "enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "pages_thank_you_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"about_final_cta_title" varchar,
  	"about_final_cta_supporting_text" varchar,
  	"services_title" varchar,
  	"services_lead" varchar,
  	"services_final_cta_title" varchar,
  	"services_final_cta_supporting_text" varchar,
  	"services_figure_id" integer,
  	"service_template_engagement" varchar,
  	"service_template_enquiry_title_prefix" varchar,
  	"service_template_supporting_text" varchar,
  	"credentials_title" varchar,
  	"credentials_lead" varchar,
  	"credentials_final_cta_title" varchar,
  	"credentials_final_cta_supporting_text" varchar,
  	"credentials_figure_id" integer,
  	"contact_lead" varchar,
  	"contact_before_you_write_title" varchar,
  	"contact_before_you_write_body" varchar,
  	"contact_figure_id" integer,
  	"thank_you_title" varchar,
  	"thank_you_lead" varchar,
  	"thank_you_next_steps_title" varchar,
  	"_status" "enum_pages_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_pages_v_version_thank_you_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_about_final_cta_title" varchar,
  	"version_about_final_cta_supporting_text" varchar,
  	"version_services_title" varchar,
  	"version_services_lead" varchar,
  	"version_services_final_cta_title" varchar,
  	"version_services_final_cta_supporting_text" varchar,
  	"version_services_figure_id" integer,
  	"version_service_template_engagement" varchar,
  	"version_service_template_enquiry_title_prefix" varchar,
  	"version_service_template_supporting_text" varchar,
  	"version_credentials_title" varchar,
  	"version_credentials_lead" varchar,
  	"version_credentials_final_cta_title" varchar,
  	"version_credentials_final_cta_supporting_text" varchar,
  	"version_credentials_figure_id" integer,
  	"version_contact_lead" varchar,
  	"version_contact_before_you_write_title" varchar,
  	"version_contact_before_you_write_body" varchar,
  	"version_contact_figure_id" integer,
  	"version_thank_you_title" varchar,
  	"version_thank_you_lead" varchar,
  	"version_thank_you_next_steps_title" varchar,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_title" varchar,
  	"home_description" varchar,
  	"home_og_image_id" integer,
  	"about_title" varchar,
  	"about_description" varchar,
  	"about_og_image_id" integer,
  	"services_title" varchar,
  	"services_description" varchar,
  	"services_og_image_id" integer,
  	"credentials_title" varchar,
  	"credentials_description" varchar,
  	"credentials_og_image_id" integer,
  	"insights_title" varchar,
  	"insights_description" varchar,
  	"insights_og_image_id" integer,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"contact_og_image_id" integer,
  	"thank_you_title" varchar,
  	"thank_you_description" varchar,
  	"thank_you_og_image_id" integer,
  	"privacy_title" varchar,
  	"privacy_description" varchar,
  	"privacy_og_image_id" integer,
  	"terms_title" varchar,
  	"terms_description" varchar,
  	"terms_og_image_id" integer,
  	"accessibility_title" varchar,
  	"accessibility_description" varchar,
  	"accessibility_og_image_id" integer,
  	"_status" "enum_seo_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_seo_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_home_title" varchar,
  	"version_home_description" varchar,
  	"version_home_og_image_id" integer,
  	"version_about_title" varchar,
  	"version_about_description" varchar,
  	"version_about_og_image_id" integer,
  	"version_services_title" varchar,
  	"version_services_description" varchar,
  	"version_services_og_image_id" integer,
  	"version_credentials_title" varchar,
  	"version_credentials_description" varchar,
  	"version_credentials_og_image_id" integer,
  	"version_insights_title" varchar,
  	"version_insights_description" varchar,
  	"version_insights_og_image_id" integer,
  	"version_contact_title" varchar,
  	"version_contact_description" varchar,
  	"version_contact_og_image_id" integer,
  	"version_thank_you_title" varchar,
  	"version_thank_you_description" varchar,
  	"version_thank_you_og_image_id" integer,
  	"version_privacy_title" varchar,
  	"version_privacy_description" varchar,
  	"version_privacy_og_image_id" integer,
  	"version_terms_title" varchar,
  	"version_terms_description" varchar,
  	"version_terms_og_image_id" integer,
  	"version_accessibility_title" varchar,
  	"version_accessibility_description" varchar,
  	"version_accessibility_og_image_id" integer,
  	"version__status" "enum__seo_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "proof_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "credentials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "credential_groups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "article_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "legal_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiry_types_id" integer;
  ALTER TABLE "services_scope_and_outputs_outputs" ADD CONSTRAINT "services_scope_and_outputs_outputs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_scope_and_outputs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_scope_and_outputs" ADD CONSTRAINT "services_scope_and_outputs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_delivery_approach" ADD CONSTRAINT "services_delivery_approach_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_standards" ADD CONSTRAINT "services_standards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_media_hero_id_media_id_fk" FOREIGN KEY ("media_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_media_detail_id_media_id_fk" FOREIGN KEY ("media_detail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_scope_and_outputs_outputs" ADD CONSTRAINT "_services_v_version_scope_and_outputs_outputs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_scope_and_outputs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_scope_and_outputs" ADD CONSTRAINT "_services_v_version_scope_and_outputs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_delivery_approach" ADD CONSTRAINT "_services_v_version_delivery_approach_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_standards" ADD CONSTRAINT "_services_v_version_standards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_media_hero_id_media_id_fk" FOREIGN KEY ("version_media_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_media_detail_id_media_id_fk" FOREIGN KEY ("version_media_detail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proof_items_v" ADD CONSTRAINT "_proof_items_v_parent_id_proof_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proof_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "credentials" ADD CONSTRAINT "credentials_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credentials_v" ADD CONSTRAINT "_credentials_v_parent_id_credentials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credentials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credentials_v" ADD CONSTRAINT "_credentials_v_version_badge_id_media_id_fk" FOREIGN KEY ("version_badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credential_groups_v" ADD CONSTRAINT "_credential_groups_v_parent_id_credential_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credential_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_pages_sections" ADD CONSTRAINT "legal_pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v_version_sections" ADD CONSTRAINT "_legal_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_parent_id_legal_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_business_hours" ADD CONSTRAINT "site_settings_business_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_business_hours" ADD CONSTRAINT "_site_settings_v_version_business_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_hero_facts" ADD CONSTRAINT "home_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_core_capabilities" ADD CONSTRAINT "home_core_capabilities_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_core_capabilities" ADD CONSTRAINT "home_core_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_why_deep_tsight_paragraphs" ADD CONSTRAINT "home_why_deep_tsight_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_why_deep_tsight_pillars" ADD CONSTRAINT "home_why_deep_tsight_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_problems_addressed_items" ADD CONSTRAINT "home_problems_addressed_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_delivery_approach_steps" ADD CONSTRAINT "home_delivery_approach_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_perth_context_sectors" ADD CONSTRAINT "home_perth_context_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_media_problems_id_media_id_fk" FOREIGN KEY ("media_problems_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_media_why_id_media_id_fk" FOREIGN KEY ("media_why_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_media_close_id_media_id_fk" FOREIGN KEY ("media_close_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_credentials_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_proof_items_fk" FOREIGN KEY ("proof_items_id") REFERENCES "public"."proof_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_hero_facts" ADD CONSTRAINT "_home_v_version_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_core_capabilities" ADD CONSTRAINT "_home_v_version_core_capabilities_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_core_capabilities" ADD CONSTRAINT "_home_v_version_core_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_why_deep_tsight_paragraphs" ADD CONSTRAINT "_home_v_version_why_deep_tsight_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_why_deep_tsight_pillars" ADD CONSTRAINT "_home_v_version_why_deep_tsight_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_problems_addressed_items" ADD CONSTRAINT "_home_v_version_problems_addressed_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_delivery_approach_steps" ADD CONSTRAINT "_home_v_version_delivery_approach_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_perth_context_sectors" ADD CONSTRAINT "_home_v_version_perth_context_sectors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_media_problems_id_media_id_fk" FOREIGN KEY ("version_media_problems_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_media_why_id_media_id_fk" FOREIGN KEY ("version_media_why_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_media_close_id_media_id_fk" FOREIGN KEY ("version_media_close_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_credentials_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_proof_items_fk" FOREIGN KEY ("proof_items_id") REFERENCES "public"."proof_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_narrative_paragraphs" ADD CONSTRAINT "about_narrative_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_principles" ADD CONSTRAINT "about_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_timeline" ADD CONSTRAINT "about_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_media_portrait_id_media_id_fk" FOREIGN KEY ("media_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_media_site_id_media_id_fk" FOREIGN KEY ("media_site_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_media_desk_id_media_id_fk" FOREIGN KEY ("media_desk_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_narrative_paragraphs" ADD CONSTRAINT "_about_v_version_narrative_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_principles" ADD CONSTRAINT "_about_v_version_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_timeline" ADD CONSTRAINT "_about_v_version_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_media_portrait_id_media_id_fk" FOREIGN KEY ("version_media_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_media_site_id_media_id_fk" FOREIGN KEY ("version_media_site_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_media_desk_id_media_id_fk" FOREIGN KEY ("version_media_desk_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_thank_you_next_steps" ADD CONSTRAINT "pages_thank_you_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_services_figure_id_media_id_fk" FOREIGN KEY ("services_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_credentials_figure_id_media_id_fk" FOREIGN KEY ("credentials_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_contact_figure_id_media_id_fk" FOREIGN KEY ("contact_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_thank_you_next_steps" ADD CONSTRAINT "_pages_v_version_thank_you_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_services_figure_id_media_id_fk" FOREIGN KEY ("version_services_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_credentials_figure_id_media_id_fk" FOREIGN KEY ("version_credentials_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_contact_figure_id_media_id_fk" FOREIGN KEY ("version_contact_figure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_home_og_image_id_media_id_fk" FOREIGN KEY ("home_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_about_og_image_id_media_id_fk" FOREIGN KEY ("about_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_services_og_image_id_media_id_fk" FOREIGN KEY ("services_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_credentials_og_image_id_media_id_fk" FOREIGN KEY ("credentials_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_insights_og_image_id_media_id_fk" FOREIGN KEY ("insights_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_contact_og_image_id_media_id_fk" FOREIGN KEY ("contact_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_thank_you_og_image_id_media_id_fk" FOREIGN KEY ("thank_you_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_privacy_og_image_id_media_id_fk" FOREIGN KEY ("privacy_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_terms_og_image_id_media_id_fk" FOREIGN KEY ("terms_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_accessibility_og_image_id_media_id_fk" FOREIGN KEY ("accessibility_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_home_og_image_id_media_id_fk" FOREIGN KEY ("version_home_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_about_og_image_id_media_id_fk" FOREIGN KEY ("version_about_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_services_og_image_id_media_id_fk" FOREIGN KEY ("version_services_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_credentials_og_image_id_media_id_fk" FOREIGN KEY ("version_credentials_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_insights_og_image_id_media_id_fk" FOREIGN KEY ("version_insights_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_contact_og_image_id_media_id_fk" FOREIGN KEY ("version_contact_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_thank_you_og_image_id_media_id_fk" FOREIGN KEY ("version_thank_you_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_privacy_og_image_id_media_id_fk" FOREIGN KEY ("version_privacy_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_terms_og_image_id_media_id_fk" FOREIGN KEY ("version_terms_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_seo_v" ADD CONSTRAINT "_seo_v_version_accessibility_og_image_id_media_id_fk" FOREIGN KEY ("version_accessibility_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_scope_and_outputs_outputs_order_idx" ON "services_scope_and_outputs_outputs" USING btree ("_order");
  CREATE INDEX "services_scope_and_outputs_outputs_parent_id_idx" ON "services_scope_and_outputs_outputs" USING btree ("_parent_id");
  CREATE INDEX "services_scope_and_outputs_order_idx" ON "services_scope_and_outputs" USING btree ("_order");
  CREATE INDEX "services_scope_and_outputs_parent_id_idx" ON "services_scope_and_outputs" USING btree ("_parent_id");
  CREATE INDEX "services_delivery_approach_order_idx" ON "services_delivery_approach" USING btree ("_order");
  CREATE INDEX "services_delivery_approach_parent_id_idx" ON "services_delivery_approach" USING btree ("_parent_id");
  CREATE INDEX "services_standards_order_idx" ON "services_standards" USING btree ("_order");
  CREATE INDEX "services_standards_parent_id_idx" ON "services_standards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_media_media_hero_idx" ON "services" USING btree ("media_hero_id");
  CREATE INDEX "services_media_media_detail_idx" ON "services" USING btree ("media_detail_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "_services_v_version_scope_and_outputs_outputs_order_idx" ON "_services_v_version_scope_and_outputs_outputs" USING btree ("_order");
  CREATE INDEX "_services_v_version_scope_and_outputs_outputs_parent_id_idx" ON "_services_v_version_scope_and_outputs_outputs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_scope_and_outputs_order_idx" ON "_services_v_version_scope_and_outputs" USING btree ("_order");
  CREATE INDEX "_services_v_version_scope_and_outputs_parent_id_idx" ON "_services_v_version_scope_and_outputs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_delivery_approach_order_idx" ON "_services_v_version_delivery_approach" USING btree ("_order");
  CREATE INDEX "_services_v_version_delivery_approach_parent_id_idx" ON "_services_v_version_delivery_approach" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_standards_order_idx" ON "_services_v_version_standards" USING btree ("_order");
  CREATE INDEX "_services_v_version_standards_parent_id_idx" ON "_services_v_version_standards" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_media_version_media_hero_idx" ON "_services_v" USING btree ("version_media_hero_id");
  CREATE INDEX "_services_v_version_media_version_media_detail_idx" ON "_services_v" USING btree ("version_media_detail_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "proof_items_legacy_id_idx" ON "proof_items" USING btree ("legacy_id");
  CREATE INDEX "proof_items_updated_at_idx" ON "proof_items" USING btree ("updated_at");
  CREATE INDEX "proof_items_created_at_idx" ON "proof_items" USING btree ("created_at");
  CREATE INDEX "proof_items__status_idx" ON "proof_items" USING btree ("_status");
  CREATE INDEX "_proof_items_v_parent_idx" ON "_proof_items_v" USING btree ("parent_id");
  CREATE INDEX "_proof_items_v_version_version_legacy_id_idx" ON "_proof_items_v" USING btree ("version_legacy_id");
  CREATE INDEX "_proof_items_v_version_version_updated_at_idx" ON "_proof_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_proof_items_v_version_version_created_at_idx" ON "_proof_items_v" USING btree ("version_created_at");
  CREATE INDEX "_proof_items_v_version_version__status_idx" ON "_proof_items_v" USING btree ("version__status");
  CREATE INDEX "_proof_items_v_created_at_idx" ON "_proof_items_v" USING btree ("created_at");
  CREATE INDEX "_proof_items_v_updated_at_idx" ON "_proof_items_v" USING btree ("updated_at");
  CREATE INDEX "_proof_items_v_latest_idx" ON "_proof_items_v" USING btree ("latest");
  CREATE UNIQUE INDEX "credentials_legacy_id_idx" ON "credentials" USING btree ("legacy_id");
  CREATE INDEX "credentials_badge_idx" ON "credentials" USING btree ("badge_id");
  CREATE INDEX "credentials_updated_at_idx" ON "credentials" USING btree ("updated_at");
  CREATE INDEX "credentials_created_at_idx" ON "credentials" USING btree ("created_at");
  CREATE INDEX "credentials__status_idx" ON "credentials" USING btree ("_status");
  CREATE INDEX "_credentials_v_parent_idx" ON "_credentials_v" USING btree ("parent_id");
  CREATE INDEX "_credentials_v_version_version_legacy_id_idx" ON "_credentials_v" USING btree ("version_legacy_id");
  CREATE INDEX "_credentials_v_version_version_badge_idx" ON "_credentials_v" USING btree ("version_badge_id");
  CREATE INDEX "_credentials_v_version_version_updated_at_idx" ON "_credentials_v" USING btree ("version_updated_at");
  CREATE INDEX "_credentials_v_version_version_created_at_idx" ON "_credentials_v" USING btree ("version_created_at");
  CREATE INDEX "_credentials_v_version_version__status_idx" ON "_credentials_v" USING btree ("version__status");
  CREATE INDEX "_credentials_v_created_at_idx" ON "_credentials_v" USING btree ("created_at");
  CREATE INDEX "_credentials_v_updated_at_idx" ON "_credentials_v" USING btree ("updated_at");
  CREATE INDEX "_credentials_v_latest_idx" ON "_credentials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "credential_groups_category_idx" ON "credential_groups" USING btree ("category");
  CREATE INDEX "credential_groups_updated_at_idx" ON "credential_groups" USING btree ("updated_at");
  CREATE INDEX "credential_groups_created_at_idx" ON "credential_groups" USING btree ("created_at");
  CREATE INDEX "credential_groups__status_idx" ON "credential_groups" USING btree ("_status");
  CREATE INDEX "_credential_groups_v_parent_idx" ON "_credential_groups_v" USING btree ("parent_id");
  CREATE INDEX "_credential_groups_v_version_version_category_idx" ON "_credential_groups_v" USING btree ("version_category");
  CREATE INDEX "_credential_groups_v_version_version_updated_at_idx" ON "_credential_groups_v" USING btree ("version_updated_at");
  CREATE INDEX "_credential_groups_v_version_version_created_at_idx" ON "_credential_groups_v" USING btree ("version_created_at");
  CREATE INDEX "_credential_groups_v_version_version__status_idx" ON "_credential_groups_v" USING btree ("version__status");
  CREATE INDEX "_credential_groups_v_created_at_idx" ON "_credential_groups_v" USING btree ("created_at");
  CREATE INDEX "_credential_groups_v_updated_at_idx" ON "_credential_groups_v" USING btree ("updated_at");
  CREATE INDEX "_credential_groups_v_latest_idx" ON "_credential_groups_v" USING btree ("latest");
  CREATE UNIQUE INDEX "media_legacy_id_idx" ON "media" USING btree ("legacy_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE INDEX "media__status_idx" ON "media" USING btree ("_status");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version_legacy_id_idx" ON "_media_v" USING btree ("version_legacy_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version__status_idx" ON "_media_v" USING btree ("version__status");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_latest_idx" ON "_media_v" USING btree ("latest");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_article_categories_id_idx" ON "articles_rels" USING btree ("article_categories_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_article_categories_id_idx" ON "_articles_v_rels" USING btree ("article_categories_id");
  CREATE UNIQUE INDEX "article_categories_slug_idx" ON "article_categories" USING btree ("slug");
  CREATE INDEX "article_categories_updated_at_idx" ON "article_categories" USING btree ("updated_at");
  CREATE INDEX "article_categories_created_at_idx" ON "article_categories" USING btree ("created_at");
  CREATE INDEX "article_categories__status_idx" ON "article_categories" USING btree ("_status");
  CREATE INDEX "_article_categories_v_parent_idx" ON "_article_categories_v" USING btree ("parent_id");
  CREATE INDEX "_article_categories_v_version_version_slug_idx" ON "_article_categories_v" USING btree ("version_slug");
  CREATE INDEX "_article_categories_v_version_version_updated_at_idx" ON "_article_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_article_categories_v_version_version_created_at_idx" ON "_article_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_article_categories_v_version_version__status_idx" ON "_article_categories_v" USING btree ("version__status");
  CREATE INDEX "_article_categories_v_created_at_idx" ON "_article_categories_v" USING btree ("created_at");
  CREATE INDEX "_article_categories_v_updated_at_idx" ON "_article_categories_v" USING btree ("updated_at");
  CREATE INDEX "_article_categories_v_latest_idx" ON "_article_categories_v" USING btree ("latest");
  CREATE INDEX "legal_pages_sections_order_idx" ON "legal_pages_sections" USING btree ("_order");
  CREATE INDEX "legal_pages_sections_parent_id_idx" ON "legal_pages_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_pages_slug_idx" ON "legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "legal_pages__status_idx" ON "legal_pages" USING btree ("_status");
  CREATE INDEX "_legal_pages_v_version_sections_order_idx" ON "_legal_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_legal_pages_v_version_sections_parent_id_idx" ON "_legal_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_legal_pages_v_parent_idx" ON "_legal_pages_v" USING btree ("parent_id");
  CREATE INDEX "_legal_pages_v_version_version_slug_idx" ON "_legal_pages_v" USING btree ("version_slug");
  CREATE INDEX "_legal_pages_v_version_version_updated_at_idx" ON "_legal_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_pages_v_version_version_created_at_idx" ON "_legal_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_pages_v_version_version__status_idx" ON "_legal_pages_v" USING btree ("version__status");
  CREATE INDEX "_legal_pages_v_created_at_idx" ON "_legal_pages_v" USING btree ("created_at");
  CREATE INDEX "_legal_pages_v_updated_at_idx" ON "_legal_pages_v" USING btree ("updated_at");
  CREATE INDEX "_legal_pages_v_latest_idx" ON "_legal_pages_v" USING btree ("latest");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "enquiry_types_value_idx" ON "enquiry_types" USING btree ("value");
  CREATE INDEX "enquiry_types_updated_at_idx" ON "enquiry_types" USING btree ("updated_at");
  CREATE INDEX "enquiry_types_created_at_idx" ON "enquiry_types" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_business_hours_order_idx" ON "site_settings_business_hours" USING btree ("_order");
  CREATE INDEX "site_settings_business_hours_parent_id_idx" ON "site_settings_business_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_business_hours_order_idx" ON "_site_settings_v_version_business_hours" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_business_hours_parent_id_idx" ON "_site_settings_v_version_business_hours" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "home_hero_facts_order_idx" ON "home_hero_facts" USING btree ("_order");
  CREATE INDEX "home_hero_facts_parent_id_idx" ON "home_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "home_core_capabilities_order_idx" ON "home_core_capabilities" USING btree ("_order");
  CREATE INDEX "home_core_capabilities_parent_id_idx" ON "home_core_capabilities" USING btree ("_parent_id");
  CREATE INDEX "home_core_capabilities_service_idx" ON "home_core_capabilities" USING btree ("service_id");
  CREATE INDEX "home_why_deep_tsight_paragraphs_order_idx" ON "home_why_deep_tsight_paragraphs" USING btree ("_order");
  CREATE INDEX "home_why_deep_tsight_paragraphs_parent_id_idx" ON "home_why_deep_tsight_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "home_why_deep_tsight_pillars_order_idx" ON "home_why_deep_tsight_pillars" USING btree ("_order");
  CREATE INDEX "home_why_deep_tsight_pillars_parent_id_idx" ON "home_why_deep_tsight_pillars" USING btree ("_parent_id");
  CREATE INDEX "home_problems_addressed_items_order_idx" ON "home_problems_addressed_items" USING btree ("_order");
  CREATE INDEX "home_problems_addressed_items_parent_id_idx" ON "home_problems_addressed_items" USING btree ("_parent_id");
  CREATE INDEX "home_delivery_approach_steps_order_idx" ON "home_delivery_approach_steps" USING btree ("_order");
  CREATE INDEX "home_delivery_approach_steps_parent_id_idx" ON "home_delivery_approach_steps" USING btree ("_parent_id");
  CREATE INDEX "home_perth_context_sectors_order_idx" ON "home_perth_context_sectors" USING btree ("_order");
  CREATE INDEX "home_perth_context_sectors_parent_id_idx" ON "home_perth_context_sectors" USING btree ("_parent_id");
  CREATE INDEX "home_media_media_problems_idx" ON "home" USING btree ("media_problems_id");
  CREATE INDEX "home_media_media_why_idx" ON "home" USING btree ("media_why_id");
  CREATE INDEX "home_media_media_close_idx" ON "home" USING btree ("media_close_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_credentials_id_idx" ON "home_rels" USING btree ("credentials_id");
  CREATE INDEX "home_rels_proof_items_id_idx" ON "home_rels" USING btree ("proof_items_id");
  CREATE INDEX "_home_v_version_hero_facts_order_idx" ON "_home_v_version_hero_facts" USING btree ("_order");
  CREATE INDEX "_home_v_version_hero_facts_parent_id_idx" ON "_home_v_version_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_core_capabilities_order_idx" ON "_home_v_version_core_capabilities" USING btree ("_order");
  CREATE INDEX "_home_v_version_core_capabilities_parent_id_idx" ON "_home_v_version_core_capabilities" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_core_capabilities_service_idx" ON "_home_v_version_core_capabilities" USING btree ("service_id");
  CREATE INDEX "_home_v_version_why_deep_tsight_paragraphs_order_idx" ON "_home_v_version_why_deep_tsight_paragraphs" USING btree ("_order");
  CREATE INDEX "_home_v_version_why_deep_tsight_paragraphs_parent_id_idx" ON "_home_v_version_why_deep_tsight_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_why_deep_tsight_pillars_order_idx" ON "_home_v_version_why_deep_tsight_pillars" USING btree ("_order");
  CREATE INDEX "_home_v_version_why_deep_tsight_pillars_parent_id_idx" ON "_home_v_version_why_deep_tsight_pillars" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_problems_addressed_items_order_idx" ON "_home_v_version_problems_addressed_items" USING btree ("_order");
  CREATE INDEX "_home_v_version_problems_addressed_items_parent_id_idx" ON "_home_v_version_problems_addressed_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_delivery_approach_steps_order_idx" ON "_home_v_version_delivery_approach_steps" USING btree ("_order");
  CREATE INDEX "_home_v_version_delivery_approach_steps_parent_id_idx" ON "_home_v_version_delivery_approach_steps" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_perth_context_sectors_order_idx" ON "_home_v_version_perth_context_sectors" USING btree ("_order");
  CREATE INDEX "_home_v_version_perth_context_sectors_parent_id_idx" ON "_home_v_version_perth_context_sectors" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_media_version_media_problems_idx" ON "_home_v" USING btree ("version_media_problems_id");
  CREATE INDEX "_home_v_version_media_version_media_why_idx" ON "_home_v" USING btree ("version_media_why_id");
  CREATE INDEX "_home_v_version_media_version_media_close_idx" ON "_home_v" USING btree ("version_media_close_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_credentials_id_idx" ON "_home_v_rels" USING btree ("credentials_id");
  CREATE INDEX "_home_v_rels_proof_items_id_idx" ON "_home_v_rels" USING btree ("proof_items_id");
  CREATE INDEX "about_narrative_paragraphs_order_idx" ON "about_narrative_paragraphs" USING btree ("_order");
  CREATE INDEX "about_narrative_paragraphs_parent_id_idx" ON "about_narrative_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "about_principles_order_idx" ON "about_principles" USING btree ("_order");
  CREATE INDEX "about_principles_parent_id_idx" ON "about_principles" USING btree ("_parent_id");
  CREATE INDEX "about_timeline_order_idx" ON "about_timeline" USING btree ("_order");
  CREATE INDEX "about_timeline_parent_id_idx" ON "about_timeline" USING btree ("_parent_id");
  CREATE INDEX "about_media_media_portrait_idx" ON "about" USING btree ("media_portrait_id");
  CREATE INDEX "about_media_media_site_idx" ON "about" USING btree ("media_site_id");
  CREATE INDEX "about_media_media_desk_idx" ON "about" USING btree ("media_desk_id");
  CREATE INDEX "about__status_idx" ON "about" USING btree ("_status");
  CREATE INDEX "_about_v_version_narrative_paragraphs_order_idx" ON "_about_v_version_narrative_paragraphs" USING btree ("_order");
  CREATE INDEX "_about_v_version_narrative_paragraphs_parent_id_idx" ON "_about_v_version_narrative_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_principles_order_idx" ON "_about_v_version_principles" USING btree ("_order");
  CREATE INDEX "_about_v_version_principles_parent_id_idx" ON "_about_v_version_principles" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_timeline_order_idx" ON "_about_v_version_timeline" USING btree ("_order");
  CREATE INDEX "_about_v_version_timeline_parent_id_idx" ON "_about_v_version_timeline" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_media_version_media_portrait_idx" ON "_about_v" USING btree ("version_media_portrait_id");
  CREATE INDEX "_about_v_version_media_version_media_site_idx" ON "_about_v" USING btree ("version_media_site_id");
  CREATE INDEX "_about_v_version_media_version_media_desk_idx" ON "_about_v" USING btree ("version_media_desk_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_latest_idx" ON "_about_v" USING btree ("latest");
  CREATE INDEX "pages_thank_you_next_steps_order_idx" ON "pages_thank_you_next_steps" USING btree ("_order");
  CREATE INDEX "pages_thank_you_next_steps_parent_id_idx" ON "pages_thank_you_next_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_services_services_figure_idx" ON "pages" USING btree ("services_figure_id");
  CREATE INDEX "pages_credentials_credentials_figure_idx" ON "pages" USING btree ("credentials_figure_id");
  CREATE INDEX "pages_contact_contact_figure_idx" ON "pages" USING btree ("contact_figure_id");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_thank_you_next_steps_order_idx" ON "_pages_v_version_thank_you_next_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_version_thank_you_next_steps_parent_id_idx" ON "_pages_v_version_thank_you_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_services_version_services_figure_idx" ON "_pages_v" USING btree ("version_services_figure_id");
  CREATE INDEX "_pages_v_version_credentials_version_credentials_figure_idx" ON "_pages_v" USING btree ("version_credentials_figure_id");
  CREATE INDEX "_pages_v_version_contact_version_contact_figure_idx" ON "_pages_v" USING btree ("version_contact_figure_id");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "seo_home_home_og_image_idx" ON "seo" USING btree ("home_og_image_id");
  CREATE INDEX "seo_about_about_og_image_idx" ON "seo" USING btree ("about_og_image_id");
  CREATE INDEX "seo_services_services_og_image_idx" ON "seo" USING btree ("services_og_image_id");
  CREATE INDEX "seo_credentials_credentials_og_image_idx" ON "seo" USING btree ("credentials_og_image_id");
  CREATE INDEX "seo_insights_insights_og_image_idx" ON "seo" USING btree ("insights_og_image_id");
  CREATE INDEX "seo_contact_contact_og_image_idx" ON "seo" USING btree ("contact_og_image_id");
  CREATE INDEX "seo_thank_you_thank_you_og_image_idx" ON "seo" USING btree ("thank_you_og_image_id");
  CREATE INDEX "seo_privacy_privacy_og_image_idx" ON "seo" USING btree ("privacy_og_image_id");
  CREATE INDEX "seo_terms_terms_og_image_idx" ON "seo" USING btree ("terms_og_image_id");
  CREATE INDEX "seo_accessibility_accessibility_og_image_idx" ON "seo" USING btree ("accessibility_og_image_id");
  CREATE INDEX "seo__status_idx" ON "seo" USING btree ("_status");
  CREATE INDEX "_seo_v_version_home_version_home_og_image_idx" ON "_seo_v" USING btree ("version_home_og_image_id");
  CREATE INDEX "_seo_v_version_about_version_about_og_image_idx" ON "_seo_v" USING btree ("version_about_og_image_id");
  CREATE INDEX "_seo_v_version_services_version_services_og_image_idx" ON "_seo_v" USING btree ("version_services_og_image_id");
  CREATE INDEX "_seo_v_version_credentials_version_credentials_og_image_idx" ON "_seo_v" USING btree ("version_credentials_og_image_id");
  CREATE INDEX "_seo_v_version_insights_version_insights_og_image_idx" ON "_seo_v" USING btree ("version_insights_og_image_id");
  CREATE INDEX "_seo_v_version_contact_version_contact_og_image_idx" ON "_seo_v" USING btree ("version_contact_og_image_id");
  CREATE INDEX "_seo_v_version_thank_you_version_thank_you_og_image_idx" ON "_seo_v" USING btree ("version_thank_you_og_image_id");
  CREATE INDEX "_seo_v_version_privacy_version_privacy_og_image_idx" ON "_seo_v" USING btree ("version_privacy_og_image_id");
  CREATE INDEX "_seo_v_version_terms_version_terms_og_image_idx" ON "_seo_v" USING btree ("version_terms_og_image_id");
  CREATE INDEX "_seo_v_version_accessibility_version_accessibility_og_im_idx" ON "_seo_v" USING btree ("version_accessibility_og_image_id");
  CREATE INDEX "_seo_v_version_version__status_idx" ON "_seo_v" USING btree ("version__status");
  CREATE INDEX "_seo_v_created_at_idx" ON "_seo_v" USING btree ("created_at");
  CREATE INDEX "_seo_v_updated_at_idx" ON "_seo_v" USING btree ("updated_at");
  CREATE INDEX "_seo_v_latest_idx" ON "_seo_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proof_items_fk" FOREIGN KEY ("proof_items_id") REFERENCES "public"."proof_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_credentials_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."credentials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_credential_groups_fk" FOREIGN KEY ("credential_groups_id") REFERENCES "public"."credential_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_types_fk" FOREIGN KEY ("enquiry_types_id") REFERENCES "public"."enquiry_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_proof_items_id_idx" ON "payload_locked_documents_rels" USING btree ("proof_items_id");
  CREATE INDEX "payload_locked_documents_rels_credentials_id_idx" ON "payload_locked_documents_rels" USING btree ("credentials_id");
  CREATE INDEX "payload_locked_documents_rels_credential_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("credential_groups_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_article_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("article_categories_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_enquiry_types_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_types_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_scope_and_outputs_outputs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_scope_and_outputs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_delivery_approach" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_standards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_scope_and_outputs_outputs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_scope_and_outputs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_delivery_approach" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_standards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "proof_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_proof_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "credentials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_credentials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "credential_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_credential_groups_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_article_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiry_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_business_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_business_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_core_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_why_deep_tsight_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_why_deep_tsight_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_problems_addressed_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_delivery_approach_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_perth_context_sectors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_core_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_why_deep_tsight_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_why_deep_tsight_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_problems_addressed_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_delivery_approach_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_perth_context_sectors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_narrative_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_principles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_narrative_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_principles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_thank_you_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_thank_you_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "seo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_seo_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_scope_and_outputs_outputs" CASCADE;
  DROP TABLE "services_scope_and_outputs" CASCADE;
  DROP TABLE "services_delivery_approach" CASCADE;
  DROP TABLE "services_standards" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_scope_and_outputs_outputs" CASCADE;
  DROP TABLE "_services_v_version_scope_and_outputs" CASCADE;
  DROP TABLE "_services_v_version_delivery_approach" CASCADE;
  DROP TABLE "_services_v_version_standards" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "proof_items" CASCADE;
  DROP TABLE "_proof_items_v" CASCADE;
  DROP TABLE "credentials" CASCADE;
  DROP TABLE "_credentials_v" CASCADE;
  DROP TABLE "credential_groups" CASCADE;
  DROP TABLE "_credential_groups_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "article_categories" CASCADE;
  DROP TABLE "_article_categories_v" CASCADE;
  DROP TABLE "legal_pages_sections" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "_legal_pages_v_version_sections" CASCADE;
  DROP TABLE "_legal_pages_v" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "enquiry_types" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_business_hours" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v_version_business_hours" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "home_hero_facts" CASCADE;
  DROP TABLE "home_core_capabilities" CASCADE;
  DROP TABLE "home_why_deep_tsight_paragraphs" CASCADE;
  DROP TABLE "home_why_deep_tsight_pillars" CASCADE;
  DROP TABLE "home_problems_addressed_items" CASCADE;
  DROP TABLE "home_delivery_approach_steps" CASCADE;
  DROP TABLE "home_perth_context_sectors" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "_home_v_version_hero_facts" CASCADE;
  DROP TABLE "_home_v_version_core_capabilities" CASCADE;
  DROP TABLE "_home_v_version_why_deep_tsight_paragraphs" CASCADE;
  DROP TABLE "_home_v_version_why_deep_tsight_pillars" CASCADE;
  DROP TABLE "_home_v_version_problems_addressed_items" CASCADE;
  DROP TABLE "_home_v_version_delivery_approach_steps" CASCADE;
  DROP TABLE "_home_v_version_perth_context_sectors" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  DROP TABLE "about_narrative_paragraphs" CASCADE;
  DROP TABLE "about_principles" CASCADE;
  DROP TABLE "about_timeline" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "_about_v_version_narrative_paragraphs" CASCADE;
  DROP TABLE "_about_v_version_principles" CASCADE;
  DROP TABLE "_about_v_version_timeline" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "pages_thank_you_next_steps" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_version_thank_you_next_steps" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "seo" CASCADE;
  DROP TABLE "_seo_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_proof_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_credentials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_credential_groups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_article_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_legal_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiry_types_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_proof_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_credentials_id_idx";
  DROP INDEX "payload_locked_documents_rels_credential_groups_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_article_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_legal_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiry_types_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "proof_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "credentials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "credential_groups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "article_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "legal_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiry_types_id";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_icon";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_proof_items_status";
  DROP TYPE "public"."enum__proof_items_v_version_status";
  DROP TYPE "public"."enum_credentials_category";
  DROP TYPE "public"."enum_credentials_status";
  DROP TYPE "public"."enum__credentials_v_version_category";
  DROP TYPE "public"."enum__credentials_v_version_status";
  DROP TYPE "public"."enum_credential_groups_category";
  DROP TYPE "public"."enum_credential_groups_status";
  DROP TYPE "public"."enum__credential_groups_v_version_category";
  DROP TYPE "public"."enum__credential_groups_v_version_status";
  DROP TYPE "public"."enum_media_kind";
  DROP TYPE "public"."enum_media_asset_class";
  DROP TYPE "public"."enum_media_status";
  DROP TYPE "public"."enum__media_v_version_kind";
  DROP TYPE "public"."enum__media_v_version_asset_class";
  DROP TYPE "public"."enum__media_v_version_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_article_categories_status";
  DROP TYPE "public"."enum__article_categories_v_version_status";
  DROP TYPE "public"."enum_legal_pages_slug";
  DROP TYPE "public"."enum_legal_pages_adviser_status";
  DROP TYPE "public"."enum_legal_pages_status";
  DROP TYPE "public"."enum__legal_pages_v_version_slug";
  DROP TYPE "public"."enum__legal_pages_v_version_adviser_status";
  DROP TYPE "public"."enum__legal_pages_v_version_status";
  DROP TYPE "public"."enum_enquiries_email_status";
  DROP TYPE "public"."enum_site_settings_social_links_platform";
  DROP TYPE "public"."enum_site_settings_business_hours_day";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_social_links_platform";
  DROP TYPE "public"."enum__site_settings_v_version_business_hours_day";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum_about_status";
  DROP TYPE "public"."enum__about_v_version_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_seo_status";
  DROP TYPE "public"."enum__seo_v_version_status";`);
}
