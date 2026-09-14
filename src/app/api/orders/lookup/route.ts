import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverOrderRepository } from "@/lib/repositories/server-order-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("number");

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json({ error: "Order number required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessCookie = cookieStore.get(`badu_order_access_${orderNumber}`)?.value;
    const adminSession = await verifyAdminSession();

    if (!accessCookie && !adminSession) {
      return NextResponse.json({ error: "Unauthorized access to order details." }, { status: 403 });
    }

    const order = await serverOrderRepository.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to lookup order." }, { status: 500 });
  }
}
