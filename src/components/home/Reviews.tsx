"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { reviews as reviewData } from "@/data/reviews";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import styles from "./reviews.module.css";

export function Reviews() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const hasReviews = reviewData.length > 0;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className={styles.reviews}>
      <Container>
        <Reveal>
          <div className={styles.center}>
            <SunMark className={styles.sun} />
            <p className="label">{isAr ? "٠٧ — آراء وتقييمات العملاء" : "07 — VERIFIED CUSTOMER REVIEWS"}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <Heading level={2} id="reviews-heading" className={styles.heading}>
            {isAr ? "تقييمات مجربة من مجتمعنا" : "VERIFIED COMMUNITY REVIEWS"}
          </Heading>
        </Reveal>

        <Reveal delay={120}>
          <div className={styles.ratingSummary}>
            <div className={styles.bigRating}>
              <span className={styles.ratingScore}>5.0</span>
              <span className={styles.stars}>★★★★★</span>
            </div>
            <p className={styles.ratingSub}>
              {isAr ? "بناءً على أكثر من 1,200+ عميل راضٍ في مصر والوطن العربي" : "Based on 1,200+ verified customer purchases"}
            </p>
          </div>
        </Reveal>

        {hasReviews && (
          <div className={styles.reviewGrid}>
            {reviewData.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 80}>
                <div className={styles.reviewCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.ratingRow} aria-label={`Rating: ${item.rating} out of 5`}>
                      {"★".repeat(item.rating)}
                    </div>
                    {item.verified && (
                      <span className={styles.verifiedBadge}>
                        ✓ {isAr ? "شراء موثّق" : "Verified Purchase"}
                      </span>
                    )}
                  </div>

                  <p className={styles.reviewText}>&quot;{item.text[locale] || item.text.en}&quot;</p>

                  <div className={styles.authorRow}>
                    <div className={styles.authorMeta}>
                      <span className={styles.authorName}>{item.author}</span>
                      {item.location && (
                        <span className={styles.authorLoc}>
                          {item.location[locale] || item.location.en}
                        </span>
                      )}
                    </div>
                    {item.sizePurchased && (
                      <span className={styles.sizeBadge}>
                        {isAr ? `المقاس: ${item.sizePurchased}` : `Size: ${item.sizePurchased}`}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={240}>
          <div className={styles.trustBanner}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>💵</span>
              <div>
                <strong>{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</strong>
                <span>{isAr ? "ادفع عند استلام طلبك ومعاينته" : "Inspect & pay upon arrival"}</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🔄</span>
              <div>
                <strong>{isAr ? "استبدال واسترجاع مجاني" : "14-Day Hassle-Free Returns"}</strong>
                <span>{isAr ? "سياسة استبدال خلال 14 يوماً" : "14-day exchange & return policy"}</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🚚</span>
              <div>
                <strong>{isAr ? "شحن سريع آمن" : "Express Fast Shipping"}</strong>
                <span>{isAr ? "توصيل خلال 2-4 أيام عمل" : "Delivered in 2-4 business days"}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
