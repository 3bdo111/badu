"use client";

import { useState, useEffect } from "react";
import type { FooterGroup, SocialLink } from "@/lib/types/cms";
import styles from "./cms-editor.module.css";

export function FooterEditor() {
  const [groups, setGroups] = useState<FooterGroup[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/footer");
        const data = await res.json();
        if (Array.isArray(data.groups)) setGroups(data.groups);
        if (Array.isArray(data.socialLinks)) setSocialLinks(data.socialLinks);
      } catch (err) {
        console.error("Failed to load footer configuration:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups, socialLinks }),
      });

      if (!res.ok) {
        throw new Error("Failed to save footer settings");
      }

      const data = await res.json();
      setGroups(data.groups);
      setSocialLinks(data.socialLinks);
      setMessage({ text: "Footer groups and social links saved successfully!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save footer settings";
      setMessage({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const addGroup = () => {
    const newGroup: FooterGroup = {
      id: `group-${Date.now()}`,
      title: { en: "NEW GROUP", ar: "مجموعة جديدة" },
      sortOrder: groups.length,
      visible: true,
      links: [],
    };
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (gIdx: number) => {
    setGroups(groups.filter((_, idx) => idx !== gIdx));
  };

  const addLinkToGroup = (gIdx: number) => {
    const copy = [...groups];
    const target = copy[gIdx];
    const newLink = {
      id: `link-${Date.now()}`,
      groupId: target.id,
      label: { en: "New Link", ar: "رابط جديد" },
      url: "/store",
      sortOrder: target.links.length,
      visible: true,
    };
    target.links.push(newLink);
    setGroups(copy);
  };

  const removeLinkFromGroup = (gIdx: number, lIdx: number) => {
    const copy = [...groups];
    copy[gIdx].links = copy[gIdx].links.filter((_, idx) => idx !== lIdx);
    setGroups(copy);
  };

  const addSocial = () => {
    const newSoc: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: "instagram",
      label: "Instagram",
      url: "https://instagram.com",
      icon: "instagram",
      sortOrder: socialLinks.length,
      visible: true,
    };
    setSocialLinks([...socialLinks, newSoc]);
  };

  const removeSocial = (idx: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading footer settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className={styles.formContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Footer & Social Links CMS</h1>
          <p className={styles.pageSubtitle}>Manage footer link columns, bilingual labels, and social platform links</p>
        </div>
        <button type="submit" disabled={saving} className={styles.primaryButton}>
          {saving ? "Saving..." : "Save Footer CMS"}
        </button>
      </div>

      {message && (
        <div className={message.error ? styles.errorBanner : styles.successBanner}>
          {message.text}
        </div>
      )}

      {/* Social Links Section */}
      <section className={styles.sectionCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className={styles.sectionHeading} style={{ borderBottom: "none", paddingBottom: 0 }}>
            Social Media Links
          </h2>
          <button type="button" onClick={addSocial} className={styles.secondaryButton}>
            + Add Social Platform
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {socialLinks.map((soc, sIdx) => (
            <div key={soc.id} className={styles.listRow}>
              <input
                type="text"
                placeholder="Platform (e.g. instagram, tiktok, x)"
                value={soc.platform}
                onChange={(e) => {
                  const copy = [...socialLinks];
                  copy[sIdx].platform = e.target.value;
                  setSocialLinks(copy);
                }}
                className={styles.input}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="Label"
                value={soc.label}
                onChange={(e) => {
                  const copy = [...socialLinks];
                  copy[sIdx].label = e.target.value;
                  setSocialLinks(copy);
                }}
                className={styles.input}
                style={{ flex: 1 }}
              />
              <input
                type="url"
                placeholder="URL (https://...)"
                value={soc.url}
                onChange={(e) => {
                  const copy = [...socialLinks];
                  copy[sIdx].url = e.target.value;
                  setSocialLinks(copy);
                }}
                className={styles.input}
                style={{ flex: 2 }}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={soc.visible}
                  onChange={(e) => {
                    const copy = [...socialLinks];
                    copy[sIdx].visible = e.target.checked;
                    setSocialLinks(copy);
                  }}
                />
                Visible
              </label>
              <button
                type="button"
                onClick={() => removeSocial(sIdx)}
                className={styles.dangerButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Groups Section */}
      <section className={styles.sectionCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className={styles.sectionHeading} style={{ borderBottom: "none", paddingBottom: 0 }}>
            Footer Link Groups
          </h2>
          <button type="button" onClick={addGroup} className={styles.secondaryButton}>
            + Add Link Column/Group
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
          {groups.map((group, gIdx) => (
            <div
              key={group.id}
              style={{
                border: "1px solid var(--color-border, #262320)",
                borderRadius: "0.5rem",
                padding: "1.25rem",
                backgroundColor: "rgba(255, 255, 255, 0.01)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--color-accent, #c8a77d)" }}>
                  Group #{gIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeGroup(gIdx)}
                  className={styles.dangerButton}
                >
                  Delete Group
                </button>
              </div>

              <div className={styles.fieldGrid} style={{ marginTop: "0.75rem" }}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Group Title (English)</label>
                  <input
                    type="text"
                    value={group.title.en}
                    onChange={(e) => {
                      const copy = [...groups];
                      copy[gIdx].title.en = e.target.value;
                      setGroups(copy);
                    }}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Group Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={group.title.ar}
                    onChange={(e) => {
                      const copy = [...groups];
                      copy[gIdx].title.ar = e.target.value;
                      setGroups(copy);
                    }}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-muted, #a39b8e)" }}>
                    LINKS IN THIS GROUP ({group.links.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => addLinkToGroup(gIdx)}
                    className={styles.secondaryButton}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                  >
                    + Add Link
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {group.links.map((link, lIdx) => (
                    <div key={link.id} className={styles.listRow}>
                      <input
                        type="text"
                        placeholder="Label EN"
                        value={link.label.en}
                        onChange={(e) => {
                          const copy = [...groups];
                          copy[gIdx].links[lIdx].label.en = e.target.value;
                          setGroups(copy);
                        }}
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="Label AR"
                        value={link.label.ar}
                        onChange={(e) => {
                          const copy = [...groups];
                          copy[gIdx].links[lIdx].label.ar = e.target.value;
                          setGroups(copy);
                        }}
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => {
                          const copy = [...groups];
                          copy[gIdx].links[lIdx].url = e.target.value;
                          setGroups(copy);
                        }}
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeLinkFromGroup(gIdx, lIdx)}
                        className={styles.dangerButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.bottomBar}>
        <button type="submit" disabled={saving} className={styles.primaryButton}>
          {saving ? "Saving..." : "Save Footer CMS"}
        </button>
      </div>
    </form>
  );
}
