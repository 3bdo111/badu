import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function POST() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const publishedSections = serverStorefrontRepository.publishAllSections();
    revalidatePath("/");
    revalidatePath("/store");

    return NextResponse.json({
      success: true,
      message: {
        en: "All storefront draft changes published successfully!",
        ar: "تم نشر جميع تغييرات الواجهة بنجاح!",
      },
      sections: publishedSections,
    });
  } catch {
    return NextResponse.json({ error: "Failed to publish storefront sections." }, { status: 500 });
  }
}
