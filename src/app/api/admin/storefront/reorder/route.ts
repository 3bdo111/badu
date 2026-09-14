import { NextResponse } from "next/server";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { keysOrder } = body || {};

    if (!Array.isArray(keysOrder) || keysOrder.length === 0) {
      return NextResponse.json({ error: "Invalid section keys order payload." }, { status: 400 });
    }

    const reordered = await serverStorefrontRepository.reorderSections(keysOrder);
    return NextResponse.json({ success: true, sections: reordered });
  } catch {
    return NextResponse.json({ error: "Failed to reorder storefront sections." }, { status: 500 });
  }
}
