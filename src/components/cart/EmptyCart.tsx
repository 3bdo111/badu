"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { SunMark } from "@/components/ui/SunMark";
import { Button } from "@/components/ui/Button";
import styles from "./empty-cart.module.css";

export function EmptyCart({ onAction }: { onAction?: () => void }) {
  const { t } = useI18n();

  return (
    <div className={styles.emptyCart}>
      <SunMark className={styles.sun} />
      <h3 className={styles.title}>{t("cart.empty")}</h3>
      <p className={styles.subtitle}>{t("cart.emptySubtitle")}</p>
      <div className={styles.action}>
        <Button
          href="/#hoodie"
          onClick={onAction}
          variant="primary"
          size="md"
        >
          {t("cart.exploreCta")}
        </Button>
      </div>
    </div>
  );
}
