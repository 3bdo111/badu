"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function PurchaseEvent({
  orderNumber,
  value,
  currency,
  contentIds,
}: {
  orderNumber: string;
  value: number;
  currency: string;
  contentIds: string[];
}) {
  useEffect(() => {
    track("Purchase", {
      value,
      currency,
      content_ids: contentIds,
      content_type: "product",
      order_id: orderNumber,
    });
  }, [orderNumber, value, currency, contentIds]);

  return null;
}
