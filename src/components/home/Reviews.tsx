"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { reviews as reviewData } from "@/data/reviews";
import type { Review } from "@/lib/types/review";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { parseSectionBodyLines } from "@/lib/storefront/section-definitions";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import styles from "./reviews.module.css";

interface ReviewsProps {
  section?: StorefrontSectionRecord;
}

function TrustBanner() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
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
  );
}

export function Reviews({ section }: ReviewsProps = {}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  // Reviews entered via the CMS by the store owner (one per line:
  // "Author | Rating 1-5 | Review text"). Only genuine, owner-approved
  // reviews are rendered — nothing is ever fabricated.
  const cmsRows = parseSectionBodyLines(isAr ? section?.bodyAr : section?.bodyEn);
  const cmsReviews: Review[] = cmsRows
    .map((cells, idx) => {
      const rating = Math.max(1, Math.min(5, parseInt(cells[1] || "5", 10) || 5));
      return {
        id: `cms-review-${idx}`,
        author: cells[0] || (isAr ? "عميل" : "Customer"),
        rating,
        text: { en: cells[2] || "", ar: cells[2] || "" },
        date: "",
        verified: false,
      };
    })
    .filter((r) => r.text.en.length > 0);

  const allReviews = [...reviewData, ...cmsReviews];
  const hasReviews = allReviews.length > 0;

  const headingText =
    (isAr ? section?.titleAr : section?.titleEn) ||
    (isAr ? "آراء من مجتمعنا" : "COMMUNITY REVIEWS");

  // Only render social proof when genuine review data exists. Fabricated
  // ratings, purchase counts, or "verified" badges are never shown.
  if (!hasReviews) {
    return (
      <section id="reviews" className={styles.reviews}>
        <Container>
          <Reveal>
            <TrustBanner />
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className={styles.reviews}>
      <Container>
        <Reveal>
          <div className={styles.center}>
            <SunMark className={styles.sun} />
            <p className="label">{isAr ? "٠٧ — آراء العملاء" : "07 — CUSTOMER REVIEWS"}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <Heading level={2} id="reviews-heading" className={styles.heading}>
            {headingText}
          </Heading>
        </Reveal>

        <div className={styles.reviewGrid}>
          {allReviews.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 80}>
              <div className={styles.reviewCard}>
                <div className={styles.cardTop}>
                  <div className={styles.ratingRow} aria-label={`Rating: ${item.rating} out of 5`}>
                    {"★".repeat(item.rating)}
                  </div>
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

        <Reveal delay={240}>
          <TrustBanner />
        </Reveal>
      </Container>
    </section>
  );
}
