import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifyAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
