import { getDb } from "@/lib/db/db";

export type SectionStatus = "DRAFT" | "PUBLISHED";

export interface StorefrontSectionRecord {
  id: string;
  sectionKey: string;
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
  status: SectionStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  hasUnsavedChanges?: boolean;
}

interface DbStorefrontSectionRow {
  id: string;
  section_key: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string | null;
  subtitle_ar: string | null;
  body_en: string | null;
  body_ar: string | null;
  cta_label_en: string | null;
  cta_label_ar: string | null;
  cta_url: string | null;
  featured_product_id: string | null;
  image_url: string | null;
  visible: number;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  draft_title_en?: string | null;
  draft_title_ar?: string | null;
  draft_subtitle_en?: string | null;
  draft_subtitle_ar?: string | null;
  draft_body_en?: string | null;
  draft_body_ar?: string | null;
  draft_cta_label_en?: string | null;
  draft_cta_label_ar?: string | null;
  draft_cta_url?: string | null;
  draft_featured_product_id?: string | null;
  draft_image_url?: string | null;
  draft_visible?: number | null;
  draft_sort_order?: number | null;
}

function mapSectionRow(row: DbStorefrontSectionRow, useDraft = false): StorefrontSectionRecord {
  const dTitleEn = row.draft_title_en ?? row.title_en;
  const dTitleAr = row.draft_title_ar ?? row.title_ar;
  const dSubEn = row.draft_subtitle_en ?? row.subtitle_en ?? "";
  const dSubAr = row.draft_subtitle_ar ?? row.subtitle_ar ?? "";
  const dBodyEn = row.draft_body_en ?? row.body_en ?? "";
  const dBodyAr = row.draft_body_ar ?? row.body_ar ?? "";
  const dCtaEn = row.draft_cta_label_en ?? row.cta_label_en ?? "";
  const dCtaAr = row.draft_cta_label_ar ?? row.cta_label_ar ?? "";
  const dCtaUrl = row.draft_cta_url ?? row.cta_url ?? "";
  const dProdId = row.draft_featured_product_id ?? row.featured_product_id ?? "";
  const dImgUrl = row.draft_image_url ?? row.image_url ?? "";
  const dVisible = row.draft_visible !== null && row.draft_visible !== undefined ? Boolean(row.draft_visible) : Boolean(row.visible);
  const dSort = row.draft_sort_order !== null && row.draft_sort_order !== undefined ? row.draft_sort_order : row.sort_order;

  const hasUnsavedChanges = Boolean(
    (row.draft_title_en !== null && row.draft_title_en !== undefined && row.draft_title_en !== row.title_en) ||
    (row.draft_title_ar !== null && row.draft_title_ar !== undefined && row.draft_title_ar !== row.title_ar) ||
    (row.draft_subtitle_en !== null && row.draft_subtitle_en !== undefined && (row.draft_subtitle_en || "") !== (row.subtitle_en || "")) ||
    (row.draft_subtitle_ar !== null && row.draft_subtitle_ar !== undefined && (row.draft_subtitle_ar || "") !== (row.subtitle_ar || "")) ||
    (row.draft_body_en !== null && row.draft_body_en !== undefined && (row.draft_body_en || "") !== (row.body_en || "")) ||
    (row.draft_body_ar !== null && row.draft_body_ar !== undefined && (row.draft_body_ar || "") !== (row.body_ar || "")) ||
    (row.draft_cta_label_en !== null && row.draft_cta_label_en !== undefined && (row.draft_cta_label_en || "") !== (row.cta_label_en || "")) ||
    (row.draft_cta_label_ar !== null && row.draft_cta_label_ar !== undefined && (row.draft_cta_label_ar || "") !== (row.cta_label_ar || "")) ||
    (row.draft_cta_url !== null && row.draft_cta_url !== undefined && (row.draft_cta_url || "") !== (row.cta_url || "")) ||
    (row.draft_featured_product_id !== null && row.draft_featured_product_id !== undefined && (row.draft_featured_product_id || "") !== (row.featured_product_id || "")) ||
    (row.draft_image_url !== null && row.draft_image_url !== undefined && (row.draft_image_url || "") !== (row.image_url || "")) ||
    (row.draft_visible !== null && row.draft_visible !== undefined && row.draft_visible !== row.visible) ||
    (row.draft_sort_order !== null && row.draft_sort_order !== undefined && row.draft_sort_order !== row.sort_order)
  );

  if (useDraft) {
    return {
      id: row.id,
      sectionKey: row.section_key,
      titleEn: dTitleEn,
      titleAr: dTitleAr,
      subtitleEn: dSubEn,
      subtitleAr: dSubAr,
      bodyEn: dBodyEn,
      bodyAr: dBodyAr,
      ctaLabelEn: dCtaEn,
      ctaLabelAr: dCtaAr,
      ctaUrl: dCtaUrl,
      featuredProductId: dProdId,
      imageUrl: dImgUrl,
      visible: dVisible,
      status: hasUnsavedChanges ? "DRAFT" : "PUBLISHED",
      sortOrder: dSort,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at || "",
      hasUnsavedChanges,
    };
  }

  return {
    id: row.id,
    sectionKey: row.section_key,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    subtitleEn: row.subtitle_en || "",
    subtitleAr: row.subtitle_ar || "",
    bodyEn: row.body_en || "",
    bodyAr: row.body_ar || "",
    ctaLabelEn: row.cta_label_en || "",
    ctaLabelAr: row.cta_label_ar || "",
    ctaUrl: row.cta_url || "",
    featuredProductId: row.featured_product_id || "",
    imageUrl: row.image_url || "",
    visible: Boolean(row.visible),
    status: (row.status as SectionStatus) || "PUBLISHED",
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || "",
    hasUnsavedChanges,
  };
}

