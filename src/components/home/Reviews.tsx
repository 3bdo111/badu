"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { reviews as reviewData } from "@/data/reviews";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import styles from "./reviews.module.css";

/**
 * Customer Reviews section.
 * Architecture dynamically renders verified customer reviews when available.
 * Displays an intentional, polished pre-launch campaign card when no reviews exist.
 */
export function Reviews() {
  const { t } = useI18n();

  const hasReviews = reviewData.length > 0;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className={styles.reviews}>
      <Container narrow>
        <Reveal>
          <div className={styles.center}>
            <SunMark className={styles.sun} />
            <p className="label">{t("sections.reviews.label")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Heading level={2} id="reviews-heading" className={styles.heading}>
            {t("sections.reviews.heading")}
          </Heading>
        </Reveal>

        {hasReviews ? (
          <div className={styles.reviewList}>
            {reviewData.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 80}>
                <div className={styles.reviewCard}>
                  <div className={styles.ratingRow} aria-label={`Rating: ${item.rating} out of 5`}>
                    {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                  </div>
                  <p className={styles.reviewText}>&quot;{item.text}&quot;</p>
                  <div className={styles.authorRow}>
                    <span className={styles.authorName}>{item.author}</span>
                    {item.verified && (
                      <span className={styles.verifiedBadge}>
                        {t("sections.reviews.verifiedBadge")}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={200}>
            <div className={styles.prelaunchCard}>
              <p className={styles.body}>{t("sections.reviews.body")}</p>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
