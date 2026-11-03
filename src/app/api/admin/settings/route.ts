import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { serverSettingsRepository } from "@/lib/repositories/server-settings-repository";

/** E.164-style: optional leading "+", then 7-15 digits. Spaces/dashes tolerated on input. */
const WHATSAPP_REGEX = /^\+?[0-9][0-9\s\-()]{5,18}$/;

function sanitizeWhatsappNumber(raw: unknown): string | null {
  if (raw === undefined) return ""; // not provided — keep unchanged
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (cleaned === "") return "";
  if (!WHATSAPP_REGEX.test(cleaned)) return null;
  return cleaned.replace(/[\s\-()]/g, "");
}

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await serverSettingsRepository.getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Validate WhatsApp number before persisting
    if ("whatsappNumber" in body) {
      const sanitized = sanitizeWhatsappNumber(body.whatsappNumber);
      if (sanitized === null) {
        return NextResponse.json(
          { error: "Invalid WhatsApp number. Use international format, e.g. +201001234567." },
          { status: 400 }
        );
      }
      body.whatsappNumber = sanitized;
    }

    const updated = await serverSettingsRepository.updateSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
