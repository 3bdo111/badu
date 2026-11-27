/**
 * Store policy + contact copy.
 *
 * DRAFT: the bracketed placeholders must be replaced with the store owner's
 * real answers before these pages go live. They are deliberately obvious so a
 * page can never ship with a blank promise on it.
 */
export type PolicyBlock = { heading: string; body: string };

export type PolicyContent = {
  slug: "shipping" | "returns" | "privacy" | "contact";
  titleEn: string;
  titleAr: string;
  introEn: string;
  introAr: string;
  blocksEn: PolicyBlock[];
  blocksAr: PolicyBlock[];
};

const CONTACT_PLACEHOLDER_EN = "[contact email] and [contact phone]";
const CONTACT_PLACEHOLDER_AR = "[إيميل التواصل] و[رقم التواصل]";

export const POLICIES: Record<PolicyContent["slug"], PolicyContent> = {
  shipping: {
    slug: "shipping",
    titleEn: "SHIPPING",
    titleAr: "الشحن والتوصيل",
    introEn:
      "Every BADU order is packed in Cairo and delivered across Egypt. Payment is cash on delivery.",
    introAr:
      "كل أوردر من بادو بيتحزم في القاهرة وبيتوصّل في كل مصر. الدفع كاش عند الاستلام.",
    blocksEn: [
      {
        heading: "Delivery time",
        body: "Orders arrive within [delivery window] from the day you order. We message you on WhatsApp to confirm the address before dispatch.",
      },
      {
        heading: "Shipping cost",
        body: "A flat EGP 50 per order, shown at checkout before you confirm. No hidden fees, no extra charge per item.",
      },
      {
        heading: "Where we deliver",
        body: "All governorates in Egypt. If your area is served by a courier we cannot reach, we will contact you before shipping and refund or reschedule.",
      },
      {
        heading: "Cash on delivery",
        body: "You pay the courier in cash when the order arrives. Nothing is charged online.",
      },
    ],
    blocksAr: [
      {
        heading: "مدة التوصيل",
        body: "الأوردر بيوصل في خلال [مدة التوصيل] من يوم الطلب. بنكلّمك على واتساب نأكد العنوان قبل الشحن.",
      },
      {
        heading: "تكلفة الشحن",
        body: "50 جنيه لكل أوردر، وبتظهر في صفحة الطلب قبل ما تأكد. مفيش رسوم مخفية ولا زيادة على كل قطعة.",
      },
      {
        heading: "بنوصّل فين",
        body: "كل محافظات مصر. لو المنطقة بتاعتك صعب يوصلها المندوب، بنكلّمك قبل الشحن ونرتّب معاك.",
      },
      {
        heading: "الدفع عند الاستلام",
        body: "بتدفع للمندوب كاش لما الأوردر يوصل. مفيش أي دفع أونلاين.",
      },
    ],
  },
  returns: {
    slug: "returns",
    titleEn: "RETURNS & EXCHANGES",
    titleAr: "الاسترجاع والاستبدال",
    introEn:
      "If something is not right with your order, tell us and we will sort it out.",
    introAr: "لو في حاجة مش مظبوطة في أوردرك، كلّمنا وهنحلها.",
    blocksEn: [
      {
        heading: "Exchange window",
        body: "You can ask for a size exchange within [return window] of receiving the order, as long as the piece is unworn, unwashed and still has its tags.",
      },
      {
        heading: "How to start",
        body: `Message us on WhatsApp with your order number and a photo of the piece. Contact: ${CONTACT_PLACEHOLDER_EN}.`,
      },
      {
        heading: "Return shipping",
        body: "[Who pays return shipping] — we will confirm the cost with you before the exchange moves.",
      },
      {
        heading: "Damaged or wrong item",
        body: "If the piece arrives damaged or is not what you ordered, send a photo within 48 hours and we replace it at our cost.",
      },
    ],
    blocksAr: [
      {
        heading: "مدة الاستبدال",
        body: "تقدر تطلب تبديل مقاس في خلال [مدة الاسترجاع] من استلام الأوردر، بشرط إن القطعة ما اتلبستش ولا اتغسلت ولسه بالتاج بتاعها.",
      },
      {
        heading: "تبدأ إزاي",
        body: `كلّمنا على واتساب برقم الأوردر وصورة للقطعة. التواصل: ${CONTACT_PLACEHOLDER_AR}.`,
      },
      {
        heading: "شحن الاسترجاع",
        body: "[مين بيدفع شحن الاسترجاع] — بنأكد معاك التكلفة قبل ما نكمل الاستبدال.",
      },
      {
        heading: "قطعة تالفة أو غلط",
        body: "لو القطعة وصلت تالفة أو مش اللي طلبته، ابعت صورة في خلال 48 ساعة وبنبدلها على حسابنا.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    titleEn: "PRIVACY",
    titleAr: "الخصوصية",
    introEn:
      "We collect only what we need to deliver your order, and we do not sell it.",
    introAr: "بنجمع اللي محتاجينه بس عشان نوصّل أوردرك، ومش بنبيعه لحد.",
    blocksEn: [
      {
        heading: "What we collect",
        body: "Name, phone number, delivery address and the order details you give us at checkout. Email is optional.",
      },
      {
        heading: "Why we collect it",
        body: "To confirm the order on WhatsApp, to hand it to the courier, and to answer you if something goes wrong with the delivery.",
      },
      {
        heading: "Who sees it",
        body: "BADU and the courier delivering your order. Nobody else.",
      },
      {
        heading: "Your choice",
        body: `Ask us to delete your details at any time: ${CONTACT_PLACEHOLDER_EN}.`,
      },
      {
        heading: "Measurement",
        body: "We use basic site analytics to see which pages people visit. It does not identify you personally.",
      },
    ],
    blocksAr: [
      {
        heading: "بنجمع إيه",
        body: "الاسم ورقم الموبايل والعنوان وتفاصيل الأوردر اللي بتكتبها في صفحة الطلب. الإيميل اختياري.",
      },
      {
        heading: "بنجمعه ليه",
        body: "عشان نأكد الأوردر على واتساب، ونسلّمه للمندوب، ونرد عليك لو حصلت مشكلة في التوصيل.",
      },
      {
        heading: "مين بيشوفه",
        body: "بادو والمندوب اللي بيوصّل أوردرك. ومحدش تاني.",
      },
      {
        heading: "القرار ليك",
        body: `تقدر تطلب مسح بياناتك في أي وقت: ${CONTACT_PLACEHOLDER_AR}.`,
      },
      {
        heading: "القياس",
        body: "بنستخدم تحليلات بسيطة للموقع عشان نعرف الناس بتزور أنهي صفحات، ومش بتعرّفنا مين إنت.",
      },
    ],
  },
  contact: {
    slug: "contact",
    titleEn: "CONTACT",
    titleAr: "تواصل معانا",
    introEn: "Questions about sizing, delivery or an order? Talk to us directly.",
    introAr: "عندك سؤال عن المقاسات أو التوصيل أو أوردر؟ كلّمنا على طول.",
    blocksEn: [
      { heading: "WhatsApp", body: "[WhatsApp number]" },
      { heading: "Email", body: "[contact email]" },
      { heading: "Phone", body: "[contact phone]" },
      { heading: "Hours", body: "[support hours]" },
      { heading: "Based in", body: "Cairo, Egypt. Delivering across the country." },
    ],
    blocksAr: [
      { heading: "واتساب", body: "[رقم الواتساب]" },
      { heading: "الإيميل", body: "[إيميل التواصل]" },
      { heading: "التليفون", body: "[رقم التواصل]" },
      { heading: "مواعيد الرد", body: "[مواعيد الرد]" },
      { heading: "مكاننا", body: "القاهرة، مصر. وبنوصّل في كل المحافظات." },
    ],
  },
};
