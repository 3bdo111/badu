import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product =
      (await serverProductRepository.getById(id)) ||
      (await serverProductRepository.getBySlug(id));

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (!product.available) {
      const admin = await verifyAdminSession();
      if (!admin) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error retrieving product." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await serverProductRepository.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidatePath("/store");
    revalidatePath("/");
    if (updated.slug) {
      revalidatePath(`/products/${updated.slug}`);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await serverProductRepository.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidatePath("/store");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
