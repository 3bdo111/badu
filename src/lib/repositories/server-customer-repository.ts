import { getDb } from "@/lib/db/db";
import { serverOrderRepository, type OrderRecord } from "./server-order-repository";

export interface CustomerProfileRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  currency: string;
  customerTier: "VIP" | "RETURNING" | "NEW";
  lastOrderAt: string;
  firstOrderAt: string;
  orders: OrderRecord[];
}

export const serverCustomerRepository = {
  async getAllCustomers(query?: string, cityFilter?: string): Promise<CustomerProfileRecord[]> {
    const allOrders = await serverOrderRepository.getOrders();
    
    // Group orders by customer phone number
    const customerMap = new Map<string, OrderRecord[]>();
    for (const ord of allOrders) {
      const key = ord.customerPhone.trim() || ord.customerEmail.trim() || ord.id;
      if (!customerMap.has(key)) {
        customerMap.set(key, []);
      }
      customerMap.get(key)!.push(ord);
    }

    const profiles: CustomerProfileRecord[] = [];

    for (const [key, orders] of customerMap.entries()) {
      // Sort orders descending by created_at
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const latestOrder = orders[0];
      const oldestOrder = orders[orders.length - 1];
      
      // Calculate total spent on non-cancelled orders
      const validOrders = orders.filter((o) => o.status !== "CANCELLED");
      const totalSpent = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const ordersCount = orders.length;

      let customerTier: "VIP" | "RETURNING" | "NEW" = "NEW";
      if (ordersCount >= 3 || totalSpent > 3000) {
        customerTier = "VIP";
      } else if (ordersCount >= 2) {
        customerTier = "RETURNING";
      }

      const profile: CustomerProfileRecord = {
        id: `cust-${key.replace(/\s+/g, "")}`,
        name: latestOrder.customerName,
        phone: latestOrder.customerPhone,
        email: latestOrder.customerEmail,
        city: latestOrder.city,
        address: latestOrder.shippingAddress,
        ordersCount,
        totalSpent,
        currency: latestOrder.currency || "EGP",
        customerTier,
        lastOrderAt: latestOrder.createdAt,
        firstOrderAt: oldestOrder.createdAt,
        orders,
      };

      // Filter by search query
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        const matchesName = profile.name.toLowerCase().includes(q);
        const matchesPhone = profile.phone.toLowerCase().includes(q);
        const matchesCity = profile.city.toLowerCase().includes(q);
        const matchesEmail = profile.email.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCity && !matchesEmail) {
          continue;
        }
      }

      // Filter by city
      if (cityFilter && cityFilter !== "ALL") {
        if (profile.city.toLowerCase() !== cityFilter.toLowerCase()) {
          continue;
        }
      }

      profiles.push(profile);
    }

    // Sort by last order timestamp descending
    return profiles.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
  },

  async getCustomerByPhone(phone: string): Promise<CustomerProfileRecord | undefined> {
    const customers = await this.getAllCustomers();
    return customers.find((c) => c.phone.trim() === phone.trim());
  },
};
