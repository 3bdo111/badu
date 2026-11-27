import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & Exchanges — BADU",
  description: "How BADU handles returns and size exchanges.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PolicyPage slug="returns" />;
}
