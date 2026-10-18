export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5000";

export const ENDPOINTS = {
  stats: "/api/admin/stats",
  products: "/api/admin/products",
  categories: "/api/admin/categories",
  orders: "/api/admin/orders",
  customers: "/api/admin/customers",
  // Public single-product route (also returns hidden products).
  product: (id: string) => `/api/products/${id}`,
  orderStatus: (id: string) => `/api/admin/orders/${id}/status`,
};
