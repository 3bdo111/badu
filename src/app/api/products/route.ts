import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    if (includeAll) {
      const admin = await verifyAdminSession();
      if (!admin) {
        // Unauthenticated request asking for hidden items -> return only visible items
        const visible = serverProductRepository.getVisible();
        return NextResponse.json(visible);
      }
      const all = serverProductRepository.getAll();
      return NextResponse.json(all);
    }

    const visible = serverProductRepository.getVisible();
    return NextResponse.json(visible);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: {
            en: "Admin authentication required.",
            ar: "يلزم تسجيل الدخول كمسؤول.",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const created = serverProductRepository.create(body);

    revalidatePath("/store");
    revalidatePath("/");
    if (created.slug) {
      revalidatePath(`/products/${created.slug}`);
    }

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
