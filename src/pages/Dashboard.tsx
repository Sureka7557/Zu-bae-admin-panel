import { useMemo } from "react";
import { IndianRupee, ShoppingBag, Package, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import { mapOrder, type ApiStats } from "../api/mappers";
import { formatINR } from "../lib/format";

type Order = ReturnType<typeof mapOrder>;

const orderColumns: Column<Order>[] = [
  { key: "number", header: "Order", ticket: true },
  { key: "customer", header: "Customer" },
  { key: "date", header: "Date" },
  { key: "total", header: "Total", align: "right" },
  { key: "status", header: "Status", render: (row) => <StatusBadge label={row.statusLabel} status={row.status} /> },
];

export default function Dashboard() {
  const { data, loading, error } = useQuery<ApiStats>(ENDPOINTS.stats);
  const recent = useMemo(() => (data?.recentOrders ?? []).map(mapOrder), [data]);

  const stats = [
    {
      label: "Revenue (30 days)",
      value: data ? formatINR(data.revenue30d) : "—",
      delta: data?.deltas.revenue,
      icon: IndianRupee,
    },
    {
      label: "Orders (30 days)",
      value: data ? data.orders30d.toLocaleString("en-IN") : "—",
      delta: data?.deltas.orders,
      icon: ShoppingBag,
    },
    {
      label: "Products",
      value: data ? data.totalProducts.toLocaleString("en-IN") : "—",
      icon: Package,
    },
    {
      label: "Customers",
      value: data ? data.totalUsers.toLocaleString("en-IN") : "—",
      delta: data?.deltas.customers,
      icon: Users,
      hint: "new vs previous 30 days",
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back. Here's what's happening in your store." />
      <div className="px-8 py-6 space-y-8">
        {error && <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error}</p>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              delta={s.delta}
              icon={s.icon}
              hint={s.hint ?? "vs previous 30 days"}
            />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.text }} className="text-base font-semibold">
              Recent orders
            </h2>
            <Link
              to="/orders"
              style={{ fontFamily: FONTS.bodyMedium, color: COLORS.primary }}
              className="text-xs font-medium hover:underline"
            >
              View all orders
            </Link>
          </div>
          <DataTable
            columns={orderColumns}
            data={recent}
            keyField="id"
            emptyLabel={loading ? "Loading orders…" : "No orders yet."}
          />
        </div>
      </div>
    </>
  );
}
