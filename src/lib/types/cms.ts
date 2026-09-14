import type { LocalizedString } from "./product";

export interface SiteSettings {
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultTitle: LocalizedString;
  defaultDescription: LocalizedString;
  defaultOgImage?: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  currency: string;
  copyrightText: LocalizedString;
  announcementBanner?: {
    enabled: boolean;
    text: LocalizedString;
    linkUrl?: string;
  };
}

export interface NavigationItem {
  id: string;
  label: LocalizedString;
  url: string;
  sortOrder: number;
  visible: boolean;
  isExternal: boolean;
  targetBlank: boolean;
}

export interface FooterLink {
  id: string;
  groupId: string;
  label: LocalizedString;
  url: string;
  sortOrder: number;
  visible: boolean;
}

export interface FooterGroup {
  id: string;
  title: LocalizedString;
  sortOrder: number;
  visible: boolean;
  links: FooterLink[];
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  sortOrder: number;
  visible: boolean;
}
