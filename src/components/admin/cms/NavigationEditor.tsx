"use client";

import { useState, useEffect } from "react";
import type { NavigationItem } from "@/lib/types/cms";
import styles from "./cms-editor.module.css";

export function NavigationEditor() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/navigation");
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Failed to load navigation items:", err);
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
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        throw new Error("Failed to save navigation");
      }

      const data = await res.json();
      setItems(data.items);
      setMessage({ text: "Navigation items saved successfully!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save navigation";
      setMessage({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: { en: "New Link", ar: "رابط جديد" },
      url: "/store",
      sortOrder: items.length,
      visible: true,
      isExternal: false,
      targetBlank: false,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;

    // Recalculate sortOrder
    copy.forEach((item, idx) => {
      item.sortOrder = idx;
    });

    setItems(copy);
  };

  const updateItem = (index: number, fields: Partial<NavigationItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...fields };
    setItems(copy);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading navigation...</div>;
  }

  return (
    <form onSubmit={handleSave} className={styles.formContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Header & Navigation CMS</h1>
          <p className={styles.pageSubtitle}>Control main menu items, labels, paths, visibility, and display order</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={addItem} className={styles.secondaryButton}>
            + Add Link
          </button>
          <button type="submit" disabled={saving} className={styles.primaryButton}>
            {saving ? "Saving..." : "Save Navigation"}
          </button>
        </div>
      </div>

      {message && (
        <div className={message.error ? styles.errorBanner : styles.successBanner}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((item, idx) => (
          <div key={item.id} className={styles.sectionCard} style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "var(--color-accent, #c8a77d)" }}>
                #{idx + 1} — {item.label.en || "Untitled Link"}
              </span>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, "up")}
                  className={styles.secondaryButton}
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => moveItem(idx, "down")}
                  className={styles.secondaryButton}
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className={styles.dangerButton}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className={styles.fieldGrid} style={{ marginTop: "0.5rem" }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Label (English)</label>
                <input
                  type="text"
                  value={item.label.en}
                  onChange={(e) =>
                    updateItem(idx, { label: { ...item.label, en: e.target.value } })
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Label (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={item.label.ar}
                  onChange={(e) =>
                    updateItem(idx, { label: { ...item.label, ar: e.target.value } })
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>URL Path / Link</label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItem(idx, { url: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                  />
                  Visible in Navigation
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={item.targetBlank}
                    onChange={(e) => updateItem(idx, { targetBlank: e.target.checked })}
                  />
                  Open in New Tab
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.bottomBar}>
        <button type="submit" disabled={saving} className={styles.primaryButton}>
          {saving ? "Saving..." : "Save Navigation"}
        </button>
      </div>
    </form>
  );
}
