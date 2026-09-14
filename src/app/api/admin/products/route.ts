import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await serverProductRepository.getAll();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    // Server-side validation
    if (!body.translations?.en?.name || !body.translations?.ar?.name) {
      return NextResponse.json({ error: "Product name in both English and Arabic is required" }, { status: 400 });
    }

    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }

    // Validate colors HEX format if provided
    if (Array.isArray(body.colors)) {
      for (const col of body.colors) {
        if (col.hex && !HEX_COLOR_REGEX.test(col.hex)) {
          return NextResponse.json({ error: `Invalid HEX color format: ${col.hex}` }, { status: 400 });
        }
      }
    }

    const created = await serverProductRepository.create(body);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
