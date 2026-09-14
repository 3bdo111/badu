import { getDb } from "@/lib/db/db";
import type {
  SiteSettings,
  NavigationItem,
  FooterGroup,
  FooterLink,
  SocialLink,
} from "@/lib/types/cms";

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "BADU",
  defaultTitle: { en: "BADU — Desert Streetwear", ar: "بادو — ملابس الشارع الصحراوية" },
  defaultDescription: {
    en: "Luxury streetwear inspired by the desert landscape.",
    ar: "ملابس الشارع الفاخرة المستوحاة من سحر الصحراء.",
  },
  defaultLanguage: "en",
  supportedLanguages: ["en", "ar"],
  currency: "USD",
  copyrightText: {
    en: "© 2026 BADU. All rights reserved.",
    ar: "© 2026 بادو. جميع الحقوق محفوظة.",
  },
  announcementBanner: {
    enabled: true,
    text: {
      en: "LIMITED DROP — FREE EXPRESS SHIPPING ON ALL ORDERS",
      ar: "إصدار محدود — شحن سريع مجاني لجميع الطلبات",
    },
  },
};

const DEFAULT_NAVIGATION: NavigationItem[] = [
  {
    id: "nav-home",
    label: { en: "Home", ar: "الرئيسية" },
    url: "/",
    sortOrder: 0,
    visible: true,
    isExternal: false,
    targetBlank: false,
  },
  {
    id: "nav-store",
    label: { en: "Store", ar: "المتجر" },
    url: "/store",
    sortOrder: 1,
    visible: true,
    isExternal: false,
    targetBlank: false,
  },
  {
    id: "nav-story",
    label: { en: "Story", ar: "القصة" },
    url: "/#story",
    sortOrder: 2,
    visible: true,
    isExternal: false,
    targetBlank: false,
  },
  {
    id: "nav-faq",
    label: { en: "FAQ", ar: "الأسئلة الشائعة" },
    url: "/#faq",
    sortOrder: 3,
    visible: true,
    isExternal: false,
    targetBlank: false,
  },
];

const DEFAULT_FOOTER_GROUPS: FooterGroup[] = [
  {
    id: "group-explore",
    title: { en: "EXPLORE", ar: "استكشف" },
    sortOrder: 0,
    visible: true,
    links: [
      { id: "link-store", groupId: "group-explore", label: { en: "Store", ar: "المتجر" }, url: "/store", sortOrder: 0, visible: true },
      { id: "link-story", groupId: "group-explore", label: { en: "Our Story", ar: "قصتنا" }, url: "/#story", sortOrder: 1, visible: true },
      { id: "link-artwork", groupId: "group-explore", label: { en: "Artwork Symbolism", ar: "رمزية العمل الفني" }, url: "/#artwork", sortOrder: 2, visible: true },
    ],
  },
  {
    id: "group-customer",
    title: { en: "CUSTOMER CARE", ar: "خدمة العملاء" },
    sortOrder: 1,
    visible: true,
    links: [
      { id: "link-sizeguide", groupId: "group-customer", label: { en: "Size Guide", ar: "دليل المقاسات" }, url: "/#size-guide", sortOrder: 0, visible: true },
      { id: "link-faq", groupId: "group-customer", label: { en: "FAQ & Support", ar: "الأسئلة الشائعة والدعم" }, url: "/#faq", sortOrder: 1, visible: true },
      { id: "link-shipping", groupId: "group-customer", label: { en: "Shipping & COD", ar: "الشحن والدفع عند الاستلام" }, url: "/#faq", sortOrder: 2, visible: true },
    ],
  },
];

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "soc-instagram",
    platform: "instagram",
    label: "Instagram",
    url: "https://instagram.com",
    icon: "instagram",
    sortOrder: 0,
    visible: true,
  },
  {
    id: "soc-tiktok",
    platform: "tiktok",
    label: "TikTok",
    url: "https://tiktok.com",
    icon: "tiktok",
    sortOrder: 1,
    visible: true,
  },
];

interface DbSettingRow {
  key: string;
  value_json: string;
  updated_at: string;
}

interface DbNavItemRow {
  id: string;
  label_en: string;
  label_ar: string;
  url: string;
  sort_order: number;
  visible: number;
  is_external: number;
  target_blank: number;
}

interface DbFooterGroupRow {
  id: string;
  title_en: string;
  title_ar: string;
  sort_order: number;
  visible: number;
}

interface DbFooterLinkRow {
  id: string;
  group_id: string;
  label_en: string;
  label_ar: string;
  url: string;
  sort_order: number;
  visible: number;
}

interface DbSocialLinkRow {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  visible: number;
}

