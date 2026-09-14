import { NextResponse } from "next/server";
import crypto from "crypto";
import { serverOrderRepository, type OrderCustomerInfo, type OrderItemInput } from "@/lib/repositories/server-order-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

// Server-side in-memory idempotency cache (60 seconds expiry)
interface CachedOrderResponse {
  orderNumber: string;
  orderId: string;
  accessKey: string;
  timestamp: number;
}
const idempotencyCache = new Map<string, CachedOrderResponse>();

function cleanStaleIdempotencyCache() {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > 60000) {
      idempotencyCache.delete(key);
    }
  }
}

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const status = searchParams.get("status") || undefined;

    const orders = serverOrderRepository.getOrders(query, status);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    cleanStaleIdempotencyCache();

    const body = await request.json();
    const { customer, items, idempotencyKey } = body || {};

    const headerKey = request.headers.get("x-idempotency-key");
    const rawKey = (headerKey || idempotencyKey || "").trim();

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid payload.",
          message: {
            en: "Customer details and items are required.",
            ar: "بيانات العميل والعناصر مطلوبة.",
          },
        },
        { status: 400 }
      );
    }

    // Customer field validation & sanitization
    const { name, phone, address, city, country, email, notes } = customer as Partial<OrderCustomerInfo>;

    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").trim();
    const cleanAddress = (address || "").trim();
    const cleanCity = (city || "").trim();
    const cleanCountry = (country || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanNotes = (notes || "").trim();

    if (!cleanName || !cleanPhone || !cleanAddress || !cleanCity || !cleanCountry) {
      return NextResponse.json(
        {
          error: "Missing required customer fields.",
          message: {
            en: "Please fill in all required customer fields.",
            ar: "يرجى ملء جميع الحقول المطلوبة للعميل.",
          },
        },
        { status: 400 }
      );
    }

    // Max length & format checks
    if (
      cleanName.length > 100 ||
      cleanPhone.length < 6 ||
      cleanPhone.length > 25 ||
      cleanAddress.length > 250 ||
      cleanCity.length > 100 ||
      cleanCountry.length > 100 ||
      cleanNotes.length > 500
    ) {
      return NextResponse.json(
        {
          error: "Customer field exceeds max allowed length or invalid phone format.",
          message: {
            en: "Please check your entry lengths and phone number.",
            ar: "يرجى التحقق من طول البيانات المدخلة ورقم الهاتف.",
          },
        },
        { status: 400 }
      );
    }

    if (cleanEmail && (!cleanEmail.includes("@") || cleanEmail.length > 100)) {
      return NextResponse.json(
        {
          error: "Invalid email format.",
          message: {
            en: "Please enter a valid email address.",
            ar: "يرجى إدخال بريد إلكتروني صحيح.",
          },
        },
        { status: 400 }
      );
    }

    const cleanCustomer: OrderCustomerInfo = {
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      address: cleanAddress,
      city: cleanCity,
      country: cleanCountry,
      notes: cleanNotes,
    };

    const cleanItems: OrderItemInput[] = items.map((i: Partial<OrderItemInput>) => ({
      productId: String(i.productId || "").trim(),
      size: String(i.size || "").trim(),
      quantity: Math.max(1, Math.min(100, Number(i.quantity || 1))),
    }));

    // Server-side idempotency key check
    const payloadFingerprint = rawKey || crypto.createHash("md5").update(
      JSON.stringify({ phone: cleanPhone, address: cleanAddress, items: cleanItems })
    ).digest("hex");

    const cached = idempotencyCache.get(payloadFingerprint);
    if (cached && Date.now() - cached.timestamp < 60000) {
      const res = NextResponse.json(
        {
          success: true,
          orderNumber: cached.orderNumber,
          orderId: cached.orderId,
          accessKey: cached.accessKey,
        },
        { status: 200 }
      );

      res.cookies.set(`badu_order_access_${cached.orderNumber}`, cached.accessKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 7,
      });

      return res;
    }

    const order = serverOrderRepository.createOrder(cleanCustomer, cleanItems);
    const accessKey = crypto.randomBytes(16).toString("hex");

    idempotencyCache.set(payloadFingerprint, {
      orderNumber: order.orderNumber,
      orderId: order.id,
      accessKey,
      timestamp: Date.now(),
    });

    const response = NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        accessKey,
      },
      { status: 201 }
    );

    // Set secure cookie for confirmation authorization
    response.cookies.set(`badu_order_access_${order.orderNumber}`, accessKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7,
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to place order.";
    return NextResponse.json(
      {
        error: "Order creation failed.",
        message: {
          en: errorMsg,
          ar: "تعذر إتمام الطلب. يرجى المراجعة والمحاولة مرة أخرى.",
        },
      },
      { status: 400 }
    );
  }
}
