"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./campaign-gallery.module.css";

const SHOTS = [
  {
    src: "/images/campaign/2026/boy-black-back.jpg",
    altEn: "Black Journey hoodie from the back, camel embroidery, pyramids at sunset",
    altAr: "هودي الرحلة الأسود من ورا، تطريز الجمل، الأهرامات وقت الغروب",
    size: "large",
  },
  {
    src: "/images/campaign/2026/girl-blue-back.jpg",
    altEn: "Slate blue hoodie from the back against sandstone",
    altAr: "الهودي الأزرق من ورا على حجر رملي",
    size: "tall",
  },
  {
    src: "/images/campaign/2026/boy-black-desert.jpg",
    altEn: "Black hoodie in the desert at golden hour",
    altAr: "هودي أسود في الصحرا وقت الغروب",
    size: "standard",
  },
  {
    src: "/images/campaign/2026/girl-blue-street.jpg",
    altEn: "Slate blue hoodie against a sandstone wall",
    altAr: "الهودي الأزرق على حيطة حجر رملي",
    size: "standard",
  },
  {
    src: "/images/campaign/2026/embroidery-gold.jpg",
    altEn: "Close-up of the gold camel and sun embroidery",
    altAr: "لقطة قريبة لتطريز الجمل والشمس الدهبي",
    size: "standard",
  },
  {
    src: "/images/campaign/2026/embroidery-grey.jpg",
    altEn: "Close-up of the raised grey embroidery on Desert X",
    altAr: "لقطة قريبة للتطريز الرمادي البارز على Desert X",
    size: "standard",
  },
  {
    src: "/images/campaign/2026/flatlay-black.jpg",
    altEn: "Black hoodie front and back laid flat",
    altAr: "الهودي الأسود من قدام وورا مفروش",
    size: "standard",
  },
  {
    src: "/images/campaign/2026/flatlay-blue.jpg",
    altEn: "Slate blue hoodie front and back laid flat",
    altAr: "الهودي الأزرق من قدام وورا مفروش",
    size: "standard",
  },
];

/**
 * Editorial image mosaic for the current drop: campaign portraits, embroidery
 * macros and flat-lays. Sits right after the campaign band so the browsing
 * scroll keeps showing the product in the world it belongs to.
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

        <div className={styles.grid}>
          {SHOTS.map((shot, index) => (
            <Reveal
              key={shot.src}
              delay={Math.min(index * 60, 240)}
              className={[
                styles.cell,
                shot.size === "large" ? styles.large : "",
                shot.size === "tall" ? styles.tall : "",
              ].join(" ")}
            >
              <div className={styles.frame}>
                <Image
                  src={shot.src}
                  alt={isAr ? shot.altAr : shot.altEn}
                  fill
                  sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
                  className={styles.image}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
