"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import styles from "./delete-confirm-modal.module.css";

export function DeleteConfirmModal({
  isOpen,
  productName,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onCancel} aria-hidden="true">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-modal-title" className={styles.title}>
          {t("admin.confirmDeleteTitle")}
        </h3>
        <p className={styles.body}>
          {t("admin.confirmDeleteBody")} ({productName})
        </p>

        <div className={styles.actions}>
          <Button variant="outline" size="md" onClick={onCancel}>
            {t("admin.cancel")}
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm} className={styles.deleteBtn}>
            {t("admin.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
