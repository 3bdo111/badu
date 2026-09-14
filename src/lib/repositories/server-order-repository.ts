import crypto from "crypto";
import { db } from "@/lib/db/db";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  notes?: string;
}

export interface OrderItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productNameEn: string;
  productNameAr: string;
  size: string;
  colorNameEn: string;
  colorNameAr: string;
  quantity: number;
  pricePerUnit: number;
  lineTotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "PAID";
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  country: string;
  notes: string;
  stockRestored: boolean;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}

interface DbOrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal_amount: number;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  city: string;
  country: string;
  notes: string | null;
  stock_restored: number;
  created_at: string;
  updated_at: string;
}

interface DbOrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name_en: string;
  product_name_ar: string;
  size: string;
  color_name_en: string;
  color_name_ar: string;
  quantity: number;
  price_per_unit: number;
  line_total: number;
}

function mapOrderRows(order: DbOrderRow, items: DbOrderItemRow[]): OrderRecord {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as OrderStatus,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: order.payment_status as "PENDING" | "PAID",
    subtotalAmount: order.subtotal_amount,
    totalAmount: order.total_amount,
    currency: order.currency,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email || "",
    shippingAddress: order.shipping_address,
    city: order.city,
    country: order.country,
    notes: order.notes || "",
    stockRestored: Boolean(order.stock_restored),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productNameEn: item.product_name_en,
      productNameAr: item.product_name_ar,
      size: item.size,
      colorNameEn: item.color_name_en,
      colorNameAr: item.color_name_ar,
      quantity: item.quantity,
      pricePerUnit: item.price_per_unit,
      lineTotal: item.line_total,
    })),
  };
}

