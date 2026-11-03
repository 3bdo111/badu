import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth/admin-auth";

/**
 * In-memory brute-force throttle: max 5 failed attempts per email+IP within
 * 10 minutes, then 429. Resets on success. Process-local — adequate for a
 * single-instance deployment; put a WAF/proxy rate limit in front for
 * multi-instance/serverless production.
 */
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function throttleKey(request: Request, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "local";
  return `${ip}|${email.trim().toLowerCase()}`;
}

function isThrottled(key: string): boolean {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(key: string): void {
  const record = attempts.get(key);
  if (!record || Date.now() - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
  } else {
    record.count += 1;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: {
            en: "Email and password are required.",
            ar: "البريد الإلكتروني وكلمة المرور مطلوبان.",
          },
        },
        { status: 400 }
      );
    }

    const key = throttleKey(request, email);

    if (isThrottled(key)) {
      return NextResponse.json(
        {
          success: false,
          message: {
            en: "Too many failed attempts. Try again in a few minutes.",
            ar: "عدد محاولات كبير من الفاشلة. حاول مرة أخرى بعد بضع دقائق.",
          },
        },
        { status: 429 }
      );
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      recordFailure(key);
      return NextResponse.json(
        {
          success: false,
          message: {
            en: "Invalid admin email or password.",
            ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          },
        },
        { status: 401 }
      );
    }

    attempts.delete(key);
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("[admin/auth/login] Error during login:", err);
    return NextResponse.json(
      {
        success: false,
        message: {
          en: "An error occurred during authentication.",
          ar: "حدث خطأ أثناء المصادقة.",
        },
      },
      { status: 500 }
    );
  }
}
