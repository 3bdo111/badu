import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Contact — BADU",
  description: "How to reach BADU.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PolicyPage slug="contact" />;
}
