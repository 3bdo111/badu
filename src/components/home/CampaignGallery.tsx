"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./campaign-gallery.module.css";

type Shot = { src: string; altEn: string; altAr: string };

const OPENER_MAIN: Shot = {
  src: "/images/campaign/2026/girl-blue-street.jpg",
  altEn: "Slate blue hoodie against a sandstone wall",
  altAr: "الهودي الأزرق على حيطة حجر رملي",
};

const OPENER_SECOND: Shot = {
  src: "/images/campaign/2026/boy-black-desert.jpg",
  altEn: "Black hoodie in the desert at golden hour",
  altAr: "هودي أسود في الصحرا وقت الغروب",
};

const BACK_SHOTS: Shot[] = [
  {
    src: "/images/campaign/2026/girl-blue-back.jpg",
    altEn: "Slate blue hoodie from the back against sandstone",
    altAr: "الهودي الأزرق من ورا على حجر رملي",
  },
  {
    src: "/images/campaign/2026/boy-black-back.jpg",
    altEn: "Black Journey hoodie from the back, camel embroidery, pyramids at sunset",
    altAr: "هودي الرحلة الأسود من ورا، تطريز الجمل، الأهرامات وقت الغروب",
  },
];

const DETAIL_SHOTS: Shot[] = [
  {
    src: "/images/campaign/2026/flatlay-blue.jpg",
    altEn: "Slate blue hoodie front and back laid flat",
    altAr: "الهودي الأزرق من قدام وورا مفروش",
  },
  {
    src: "/images/campaign/2026/flatlay-black.jpg",
    altEn: "Black hoodie front and back laid flat",
    altAr: "الهودي الأسود من قدام وورا مفروش",
  },
  {
    src: "/images/campaign/2026/embroidery-gold.jpg",
    altEn: "Close-up of the gold camel and sun embroidery",
    altAr: "لقطة قريبة لتطريز الجمل والشمس الدهبي",
  },
  {
    src: "/images/campaign/2026/embroidery-grey.jpg",
    altEn: "Close-up of the raised grey embroidery on Desert X",
    altAr: "لقطة قريبة للتطريز الرمادي البارز على Desert X",
  },
];

function Frame({
  shot,
  isAr,
  sizes,
  priority = false,
}: {
  shot: Shot;
  isAr: boolean;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={styles.frame}>
      <Image
        src={shot.src}
        alt={isAr ? shot.altAr : shot.altEn}
        fill
        sizes={sizes}
        priority={priority}
        className={styles.image}
      />
    </div>
  );
}

/**
 * Editorial lookbook for the current drop, built as three movements rather
 * than a uniform grid: an asymmetric opener (two portraits and a statement
 * panel), a full-width duet of the two backs, and a tight strip of details.
 */
export function CampaignGallery() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section aria-labelledby="campaign-gallery-heading" className={styles.section}>
      <Container>
        <Reveal>
          <div className={styles.head}>
            <p className={styles.label}>{isAr ? "٠٧ — الكامبين" : "07 — IN THE WILD"}</p>
            <h2 id="campaign-gallery-heading" className={styles.heading}>
              {isAr ? "القطعة في عالمها" : "THE PIECE IN ITS WORLD"}
            </h2>
            <p className={styles.sub}>
              {isAr
                ? "من الصحرا للشارع: صور الكامبين، وتفاصيل التطريز عن قرب."
                : "From the desert to the street: campaign frames and the embroidery up close."}
            </p>
          </div>
        </Reveal>

        {/* Movement 1 — asymmetric opener */}
        <div className={styles.opener}>
          <Reveal className={styles.openerMain}>
            <Frame shot={OPENER_MAIN} isAr={isAr} sizes="(min-width: 64rem) 56vw, 100vw" />
          </Reveal>

          <div className={styles.openerSide}>
            <Reveal delay={90} className={styles.openerSecond}>
              <Frame shot={OPENER_SECOND} isAr={isAr} sizes="(min-width: 64rem) 40vw, 100vw" />
            </Reveal>
            <Reveal delay={160}>
              <div className={styles.panel}>
                <span className={styles.panelIndex}>01 — 08</span>
                <span className={styles.panelRule} aria-hidden="true" />
                <span className={styles.panelLabel}>
                  {isAr ? "دروب ٠١ — جورني" : "DROP 01 — THE JOURNEY"}
                </span>
                <span className={styles.panelMeta}>{isAr ? "القاهرة — مصر" : "CAIRO — EGYPT"}</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Movement 2 — the two backs, full width */}
        <Reveal delay={60}>
          <p className={styles.movementLabel}>{isAr ? "الظهر" : "THE BACK"}</p>
        </Reveal>
        <div className={styles.duet}>
          {BACK_SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 100} className={styles.duetItem}>
              <Frame shot={shot} isAr={isAr} sizes="(min-width: 64rem) 48vw, 100vw" />
            </Reveal>
          ))}
        </div>

        {/* Movement 3 — detail strip */}
        <Reveal delay={60}>
          <p className={styles.movementLabel}>{isAr ? "التفاصيل" : "THE DETAILS"}</p>
        </Reveal>
        <div className={styles.strip}>
          {DETAIL_SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 70} className={styles.stripItem}>
              <Frame shot={shot} isAr={isAr} sizes="(min-width: 64rem) 24vw, 50vw" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
