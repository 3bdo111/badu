import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";

export type EditorLocale = "en" | "ar";
export type Viewport = "desktop" | "tablet" | "mobile";

export interface Banner {
  text: string;
  type: "success" | "error";
}

export type SectionField = keyof StorefrontSectionRecord;

/** A section edited locally but not yet saved back to the server. */
export function isSectionDirty(sec: StorefrontSectionRecord): boolean {
  return Boolean(sec.hasUnsavedChanges) || sec.status === "DRAFT";
}

export function dirtyCount(sections: StorefrontSectionRecord[]): number {
  return sections.filter(isSectionDirty).length;
}
