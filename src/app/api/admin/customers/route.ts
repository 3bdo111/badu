import { NextResponse, type NextRequest } from "next/server";
import { serverCustomerRepository } from "@/lib/repositories/server-customer-repository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const city = searchParams.get("city") || undefined;

    const customers = await serverCustomerRepository.getAllCustomers(query, city);

    // Compute summary metrics for CRM header
    const totalCustomers = customers.length;
    const vipCount = customers.filter((c) => c.customerTier === "VIP").length;
    const returningCount = customers.filter((c) => c.customerTier === "RETURNING").length;
    const newCount = customers.filter((c) => c.customerTier === "NEW").length;
    const totalCrmRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return NextResponse.json({
      success: true,
      customers,
      metrics: {
        totalCustomers,
        vipCount,
        returningCount,
        newCount,
        totalCrmRevenue,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/admin/customers GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRM customer profiles" },
      { status: 500 }
    );
  }
}
