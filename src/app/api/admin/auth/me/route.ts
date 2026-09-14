import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  const user = await verifyAdminSession();
  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }
  return NextResponse.json({ authenticated: true, user });
}
