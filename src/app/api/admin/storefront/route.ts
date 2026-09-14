import { NextResponse } from "next/server";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const sections = serverStorefrontRepository.getAllSections();
    return NextResponse.json(sections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch admin storefront sections." }, { status: 500 });
  }
}