export class OrderTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid order status transition from ${from} to ${to}.`);
    this.name = "OrderTransitionError";
  }
}

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const serverOrderRepository = {
  createOrder(customer: OrderCustomerInfo, cartItems: OrderItemInput[]): OrderRecord {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cannot place an order with an empty cart.");
    }

    const orderId = `ord-${crypto.randomUUID()}`;
    const orderNumber = `BADU-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, status, payment_method, payment_status,
        subtotal_amount, total_amount, currency, customer_name, customer_phone,
        customer_email, shipping_address, city, country, notes, stock_restored,
        created_at, updated_at
      ) VALUES (
        ?, ?, 'PENDING', 'CASH_ON_DELIVERY', 'PENDING',
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, 0,
        ?, ?
      )
    `);

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name_en, product_name_ar,
        size, color_name_en, color_name_ar, quantity, price_per_unit, line_total
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    const updateStockStmt = db.prepare(`
      UPDATE product_stock
      SET quantity = quantity - ?
      WHERE product_id = ? AND size = ? AND quantity >= ?
    `);

    let subtotal = 0;
    let currency = "USD";
    const preparedItems: DbOrderItemRow[] = [];

    const orderTransaction = db.transaction(() => {
      // 1. Revalidate products, stock, and calculate line totals
      for (const item of cartItems) {
        const product = db
          .prepare("SELECT * FROM products WHERE (id = ? OR slug = ?) AND available = 1")
          .get(item.productId, item.productId) as {
            id: string;
            price: number;
            currency: string;
            name_en: string;
            name_ar: string;
          } | undefined;

        if (!product) {
          throw new Error(`Product is no longer available.`);
        }

        const stockRow = db
          .prepare("SELECT quantity FROM product_stock WHERE product_id = ? AND size = ?")
          .get(product.id, item.size) as { quantity: number } | undefined;

        const currentStock = stockRow ? stockRow.quantity : 0;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for size ${item.size}. Only ${currentStock} available.`);
        }

        const colorRow = db
          .prepare("SELECT name_en, name_ar FROM product_colors WHERE product_id = ? LIMIT 1")
          .get(product.id) as { name_en: string; name_ar: string } | undefined;

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        currency = product.currency || "USD";

        // Deduct stock atomically
        const stockResult = updateStockStmt.run(item.quantity, product.id, item.size, item.quantity);
        if (stockResult.changes === 0) {
          throw new Error(`Failed to reserve stock for size ${item.size}. Please try again.`);
        }

        preparedItems.push({
          id: `item-${crypto.randomUUID()}`,
          order_id: orderId,
          product_id: product.id,
          product_name_en: product.name_en,
          product_name_ar: product.name_ar,
          size: item.size,
          color_name_en: colorRow?.name_en || "Desert Sand",
          color_name_ar: colorRow?.name_ar || "رمال الصحراء",
          quantity: item.quantity,
          price_per_unit: product.price,
          line_total: lineTotal,
        });
      }

      // 2. Insert main order record
      insertOrderStmt.run(
        orderId,
        orderNumber,
        subtotal,
        subtotal, // Total = Subtotal for Cash on Delivery
        currency,
        customer.name.trim(),
        customer.phone.trim(),
        customer.email?.trim() || "",
        customer.address.trim(),
        customer.city.trim(),
        customer.country.trim(),
        customer.notes?.trim() || "",
        now,
        now
      );

      // 3. Insert order items
      for (const itemRecord of preparedItems) {
        insertItemStmt.run(
          itemRecord.id,
          itemRecord.order_id,
          itemRecord.product_id,
          itemRecord.product_name_en,
          itemRecord.product_name_ar,
          itemRecord.size,
          itemRecord.color_name_en,
          itemRecord.color_name_ar,
          itemRecord.quantity,
          itemRecord.price_per_unit,
          itemRecord.line_total
        );
      }
    });

    orderTransaction();

    return this.getOrderByNumber(orderNumber)!;
  },

  getOrders(query?: string, statusFilter?: string): OrderRecord[] {
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params: unknown[] = [];

    if (statusFilter && statusFilter !== "ALL") {
      sql += " AND status = ?";
      params.push(statusFilter);
    }

    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      sql += " AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
      params.push(q, q, q);
    }

    sql += " ORDER BY created_at DESC";

    const orders = db.prepare(sql).all(...params) as DbOrderRow[];
    const allItems = db.prepare("SELECT * FROM order_items").all() as DbOrderItemRow[];

    return orders.map((ord) => {
      const items = allItems.filter((item) => item.order_id === ord.id);
      return mapOrderRows(ord, items);
    });
  },

  getOrderById(id: string): OrderRecord | undefined {
    const ord = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as DbOrderRow | undefined;
    if (!ord) return undefined;

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id) as DbOrderItemRow[];
    return mapOrderRows(ord, items);
  },

  getOrderByNumber(orderNumber: string): OrderRecord | undefined {
    const ord = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(orderNumber) as DbOrderRow | undefined;
    if (!ord) return undefined;

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(ord.id) as DbOrderItemRow[];
    return mapOrderRows(ord, items);
  },

  updateOrderStatus(id: string, newStatus: OrderStatus): OrderRecord | undefined {
    const ord = this.getOrderById(id);
    if (!ord) return undefined;

    // Idempotent same-status update
    if (ord.status === newStatus) return ord;

    // State machine transition validation
    const allowed = ALLOWED_ORDER_TRANSITIONS[ord.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new OrderTransitionError(ord.status, newStatus);
    }

    const now = new Date().toISOString();

    const updateTransaction = db.transaction(() => {
      // Idempotent stock restoration on cancellation
      if (newStatus === "CANCELLED" && !ord.stockRestored) {
        for (const item of ord.items) {
          db.prepare(`
            UPDATE product_stock
            SET quantity = quantity + ?
            WHERE product_id = ? AND size = ?
          `).run(item.quantity, item.productId, item.size);
        }
        db.prepare("UPDATE orders SET stock_restored = 1 WHERE id = ?").run(id);
      }

      // If status changes to DELIVERED, set paymentStatus to PAID for COD
      const paymentStatus = newStatus === "DELIVERED" ? "PAID" : ord.paymentStatus;

      db.prepare(`
        UPDATE orders
        SET status = ?, payment_status = ?, updated_at = ?
        WHERE id = ?
      `).run(newStatus, paymentStatus, now, id);
    });

    updateTransaction();
    return this.getOrderById(id);
  },
};
