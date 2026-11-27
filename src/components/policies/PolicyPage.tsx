"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { POLICIES, type PolicyContent } from "@/lib/content/policies";

export function PolicyPage({ slug }: { slug: PolicyContent["slug"] }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const policy = POLICIES[slug];
  const blocks = isAr ? policy.blocksAr : policy.blocksEn;

  return (
    <div style={{ padding: "4rem 0 6rem" }}>
      <Container narrow>
        <style>{`.policy-heading{margin-bottom:1.5rem}`}</style>
        <p className="label" style={{ marginBottom: "1rem" }}>
          {isAr ? "سياسات المتجر" : "STORE POLICIES"}
        </p>
        <Heading level={1} className="policy-heading">
          {isAr ? policy.titleAr : policy.titleEn}
        </Heading>
        <p style={{ color: "var(--color-muted)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          {isAr ? policy.introAr : policy.introEn}
        </p>

        <div style={{ display: "grid", gap: "2rem" }}>
          {blocks.map((block) => (
            <section key={block.heading}>
              <h2
                style={{
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  textTransform: isAr ? "none" : "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                {block.heading}
              </h2>
              <p style={{ color: "var(--color-muted)", lineHeight: 1.75 }}>{block.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
