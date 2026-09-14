"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/types/cms";
import styles from "./cms-editor.module.css";

export function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await res.json();
      setSettings(data.settings);
      setMessage({ text: "Global Site Settings saved successfully!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save settings";
      setMessage({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading site settings...</div>;
  }

  if (!settings) {
    return <div className={styles.errorContainer}>Failed to load site settings.</div>;
  }

  const currentBannerText = settings.announcementBanner?.text || { en: "", ar: "" };

  return (
    <form onSubmit={handleSave} className={styles.formContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Global Site Settings</h1>
          <p className={styles.pageSubtitle}>Manage site identity, metadata defaults, currency, and announcement banner</p>
        </div>
        <button type="submit" disabled={saving} className={styles.primaryButton}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div className={message.error ? styles.errorBanner : styles.successBanner}>
          {message.text}
        </div>
      )}

      {/* Brand Identity */}
      <section className={styles.sectionCard}>
        <h2 className={styles.sectionHeading}>Brand Identity</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Currency Code</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
              className={styles.input}
              placeholder="USD, SAR, AED..."
              required
            />
          </div>
        </div>
      </section>

      {/* SEO Defaults */}
      <section className={styles.sectionCard}>
        <h2 className={styles.sectionHeading}>Default Metadata & SEO</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Default Site Title (English)</label>
            <input
              type="text"
              value={settings.defaultTitle?.en || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTitle: { ...settings.defaultTitle, en: e.target.value },
                })
              }
              className={styles.input}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Default Site Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={settings.defaultTitle?.ar || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTitle: { ...settings.defaultTitle, ar: e.target.value },
                })
              }
              className={styles.input}
              required
            />
          </div>

          <div className={styles.fieldGroupFull}>
            <label className={styles.label}>Default Meta Description (English)</label>
            <textarea
              rows={3}
              value={settings.defaultDescription?.en || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultDescription: { ...settings.defaultDescription, en: e.target.value },
                })
              }
              className={styles.textarea}
              required
            />
          </div>

          <div className={styles.fieldGroupFull}>
            <label className={styles.label}>Default Meta Description (Arabic)</label>
            <textarea
              rows={3}
              dir="rtl"
              value={settings.defaultDescription?.ar || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultDescription: { ...settings.defaultDescription, ar: e.target.value },
                })
              }
              className={styles.textarea}
              required
            />
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <section className={styles.sectionCard}>
        <h2 className={styles.sectionHeading}>Announcement Banner</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroupFull}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.announcementBanner?.enabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: {
                      enabled: e.target.checked,
                      text: currentBannerText,
                    },
                  })
                }
              />
              Enable Top Announcement Banner
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Banner Text (English)</label>
            <input
              type="text"
              value={currentBannerText.en}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcementBanner: {
                    enabled: settings.announcementBanner?.enabled ?? true,
                    text: { ...currentBannerText, en: e.target.value },
                  },
                })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Banner Text (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={currentBannerText.ar}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcementBanner: {
                    enabled: settings.announcementBanner?.enabled ?? true,
                    text: { ...currentBannerText, ar: e.target.value },
                  },
                })
              }
              className={styles.input}
            />
          </div>
        </div>
      </section>

      {/* Footer Copyright */}
      <section className={styles.sectionCard}>
        <h2 className={styles.sectionHeading}>Copyright & Footer</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Copyright Notice (English)</label>
            <input
              type="text"
              value={settings.copyrightText?.en || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  copyrightText: { ...settings.copyrightText, en: e.target.value },
                })
              }
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Copyright Notice (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={settings.copyrightText?.ar || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  copyrightText: { ...settings.copyrightText, ar: e.target.value },
                })
              }
              className={styles.input}
            />
          </div>
        </div>
      </section>

      <div className={styles.bottomBar}>
        <button type="submit" disabled={saving} className={styles.primaryButton}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
