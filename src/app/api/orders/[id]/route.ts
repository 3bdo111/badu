import { NextResponse } from "next/server";
import { serverOrderRepository, OrderTransitionError, type OrderStatus } from "@/lib/repositories/server-order-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const order = serverOrderRepository.getOrderById(id) || serverOrderRepository.getOrderByNumber(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Error retrieving order." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body || {};

    const allowedStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!status || typeof status !== "string" || !allowedStatuses.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid or unsupported order status value." }, { status: 400 });
    }

    const updated = serverOrderRepository.updateOrderStatus(id, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    if (err instanceof OrderTransitionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
