import { NextResponse } from "next/server";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";

export async function GET() {
  try {
    const sections = await serverStorefrontRepository.getPublicSections();
    return NextResponse.json(sections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch storefront sections." }, { status: 500 });
  }
}