export const serverSettingsRepository = {
  // --- SITE SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    const db = await getDb();
    const row = await db.get<DbSettingRow>("SELECT * FROM site_settings WHERE key = ?", ["global"]);
    if (!row) {
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(row.value_json);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    const now = new Date().toISOString();

    const db = await getDb();
    await db.run(
      `INSERT INTO site_settings (key, value_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
      ["global", JSON.stringify(merged), now]
    );

    return merged;
  },

  // --- NAVIGATION ITEMS ---
  async getNavigationItems(includeHidden = false): Promise<NavigationItem[]> {
    const db = await getDb();
    const rows = await db.all<DbNavItemRow>("SELECT * FROM navigation_items ORDER BY sort_order ASC");
    if (!rows || rows.length === 0) {
      return DEFAULT_NAVIGATION.filter((item) => includeHidden || item.visible);
    }
    return rows
      .map((row) => ({
        id: row.id,
        label: { en: row.label_en, ar: row.label_ar },
        url: row.url,
        sortOrder: row.sort_order,
        visible: Boolean(row.visible),
        isExternal: Boolean(row.is_external),
        targetBlank: Boolean(row.target_blank),
      }))
      .filter((item) => includeHidden || item.visible);
  },

  async saveNavigationItems(items: NavigationItem[]): Promise<NavigationItem[]> {
    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.run("DELETE FROM navigation_items");
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        await tx.run(
          `INSERT INTO navigation_items (id, label_en, label_ar, url, sort_order, visible, is_external, target_blank)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id || `nav-${Date.now()}-${idx}`,
            item.label.en,
            item.label.ar,
            item.url,
            item.sortOrder ?? idx,
            item.visible ? 1 : 0,
            item.isExternal ? 1 : 0,
            item.targetBlank ? 1 : 0,
          ]
        );
      }
    });
    return this.getNavigationItems(true);
  },

  // --- FOOTER GROUPS & LINKS ---
  async getFooterGroups(includeHidden = false): Promise<FooterGroup[]> {
    const db = await getDb();
    const groupRows = await db.all<DbFooterGroupRow>("SELECT * FROM footer_groups ORDER BY sort_order ASC");
    const linkRows = await db.all<DbFooterLinkRow>("SELECT * FROM footer_links ORDER BY sort_order ASC");

    if (!groupRows || groupRows.length === 0) {
      return DEFAULT_FOOTER_GROUPS.filter((g) => includeHidden || g.visible);
    }

    return groupRows
      .map((gRow) => {
        const links: FooterLink[] = linkRows
          .filter((lRow) => lRow.group_id === gRow.id && (includeHidden || Boolean(lRow.visible)))
          .map((lRow) => ({
            id: lRow.id,
            groupId: lRow.group_id,
            label: { en: lRow.label_en, ar: lRow.label_ar },
            url: lRow.url,
            sortOrder: lRow.sort_order,
            visible: Boolean(lRow.visible),
          }));

        return {
          id: gRow.id,
          title: { en: gRow.title_en, ar: gRow.title_ar },
          sortOrder: gRow.sort_order,
          visible: Boolean(gRow.visible),
          links,
        };
      })
      .filter((g) => includeHidden || g.visible);
  },

  async saveFooterGroups(groups: FooterGroup[]): Promise<FooterGroup[]> {
    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.run("DELETE FROM footer_links");
      await tx.run("DELETE FROM footer_groups");

      for (let gIdx = 0; gIdx < groups.length; gIdx++) {
        const group = groups[gIdx];
        const groupId = group.id || `group-${Date.now()}-${gIdx}`;
        await tx.run(
          `INSERT INTO footer_groups (id, title_en, title_ar, sort_order, visible)
           VALUES (?, ?, ?, ?, ?)`,
          [groupId, group.title.en, group.title.ar, group.sortOrder ?? gIdx, group.visible ? 1 : 0]
        );

        if (group.links) {
          for (let lIdx = 0; lIdx < group.links.length; lIdx++) {
            const link = group.links[lIdx];
            await tx.run(
              `INSERT INTO footer_links (id, group_id, label_en, label_ar, url, sort_order, visible)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                link.id || `link-${Date.now()}-${lIdx}`,
                groupId,
                link.label.en,
                link.label.ar,
                link.url,
                link.sortOrder ?? lIdx,
                link.visible ? 1 : 0,
              ]
            );
          }
        }
      }
    });
    return this.getFooterGroups(true);
  },

  // --- SOCIAL LINKS ---
  async getSocialLinks(includeHidden = false): Promise<SocialLink[]> {
    const db = await getDb();
    const rows = await db.all<DbSocialLinkRow>("SELECT * FROM social_links ORDER BY sort_order ASC");
    if (!rows || rows.length === 0) {
      return DEFAULT_SOCIAL_LINKS.filter((s) => includeHidden || s.visible);
    }
    return rows
      .map((row) => ({
        id: row.id,
        platform: row.platform,
        label: row.label,
        url: row.url,
        icon: row.icon,
        sortOrder: row.sort_order,
        visible: Boolean(row.visible),
      }))
      .filter((s) => includeHidden || s.visible);
  },

  async saveSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.run("DELETE FROM social_links");
      for (let idx = 0; idx < links.length; idx++) {
        const link = links[idx];
        await tx.run(
          `INSERT INTO social_links (id, platform, label, url, icon, sort_order, visible)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            link.id || `soc-${Date.now()}-${idx}`,
            link.platform,
            link.label,
            link.url,
            link.icon || link.platform,
            link.sortOrder ?? idx,
            link.visible ? 1 : 0,
          ]
        );
      }
    });
    return this.getSocialLinks(true);
  },
};
