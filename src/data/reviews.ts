import type { Review } from "@/lib/types/review";

export const reviews: Review[] = [
  {
    id: "rev-1",
    author: "Omar K.",
    rating: 5,
    text: {
      en: "The 480GSM organic cotton feels incredibly heavy and luxurious. The oversized fit is spot-on and the back embroidery detail is unbelievable quality.",
      ar: "القطن الثقيل 480GSM خرافة ملمسه فخم جداً. القصة الواسعة مظبوطة بالظبط والتطريز على الظهر جودته عاليه جداً.",
    },
    date: "2026-09-10",
    verified: true,
    location: { en: "Cairo, EG", ar: "القاهرة" },
    sizePurchased: "L",
  },
  {
    id: "rev-2",
    author: "Youssef M.",
    rating: 5,
    text: {
      en: "Arrived in 2 days with Cash on Delivery. Fits perfectly with my cargo pants and streetwear sneakers. Worth every pound.",
      ar: "وصل خلال يومين والدفع كان عند الاستلام. قصة مريحة جداً وبيليق جداً مع الشوز والكارجو. يستاهل كل جنيه.",
    },
    date: "2026-09-08",
    verified: true,
    location: { en: "Alexandria, EG", ar: "الإسكندرية" },
    sizePurchased: "XL",
  },
  {
    id: "rev-3",
    author: "Kareem A.",
    rating: 5,
    text: {
      en: "Top tier streetwear quality. Better than international brands charging double. The hood shape holds up structured and doesn't flop.",
      ar: "خامة ممتازة جداً تقارن ببراندات عالمية بضعف السعر. شكل الزنط ماسك نفسه ومبيتبهدلش مع اللبس.",
    },
    date: "2026-09-05",
    verified: true,
    location: { en: "Giza, EG", ar: "الجيزة" },
    sizePurchased: "M",
  },
];
