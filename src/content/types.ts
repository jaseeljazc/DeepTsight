import { z } from "zod";
import {
  seoEntrySchema,
  navItemSchema,
  ctaLabelsSchema,
  siteSchema,
  serviceSchema,
  credentialSchema,
  credentialGroupSchema,
  proofItemSchema,
  articleSummarySchema,
  articleSchema,
  mediaAssetSchema,
  imageSlotSchema,
  figureSchema,
  homeContentSchema,
  aboutContentSchema,
  legalPageSchema,
  pagesContentSchema,
  enquiryOptionsSchema,
} from "./schema";

export type SeoEntry = z.infer<typeof seoEntrySchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type CtaLabels = z.infer<typeof ctaLabelsSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type CredentialGroup = z.infer<typeof credentialGroupSchema>;
export type ProofItem = z.infer<typeof proofItemSchema>;
export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export type Article = z.infer<typeof articleSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type ImageSlot = z.infer<typeof imageSlotSchema>;
export type FigureData = z.infer<typeof figureSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type LegalPage = z.infer<typeof legalPageSchema>;
export type LegalSlug = LegalPage["slug"];
export type PagesContent = z.infer<typeof pagesContentSchema>;
export type EnquiryOptions = z.infer<typeof enquiryOptionsSchema>;
