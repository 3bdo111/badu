"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types/product";
import { isSizeAvailable, productDescription, productName } from "@/lib/types/product";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { ProductImage } from "@/components/product/ProductImage";
import { SizeSelector } from "@/components/product/SizeSelector";
import styles from "./purchase-section.module.css";

type Feedback = "none" | "error" | "added";

/**
 * Product purchase section — reads everything from the Product model.
 * STEP 5–7 (admin) only needs to change the data source, not this UI.
 */
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";

interface PurchaseSectionProps {
  section?: StorefrontSectionRecord;
  featuredProduct?: Product;
}

export function PurchaseSection({ section, featuredProduct }: PurchaseSectionProps = {}) {
  const { t, locale } = useI18n();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | undefined>(featuredProduct || getFeaturedProduct());

  useEffect(() => {
    if (!featuredProduct) {
      return productService.subscribe(() => {
        setProduct(getFeaturedProduct());
      });
    }
  }, [featuredProduct]);

  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [size, setSize] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const resetTimer = useRef<number | undefined>(undefined);

  if (!product) return null;

  const color = product.colors[0];
  const activeImage = product.images[activeImgIndex] ?? product.images[0];

  const handleSelect = (next: string) => {
    setSize(next);
    if (feedback === "error") setFeedback("none");
  };

  const handleAddToCart = () => {
    if (!size) {
      setFeedback("error");
      return;
    }
    addItem({ productId: product.id, slug: product.slug, size });
    setFeedback("added");
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFeedback("none"), 2200);
  };

  const feedbackMessage =
    feedback === "error"
      ? t("sections.purchase.selectSize")
      : feedback === "added"
        ? t("sections.purchase.added")
        : null;

  const accordionItems = [
    {
      title: t("sections.purchase.accordion.details"),
      content: t("sections.purchase.accordion.detailsBody"),
    },
    {
      title: t("sections.purchase.accordion.fit"),
      content: t("sections.purchase.accordion.fitBody"),
    },
    {
      title: t("sections.purchase.accordion.care"),
      content: t("sections.purchase.accordion.careBody"),
    },
    {
      title: t("sections.purchase.accordion.shipping"),
      content: t("sections.purchase.accordion.shippingBody"),
    },
    {
      title: t("sections.purchase.accordion.returns"),
      content: t("sections.purchase.accordion.returnsBody"),
    },
  ];

  return (
    <section
      id="hoodie"
      aria-labelledby="purchase-heading"
      className={styles.purchase}
    >
      <Container>
        <div className={styles.grid}>
          <Reveal className={styles.visual}>
            <div className={styles.gallery}>
              <div className={styles.frame}>
                <ProductImage
                  product={product}
                  image={activeImage}
                  sizes="(min-width: 64rem) 46vw, 100vw"
                />
              </div>

              {product.images.length > 1 && (
                <div className={styles.thumbnails} role="region" aria-label="Product thumbnails">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      className={[
                        styles.thumbBtn,
                        idx === activeImgIndex ? styles.activeThumb : "",
                      ].join(" ")}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <div className={styles.thumbFrame}>
                        <ProductImage
                          product={product}
                          image={img}
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <div className={styles.info}>
            <Reveal>
              <p className="label">
                {section
                  ? locale === "ar"
                    ? section.titleAr || t("sections.purchase.label")
                    : section.titleEn || t("sections.purchase.label")
                  : t("sections.purchase.label")}
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h2 id="purchase-heading" className={styles.name}>
                {productName(product, locale)}
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <p className={styles.price}>
                {formatPrice(product.price, product.currency, locale)}
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className={styles.metaBadges}>
                <p className={styles.availability}>
                  <span
                    className={[
                      styles.dot,
                      product.available ? styles.dotAvailable : styles.dotUnavailable,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  {product.available
                    ? t("sections.purchase.available")
                    : t("sections.purchase.unavailable")}
                </p>

                <span className={styles.tagBadge}>
                  {t("sections.purchase.fitLabel")}
                </span>
                <span className={styles.tagBadge}>
                  {t("sections.purchase.artworkLabel")}
                </span>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>
                  {t("product.colorLabel")}
                </span>
                <span className={styles.colorValue}>
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  {color.name[locale]}
                </span>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className={styles.optionBlock}>
                <div className={styles.sizeHeaderRow}>
                  <span className={styles.optionLabel} id="size-label">
                    {t("product.sizeLabel")}
                  </span>
                  <a href="#size" className={styles.sizeGuideLink}>
                    📏 {locale === "ar" ? "جدول المقاسات" : "Size Guide"}
                  </a>
                </div>
                <SizeSelector
                  sizes={product.sizes}
                  selected={size}
                  onSelect={handleSelect}
                  unavailableSizes={product.sizes.filter(
                    (s) => !isSizeAvailable(product, s)
                  )}
                  labelId="size-label"
                />
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className={styles.buyRow}>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={[styles.mainBuyBtn, feedback === "added" ? styles.addedButton : ""].join(" ")}
                >
                  {feedback === "added"
                    ? t("sections.purchase.added")
                    : t("sections.purchase.addToCart")}
                </Button>
                <span className={styles.feedback} aria-live="polite">
                  {feedbackMessage}
                </span>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className={styles.trustBadgesGrid}>
                <div className={styles.trustBadgeItem}>
                  <span className={styles.trustIcon}>💵</span>
                  <div className={styles.trustText}>
                    <strong>{locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}</strong>
                    <span>{locale === "ar" ? "ادفع عند استلام طلبك" : "Pay when your order arrives"}</span>
                  </div>
                </div>
                <div className={styles.trustBadgeItem}>
                  <span className={styles.trustIcon}>🚚</span>
                  <div className={styles.trustText}>
                    <strong>{locale === "ar" ? "شحن سريع" : "Express Delivery"}</strong>
                    <span>{locale === "ar" ? "توصيل خلال 2-4 أيام" : "Delivered in 2-4 business days"}</span>
                  </div>
                </div>
                <div className={styles.trustBadgeItem}>
                  <span className={styles.trustIcon}>🔄</span>
                  <div className={styles.trustText}>
                    <strong>{locale === "ar" ? "إرجاع واستبدال" : "Easy Exchange"}</strong>
                    <span>{locale === "ar" ? "سياسة إرجاع خلال 14 يوم" : "14-day hassle-free return policy"}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <p className={styles.description}>
                {productDescription(product, locale)}
              </p>
            </Reveal>

            <Reveal delay={340} className={styles.accordionWrap}>
              <Accordion items={accordionItems} variant="compact" />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
