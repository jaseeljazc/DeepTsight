import { z } from "zod";
import {
  seoEntrySchema,
  navItemSchema,
  ctaLabelsSchema,
  siteSchema,
  siteSourceSchema,
  navLabelsSchema,
  uiLabelsSchema,
  socialLinkSchema,
  enquiryTypeSchema,
  richTextSchema,
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
  homeSourceSchema,
  finalCtaSchema,
  aboutContentSchema,
  legalPageSchema,
  pagesContentSchema,
  enquiryOptionsSchema,
} from "./schema";

export type SeoEntry = z.infer<typeof seoEntrySchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type CtaLabels = z.infer<typeof ctaLabelsSchema>;
export type Site = z.infer<typeof siteSchema>;
export type SiteSource = z.infer<typeof siteSourceSchema>;
export type NavLabels = z.infer<typeof navLabelsSchema>;
export type UiLabels = z.infer<typeof uiLabelsSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type EnquiryType = z.infer<typeof enquiryTypeSchema>;
export type RichText = z.infer<typeof richTextSchema>;
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
export type HomeSource = z.infer<typeof homeSourceSchema>;
export type FinalCtaData = z.infer<typeof finalCtaSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type LegalPage = z.infer<typeof legalPageSchema>;
export type LegalSlug = LegalPage["slug"];
export type PagesContent = z.infer<typeof pagesContentSchema>;
export type EnquiryOptions = z.infer<typeof enquiryOptionsSchema>;
