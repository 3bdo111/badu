import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";

export interface SectionFormData {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  bodyEn: string;
  bodyAr: string;
  ctaLabelEn: string;
  ctaLabelAr: string;
  ctaUrl: string;
  featuredProductId: string;
  imageUrl: string;
  visible: boolean;
}

/** Sections with unpublished changes (draft status or unsaved edits). */
export function isDirty(sec: StorefrontSectionRecord): boolean {
  return Boolean(sec.hasUnsavedChanges) || sec.status === "DRAFT";
}
