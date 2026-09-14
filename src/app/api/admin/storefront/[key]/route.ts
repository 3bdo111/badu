import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const { key } = await params;
    const body = await request.json();

    const updated = serverStorefrontRepository.updateSection(key, body);
    if (!updated) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    if (body.status === "PUBLISHED") {
      revalidatePath("/");
      revalidatePath("/store");
    }

    return NextResponse.json({ success: true, section: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update storefront section." }, { status: 500 });
  }
}
