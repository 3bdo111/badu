import { NextResponse } from "next/server";
import { serverSettingsRepository } from "@/lib/repositories/server-settings-repository";

/**
 * Public storefront settings — exposes ONLY what the customer-facing UI
 * needs (WhatsApp ordering number, display currency, brand name).
 * Never leak admin-only or sensitive settings here.
 */
export async function GET() {
  try {
    const settings = await serverSettingsRepository.getSettings();
    return NextResponse.json({
      whatsappNumber: settings.whatsappNumber || "",
      currency: settings.currency || "USD",
      brandName: settings.brandName || "BADU",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch storefront settings." },
      { status: 500 }
    );
  }
}