export const serverStorefrontRepository = {
  async getDraftSections(): Promise<StorefrontSectionRecord[]> {
    const db = await getDb();
    const rows = await db.all<DbStorefrontSectionRow>(
      "SELECT * FROM storefront_sections ORDER BY COALESCE(draft_sort_order, sort_order) ASC, created_at ASC"
    );

    return rows.map((r) => mapSectionRow(r, true));
  },

  async getAllSections(): Promise<StorefrontSectionRecord[]> {
    return this.getDraftSections();
  },

  async getPublicSections(): Promise<StorefrontSectionRecord[]> {
    const db = await getDb();
    const rows = await db.all<DbStorefrontSectionRow>(
      "SELECT * FROM storefront_sections WHERE visible = 1 AND status = 'PUBLISHED' ORDER BY sort_order ASC"
    );

    return rows.map((r) => mapSectionRow(r, false));
  },

  async getSectionByKey(sectionKey: string, useDraft = true): Promise<StorefrontSectionRecord | undefined> {
    const db = await getDb();
    const row = await db.get<DbStorefrontSectionRow>(
      "SELECT * FROM storefront_sections WHERE section_key = ?",
      [sectionKey]
    );

    if (!row) return undefined;
    return mapSectionRow(row, useDraft);
  },

  async updateSectionDraft(
    sectionKey: string,
    data: {
      titleEn?: string;
      titleAr?: string;
      subtitleEn?: string;
      subtitleAr?: string;
      bodyEn?: string;
      bodyAr?: string;
      ctaLabelEn?: string;
      ctaLabelAr?: string;
      ctaUrl?: string;
      featuredProductId?: string;
      imageUrl?: string;
      visible?: boolean;
    }
  ): Promise<StorefrontSectionRecord | undefined> {
    const existing = await this.getSectionByKey(sectionKey, true);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedTitleEn = data.titleEn !== undefined ? data.titleEn.trim() : existing.titleEn;
    const updatedTitleAr = data.titleAr !== undefined ? data.titleAr.trim() : existing.titleAr;
    const updatedSubtitleEn = data.subtitleEn !== undefined ? data.subtitleEn.trim() : existing.subtitleEn;
    const updatedSubtitleAr = data.subtitleAr !== undefined ? data.subtitleAr.trim() : existing.subtitleAr;
    const updatedBodyEn = data.bodyEn !== undefined ? data.bodyEn.trim() : existing.bodyEn;
    const updatedBodyAr = data.bodyAr !== undefined ? data.bodyAr.trim() : existing.bodyAr;
    const updatedCtaLabelEn = data.ctaLabelEn !== undefined ? data.ctaLabelEn.trim() : existing.ctaLabelEn;
    const updatedCtaLabelAr = data.ctaLabelAr !== undefined ? data.ctaLabelAr.trim() : existing.ctaLabelAr;
    const updatedCtaUrl = data.ctaUrl !== undefined ? data.ctaUrl.trim() : existing.ctaUrl;
    const updatedFeaturedProductId =
      data.featuredProductId !== undefined ? data.featuredProductId.trim() : existing.featuredProductId;
    const updatedImageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl;
    const updatedVisible = data.visible !== undefined ? (data.visible ? 1 : 0) : existing.visible ? 1 : 0;

    const db = await getDb();
    await db.run(
      `UPDATE storefront_sections
       SET
         draft_title_en = ?,
         draft_title_ar = ?,
         draft_subtitle_en = ?,
         draft_subtitle_ar = ?,
         draft_body_en = ?,
         draft_body_ar = ?,
         draft_cta_label_en = ?,
         draft_cta_label_ar = ?,
         draft_cta_url = ?,
         draft_featured_product_id = ?,
         draft_image_url = ?,
         draft_visible = ?,
         updated_at = ?
       WHERE section_key = ?`,
      [
        updatedTitleEn,
        updatedTitleAr,
        updatedSubtitleEn || null,
        updatedSubtitleAr || null,
        updatedBodyEn || null,
        updatedBodyAr || null,
        updatedCtaLabelEn || null,
        updatedCtaLabelAr || null,
        updatedCtaUrl || null,
        updatedFeaturedProductId || null,
        updatedImageUrl || null,
        updatedVisible,
        now,
        sectionKey,
      ]
    );

    return this.getSectionByKey(sectionKey, true);
  },

  async updateSection(
    sectionKey: string,
    data: {
      titleEn?: string;
      titleAr?: string;
      subtitleEn?: string;
      subtitleAr?: string;
      bodyEn?: string;
      bodyAr?: string;
      ctaLabelEn?: string;
      ctaLabelAr?: string;
      ctaUrl?: string;
      featuredProductId?: string;
      imageUrl?: string;
      visible?: boolean;
      status?: SectionStatus;
    }
  ): Promise<StorefrontSectionRecord | undefined> {
    const updatedDraft = await this.updateSectionDraft(sectionKey, data);
    if (data.status === "PUBLISHED") {
      return this.publishSection(sectionKey);
    }
    return updatedDraft;
  },

  async publishSection(sectionKey: string): Promise<StorefrontSectionRecord | undefined> {
    const existing = await this.getSectionByKey(sectionKey, true);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const db = await getDb();
    await db.run(
      `UPDATE storefront_sections
       SET
         title_en = COALESCE(draft_title_en, title_en),
         title_ar = COALESCE(draft_title_ar, title_ar),
         subtitle_en = draft_subtitle_en,
         subtitle_ar = draft_subtitle_ar,
         body_en = draft_body_en,
         body_ar = draft_body_ar,
         cta_label_en = draft_cta_label_en,
         cta_label_ar = draft_cta_label_ar,
         cta_url = draft_cta_url,
         featured_product_id = draft_featured_product_id,
         image_url = draft_image_url,
         visible = COALESCE(draft_visible, visible),
         sort_order = COALESCE(draft_sort_order, sort_order),
         status = 'PUBLISHED',
         published_at = ?,
         updated_at = ?
       WHERE section_key = ?`,
      [now, now, sectionKey]
    );

    return this.getSectionByKey(sectionKey, false);
  },

  async publishAllSections(): Promise<StorefrontSectionRecord[]> {
    const now = new Date().toISOString();
    const db = await getDb();
    await db.run(
      `UPDATE storefront_sections
       SET
         title_en = COALESCE(draft_title_en, title_en),
         title_ar = COALESCE(draft_title_ar, title_ar),
         subtitle_en = draft_subtitle_en,
         subtitle_ar = draft_subtitle_ar,
         body_en = draft_body_en,
         body_ar = draft_body_ar,
         cta_label_en = draft_cta_label_en,
         cta_label_ar = draft_cta_label_ar,
         cta_url = draft_cta_url,
         featured_product_id = draft_featured_product_id,
         image_url = draft_image_url,
         visible = COALESCE(draft_visible, visible),
         sort_order = COALESCE(draft_sort_order, sort_order),
         status = 'PUBLISHED',
         published_at = ?,
         updated_at = ?`,
      [now, now]
    );

    return this.getPublicSections();
  },

  async reorderSections(keysOrder: string[]): Promise<StorefrontSectionRecord[]> {
    const db = await getDb();
    await db.transaction(async (tx) => {
      for (let index = 0; index < keysOrder.length; index++) {
        await tx.run(
          `UPDATE storefront_sections SET draft_sort_order = ? WHERE section_key = ?`,
          [index + 1, keysOrder[index]]
        );
      }
    });

    return this.getDraftSections();
  },
};
