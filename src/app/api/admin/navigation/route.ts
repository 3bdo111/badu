import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { serverSettingsRepository } from "@/lib/repositories/server-settings-repository";
import type { NavigationItem } from "@/lib/types/cms";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await serverSettingsRepository.getNavigationItems(true);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/admin/navigation error:", error);
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
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "Expected an array of navigation items" }, { status: 400 });
    }

    // Validate navigation items
    const items: NavigationItem[] = body.items.map((item: { id?: string; label?: { en?: string; ar?: string }; url?: string; sortOrder?: number; visible?: boolean; isExternal?: boolean; targetBlank?: boolean }, idx: number) => ({
      id: String(item.id || `nav-${Date.now()}-${idx}`),
      label: {
        en: String(item.label?.en || ""),
        ar: String(item.label?.ar || item.label?.en || ""),
      },
      url: String(item.url || "/"),
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
      visible: Boolean(item.visible !== false),
      isExternal: Boolean(item.isExternal),
      targetBlank: Boolean(item.targetBlank),
    }));

    const saved = await serverSettingsRepository.saveNavigationItems(items);
    return NextResponse.json({ items: saved });
  } catch (error) {
    console.error("PUT /api/admin/navigation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
