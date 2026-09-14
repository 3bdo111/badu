"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./skip-link.module.css";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <Link href="#main-content" className={styles.skipLink}>
      {t("common.skipToContent")}
    </Link>
  );
}
