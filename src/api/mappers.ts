import type { BadgeStatus } from "../components/StatusBadge";
import { formatDate, formatINR } from "../lib/format";

/* ------------------------------------------------------------------ */
/* Constants that mirror the server's Mongoose enums                   */
/* ------------------------------------------------------------------ */

export const PRODUCT_CATEGORIES = ["Men", "Women", "Kids", "Shoes", "Bags", "Other"] as const;

export const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* API shapes                                                          */
/* ------------------------------------------------------------------ */

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ApiCategory {
  name: string;
  productCount: number;
}

export interface ApiOrder {
  _id: string;
  orderNumber?: string;
  user?: { _id: string; name?: string; email?: string } | null;
  items: { name?: string; quantity: number; price: number }[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface ApiCustomer {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface ApiStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenue30d: number;
  orders30d: number;
  deltas: { revenue: number; orders: number; customers: number };
  recentOrders: ApiOrder[];
}

/* ------------------------------------------------------------------ */
/* Mappers (API -> what the tables render)                             */
/* ------------------------------------------------------------------ */

export type StockState = "in" | "low" | "out" | "hidden";

export function mapProduct(p: ApiProduct) {
  let state: StockState = "in";
  let status: BadgeStatus = "success";
  let statusLabel = "In stock";

  if (!p.isActive) {
    state = "hidden";
    status = "neutral";
    statusLabel = "Hidden";
  } else if (p.stock <= 0) {
    state = "out";
    status = "danger";
    statusLabel = "Out of stock";
  } else if (p.stock <= 5) {
    state = "low";
    status = "warning";
    statusLabel = "Low stock";
  }

  return {
    id: p._id,
    sku: `ZB-${p._id.slice(-6).toUpperCase()}`,
    name: p.name,
    category: p.category,
    price: formatINR(p.price),
    stock: p.stock,
    image: p.images?.[0] as string | undefined,
    isActive: p.isActive,
    state,
    status,
    statusLabel,
  };
}

const ORDER_BADGE: Record<OrderStatus, { status: BadgeStatus; label: string }> = {
  placed: { status: "warning", label: "Placed" },
  processing: { status: "warning", label: "Processing" },
  shipped: { status: "neutral", label: "Shipped" },
  delivered: { status: "success", label: "Delivered" },
  cancelled: { status: "danger", label: "Cancelled" },
};

export function mapOrder(o: ApiOrder) {
  const badge = ORDER_BADGE[o.orderStatus] ?? { status: "neutral" as BadgeStatus, label: String(o.orderStatus) };

  return {
    id: o._id,
    number: o.orderNumber ?? `#${o._id.slice(-6).toUpperCase()}`,
    customer: o.user?.name || o.user?.email || "Guest",
    items: (o.items ?? []).reduce((n, i) => n + i.quantity, 0),
    date: formatDate(o.createdAt),
    total: formatINR(o.totalAmount),
    orderStatus: o.orderStatus,
    status: badge.status,
    statusLabel: badge.label,
  };
}

export function mapCustomer(c: ApiCustomer) {
  return {
    id: c._id,
    name: c.name?.trim() || c.email || "Unnamed",
    email: c.email ?? "—",
    image: c.image,
    orders: c.ordersCount,
    spent: formatINR(c.totalSpent),
    joined: formatDate(c.createdAt),
  };
}
