"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./guide.module.css";

/* ---------- Reveal-on-scroll wrapper ---------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- Step ---------- */
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className={styles.step}>
      <span className={styles.stepNumber}>{n}</span>
      <div>
        <strong className={styles.stepTitle}>{title}</strong>
        <p className={styles.stepText}>{children}</p>
      </div>
    </li>
  );
}

/* ---------- Guide section block ---------- */
function GuideSection({
  id,
  icon,
  title,
  subtitle,
  image,
  imageAlt,
  children,
  tips,
}: {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
  children: ReactNode;
  tips?: string[];
}) {
  return (
    <section id={id} className={styles.guideSection} dir="rtl">
      <Reveal>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            {icon}
          </span>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <p className={styles.sectionSubtitle}>{subtitle}</p>
          </div>
        </div>
      </Reveal>

      <div className={styles.sectionBody}>
        <Reveal delay={100} className={styles.stepsCol}>
          <ol className={styles.steps}>{children}</ol>
          {tips && (
            <div className={styles.tipsBox}>
              <strong>💡 نصايح سريعة</strong>
              <ul>
                {tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        {image && (
          <Reveal delay={200} className={styles.shotCol}>
            <div className={styles.shotFrame}>
              <Image
                src={image}
                alt={imageAlt || title}
                width={1352}
                height={888}
                sizes="(max-width: 900px) 100vw, 540px"
                className={styles.shot}
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

const NAV = [
  { id: "start", label: "البداية" },
  { id: "dashboard", label: "لوحة التحكم" },
  { id: "products", label: "المنتجات" },
  { id: "storefront", label: "إدارة اللاندينج" },
  { id: "visual-editor", label: "المحرر البصري" },
  { id: "orders", label: "الطلبات" },
  { id: "extras", label: "أدوات تانية" },
];

export function AdminGuide() {
  const [activeSection, setActiveSection] = useState("start");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page} dir="rtl">
      {/* ===== Hero ===== */}
      <header className={styles.hero}>
        <div className={styles.heroFloat} aria-hidden="true">
          🏜️
        </div>
        <div className={styles.heroFloat2} aria-hidden="true">
          🧵
        </div>
        <div className={styles.heroFloat3} aria-hidden="true">
          🐪
        </div>
        <p className={styles.heroKicker}>دليل الاستخدام الكامل</p>
        <h1 className={styles.heroTitle}>
          إدارة متجر <span className={styles.heroBrand}>BADU</span> خطوة بخطوة
        </h1>
        <p className={styles.heroText}>
          من الألف للياء: إزاي تضيف منتج، تغيّر اللاندينج، تتابع الطلبات، وتستغل كل أداة
          في لوحة التحكم — بالبلدي ومن غير لف ودوران.
        </p>
        <div className={styles.heroCtas}>
          <a href="#start" className={styles.heroBtnPrimary}>
            ابدأ الشرح ↓
          </a>
          <Link href="/admin" className={styles.heroBtnSecondary}>
            روح للوحة التحكم
          </Link>
        </div>
      </header>

      {/* ===== Sticky nav ===== */}
      <nav className={styles.toc} aria-label="أقسام الدليل">
        {NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`${styles.tocLink} ${activeSection === id ? styles.tocLinkActive : ""}`}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* ===== Start ===== */}
      <GuideSection
        id="start"
        icon="🚀"
        title="أول مرة تدخل؟ ابدأ من هنا"
        subtitle="الخريطة السريعة لكل حاجة في اللوحة"
        tips={[
          "القايمة اللي على اليمين فيها كل صفحات الإدارة — جرّب تدخل كل صفحة واتفرج.",
          "أي تعديل في الموقع لازم يتعمل من اللوحة دي بس — مفيش حاجة بتتغير لوحدها.",
          "الألوان الخضرا معناها «كله تمام»، والبرتقالي معناه «في حاجة مستنياك تنشرها».",
        ]}
      >
        <Step n={1} title="سجّل دخولك">
          ادخل على <code>/admin/login</code> وبريدك وكلمة السر — هتفتح على طول على لوحة
          التحكم.
        </Step>
        <Step n={2} title="اعرف الصفحات الأساسية">
          عندك ٨ صفحات: لوحة التحكم، الطلبات، العملاء، المنتجات، اللاندينج، الهيدر
          والقوائم، الفوتر، والإعدادات العامة.
        </Step>
        <Step n={3} title="القاعدة الذهبية">
          اشتغل بالترتيب ده: <strong>المنتجات ← اللاندينج ← الطلبات</strong>. أي حاجة
          تانية إضافات.
        </Step>
      </GuideSection>

      {/* ===== Dashboard ===== */}
      <GuideSection
        id="dashboard"
        icon="📊"
        title="لوحة التحكم"
        subtitle="نظرة سريعة على صحة متجرك"
        image="/images/guide/dashboard.png"
        imageAlt="لقطة شاشة لوحة التحكم"
        tips={["اللوحة دي للمتابعة السريعة بس — كل التعديلات بتتم من الصفحات التانية."]}
      >
        <Step n={1} title="إحصائيات فوق">
          أول ما تدول هتلاقي أرقام الطلبات والمنتجات والمبيعات — حاجة سريعة تبص عليها كل
          يوم.
        </Step>
        <Step n={2} title="آخر النشاطات">
          تحت هتلاقي آخر الطلبات واللي حصل حديثًا في المتجر.
        </Step>
        <Step n={3} title="اختصارات">
          معظم اللوحات فيها زراير بتنقلك على طول للصفحة المطلوبة — استخدمها بدل ما
          تمشي في القايمة كل مرة.
        </Step>
      </GuideSection>

      {/* ===== Products ===== */}
      <GuideSection
        id="products"
        icon="🧵"
        title="المنتجات"
        subtitle="ضيف منتجك، صوّره، وحدد ألوانه"
        image="/images/guide/products.png"
        imageAlt="لقطة شاشة صفحة المنتجات"
        tips={[
          "أول صورة في القايمة هي اللي بتظهر في البطاقات — خليها أحلى صورة.",
          "اختصار Ctrl+S بيحفظ وأنت واقف في أي حتة في الفورم.",
          "لو غيّرت حاجة ومحتاج ترجعها: فيه زرار «تراجع» بيرجع آخر نسخة محفوظة.",
        ]}
      >
        <Step n={1} title="افتح صفحة المنتجات">
          من القايمة اختار «المنتجات» — هتلاقي كل منتجاتك مع السعر والحالة.
        </Step>
        <Step n={2} title="اعمل منتج جديد أو عدّل موجود">
          دوس «منتج جديد»، ولا اختار أي منتج تعدّل عليه. الاسم والوصف والسعر والمقاسات
          كلها في تاب واحد.
        </Step>
        <Step n={3} title="الصور والألوان — أهم جزء">
          في تاب «الوسائط» كل صورة ليها قائمة لون جنبها: اختار اللون اللي الصورة دي
          معبّرة عنه. لما العميل يختار اللون في المتجر، <strong>الصور بتتغير معاه على
          طول</strong>. الصورة اللي متحددلها «كل الألوان» بتظهر مع أي لون.
        </Step>
        <Step n={4} title="علّم المنتج اللي يظهر في اللاندينج">
          في أول تاب فيه مربع «منتج مميز في الرئيسية» — علّم عليه عشان المنتج ياخد
          مكانه في شبكة «التشكيلة».
        </Step>
        <Step n={5} title="احفظ وانشر">
          «حفظ المسودة» بيحفظ من غير ما يظهر، و«نشر» بيخليه يظهر للعملاء فورًا.
        </Step>
      </GuideSection>

      {/* ===== Storefront ===== */}
      <GuideSection
        id="storefront"
        icon="🎨"
        title="إدارة اللاندينج (الصفحة الرئيسية)"
        subtitle="كل نص وكل قسم في الصفحة الرئيسية بيدك"
        image="/images/guide/storefront.png"
        imageAlt="لقطة شاشة إدارة الواجهة"
        tips={[
          "اكتب في البحث «أسئلة» مثلًا وهيوصلك لقسم الأسئلة الشائعة في ثانية.",
          "النقطة الخضرا جنب القسم = منشور، البرتقالية = في تعديلات مستنية نشر.",
          "زرار «نشر الكل» بيخلص كل اللي معلّق دفعة واحدة.",
        ]}
      >
        <Step n={1} title="اختار القسم من القايمة">
          على يمينك قائمة بكل أقسام الصفحة الرئيسية مرتّبة زي ما بتظهر بالظبط، مع رقم
          ورقمها.
        </Step>
        <Step n={2} title="عدّل بالعربي والإنجليزي جنب بعض">
          كل حقل له عمودين: EN بالشمال وعربي باليمين — اكتب الاتنين عشان الموقع
          يتنقل بين اللغتين صح.
        </Step>
        <Step n={3} title="استخدم التلميحات">
          تحت كل «نص رئيسي» فيه سطر 💡 بيقولك الصيغة المطلوبة — زي الأسئلة الشائعة:
          سؤال في كل سطر، وبين السؤال والإجابة علامة |.
        </Step>
        <Step n={4} title="إظهار وإخفاء وترتيب">
          مربع «إظهار القسم» بيتحكم في ظهوره، ووضع «⇅ الترتيب» بيخليك ترفع وتوطّي أي
          قسم بسهمين.
        </Step>
        <Step n={5} title="خد بالك من الحفظ">
          لو عدّت حاجة وفتت قسم تاني، هيسألك: تفضل وتكمل ولا تسيب التعديلات؟ كده مفيش
          حاجة بتضيع منك بالغلط.
        </Step>
      </GuideSection>

      {/* ===== Visual editor ===== */}
      <GuideSection
        id="visual-editor"
        icon="👁️"
        title="المحرر البصري (المعاينة الحية)"
        subtitle="شوف اللاندينج قدامك وعدّل فيه على طول"
        image="/images/guide/visual-editor.png"
        imageAlt="لقطة شاشة المحرر البصري"
        tips={[
          "بعد ما تخلص، دوس «نشر التغييرات» فوق — غير كده العملاء مش هيشوفوا حاجة.",
          "جرّب وضع الجوال — شكل الموقع على الموبايل مختلف وأحيانًا يحتاج تظبيط.",
          "اختصار Ctrl+S بيحفظ مسودة القسم اللي واقف عليه.",
        ]}
      >
        <Step n={1} title="افتحه من اللاندينج">
          دوس «المحرر البصري» فوق — هيفتح الصفحة الرئيسية قدامك زي ما العميل بيشوفها
          بالظبط.
        </Step>
        <Step n={2} title="اضغط على أي قسم">
          كل قسم في الصفحة لو دست عليه بيتظلل برتقالي وبيفتح إعداداته في القايمة
          الشمال — والعكس، لو اخترت من القايمة الصفحة بتنزلك عليه.
        </Step>
        <Step n={3} title="جرّب على كل الأجهزة">
          فوق فيه أزرار: سطح مكتب، تابلت، وجوال — شوف الشكل على كل مقاس قبل ما
          تطلعه.
        </Step>
        <Step n={4} title="افهم النقط">
          كل قسم في القايمة له نقطة: خضرا يعني منشور زي ما هو، برتقالية يعني عليه
          تعديلات. عداد «قيد الانتظار» فوق بيقولك كام قسم مستني.
        </Step>
        <Step n={5} title="زرار الرجوع">
          لو عدّت حاجة وندمت، زرار «↺ تراجع» بيرجع القسم لآخر نسخة محفوظة على
          الخادم.
        </Step>
      </GuideSection>

      {/* ===== Orders ===== */}
      <GuideSection
        id="orders"
        icon="📦"
        title="الطلبات"
        subtitle="تابع طلباتك وحدّث حالاتها"
        image="/images/guide/orders.png"
        imageAlt="لقطة شاشة صفحة الطلبات"
        tips={[
          "غيّر حالة الطلب (مؤكد / في الشحن / اتسلم) عشان العميل يعرف طلبه فين.",
          "بيانات العميل وعنوانه وطريقة الدفع كلها في صفحة تفاصيل الطلب.",
        ]}
      >
        <Step n={1} title="قايمة الطلبات">
          كل طلب له رقم وحالة وسعر — مرتبين حسب الأحدث.
        </Step>
        <Step n={2} title="افتح تفاصيل الطلب">
          دوس على أي طلب: هتلاقي المنتجات والكميات والمقاسات والعنوان ورقم التليفون.
        </Step>
        <Step n={3} title="حدّث الحالة">
          خلّي حالة كل طلب محدّثة — العميل بيطمن لما يلاقي طلبه «في الشحن».
        </Step>
      </GuideSection>

      {/* ===== Extras ===== */}
      <GuideSection
        id="extras"
        icon="🧰"
        title="أدوات تانية هتفرق معاك"
        subtitle="مكتبة الصور، الهيدر والفوتر، والإعدادات العامة"
        tips={[
          "أي صورة بتترفع لمرة واحدة وتفضل في المكتبة — استخدمها في أي حتة بعدين.",
          "لما تضيف صور جديدة للمنتج، ربطها باللون الصح عشان العميل يشوف الصورة اللي تمثله.",
        ]}
      >
        <Step n={1} title="مكتبة الوسائط">
          أي مكان فيه «اختر / ارفع صورة» بيفتح المكتبة: ارفع من جهازك أو اختار صورة
          قديمة — كله في مكان واحد.
        </Step>
        <Step n={2} title="الهيدر والقوائم">
          من «Header & Nav» تقدر تظبط لينكات القايمة اللي فوق في الموقع.
        </Step>
        <Step n={3} title="الفوتر والسوشيال">
          من «Footer & Social» حدّث لينكات إنستجرام وتيك توك وفيسبوك وروابط الفوتر.
        </Step>
        <Step n={4} title="الإعدادات العامة">
          العملة، بيانات التواصل، والإعدادات العامة للمتجر — غيّرها بحذر ومرة واحدة.
        </Step>
        <Step n={5} title="اختصارات بتوفر وقت">
          <code>Ctrl+S</code> حفظ سريع في أي فورم • البحث في قايمة الأقسام بيوصّلك في
          ثانية • زرار العين 👁 بيخفي القسم من غير ما تمسحه.
        </Step>
      </GuideSection>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <p>
          خلصنا! لو حصلت مشكلة، راجع القسم الخاص بيها في الدليل ده — والتذكير الأخير:
        </p>
        <p className={styles.footerRule}>
          عدّل ← احفظ المسودة ← راجع ← انشر ← اتفرج على النتيجة 🏜️
        </p>
        <Link href="/admin" className={styles.heroBtnPrimary}>
          رجوع للوحة التحكم
        </Link>
      </footer>
    </div>
  );
}
