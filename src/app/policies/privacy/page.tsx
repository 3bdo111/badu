import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy — BADU",
  description: "What BADU collects and why.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PolicyPage slug="privacy" />;
}
