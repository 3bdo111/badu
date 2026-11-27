import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping — BADU",
  description: "BADU shipping and delivery across Egypt, cash on delivery.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PolicyPage slug="shipping" />;
}
