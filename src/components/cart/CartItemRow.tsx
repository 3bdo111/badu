"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useCart, type CartItem } from "./CartProvider";
import { productRepository } from "@/lib/services/product-service";
import { isProductAvailable, productName } from "@/lib/types/product";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./cart-item-row.module.css";

export function CartItemRow({ item }: { item: CartItem }) {
  const { t, locale } = useI18n();
  const { updateQuantity, removeItem } = useCart();

  const product =
    productRepository.getProductById(item.productId) ||
    productRepository.getProductBySlug(item.slug);

  const handleRemove = () => {
    removeItem(item.productId, item.size);
  };

  if (!product || !isProductAvailable(product)) {
    return (
      <div className={styles.itemRow} style={{ opacity: 0.7 }}>
        <div className={styles.itemContent} style={{ width: "100%" }}>
          <div className={styles.headerRow}>
            <div className={styles.titleGroup}>
              <h4 className={styles.productName}>
                {product ? productName(product, locale) : item.slug}
              </h4>
              <p className={styles.metaDetails} style={{ color: "#a4574a" }}>
                {t("cart.unavailableItem")} • {t("cart.sizePrefix")} {item.size}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className={styles.removeBtn}
            >
              {t("cart.remove")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const color = product.colors[0];
  const primaryImage = product.images[0];
  const lineTotal = product.price * item.quantity;

  const handleDecrease = () => {
    updateQuantity(item.productId, item.size, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.size, item.quantity + 1);
  };

  return (
    <div className={styles.itemRow}>
      <div className={styles.thumbnailFrame}>
        {primaryImage && (
          <ProductImage
            product={product}
            image={primaryImage}
            sizes="96px"
          />
        )}
      </div>

      <div className={styles.itemContent}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <h4 className={styles.productName}>{productName(product, locale)}</h4>
            <p className={styles.metaDetails}>
              {color && <span>{color.name[locale]}</span>}
              {color && <span className={styles.metaDot} aria-hidden="true">•</span>}
              <span>{t("cart.sizePrefix")} {item.size}</span>
            </p>
          </div>
          <span className={styles.price}>
            {formatPrice(lineTotal, product.currency, locale)}
          </span>
        </div>

        <div className={styles.actionsRow}>
          <div className={styles.quantityControl} role="group" aria-label={productName(product, locale)}>
            <button
              type="button"
              onClick={handleDecrease}
              className={styles.qtyBtn}
              aria-label={`${t("cart.decreaseQty")} ${productName(product, locale)}`}
            >
              −
            </button>
            <span className={styles.qtyValue} aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className={styles.qtyBtn}
              aria-label={`${t("cart.increaseQty")} ${productName(product, locale)}`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
          >
            {t("cart.remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
