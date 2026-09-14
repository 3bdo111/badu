import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth/admin-auth";

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

    const user = await verifyCredentials(email, password);
    if (!user) {
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
