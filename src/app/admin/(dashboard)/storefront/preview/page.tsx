import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { serverStorefrontRepository } from "@/lib/repositories/server-storefront-repository";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { VisualEditorClient } from "@/components/admin/cms/VisualEditorClient";

export default async function VisualEditorPage() {
  const admin = await verifyAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const draftSections = await serverStorefrontRepository.getDraftSections();
  const products = await serverProductRepository.getAll();

  return <VisualEditorClient initialSections={draftSections} products={products} />;
}
