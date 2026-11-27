"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function loadInline(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.innerHTML = code;
  document.head.appendChild(s);
}

function loadSrc(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Loads the configured pixels once and reports page views on navigation. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (PIXEL_ID) {
      // Standard Meta bootstrap: creates the fbq queue, loads fbevents.js,
      // then queues init. fbevents.js drains the queue when it lands.
      loadInline(
        "badu-meta-pixel",
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init','${PIXEL_ID}');`
      );
    }
    if (GA_ID) {
      loadSrc("badu-ga4-src", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      loadInline(
        "badu-ga4-init",
        `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.fbq?.("track", "PageView");
      window.gtag?.("event", "page_view", { page_path: pathname });
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
