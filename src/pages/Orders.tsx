import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Header from "../components/Header";
import Select from "../components/Select";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useApi } from "../hooks/useApi";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import { mapOrder, ORDER_STATUSES, type ApiOrder, type OrderStatus } from "../api/mappers";

type Order = ReturnType<typeof mapOrder>;

const controlStyle = {
  fontFamily: FONTS.body,
  color: COLORS.text,
  backgroundColor: COLORS.cardWarm,
  border: `1px solid ${COLORS.border}`,
};

const LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Orders() {
  const api = useApi();
  const { data, loading, error, refetch } = useQuery<ApiOrder[]>(ENDPOINTS.orders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const allOrders = useMemo(() => (data ?? []).map(mapOrder), [data]);

  const orders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (statusFilter !== "all" && o.orderStatus !== statusFilter) return false;
      if (q && !o.number.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allOrders, search, statusFilter]);

  const changeStatus = async (order: Order, next: OrderStatus) => {
    if (next === order.orderStatus) return;
    setActionError(null);
    setUpdatingId(order.id);
    try {
      await api.patch(ENDPOINTS.orderStatus(order.id), { orderStatus: next });
      refetch();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<Order>[] = useMemo(
    () => [
      { key: "number", header: "Order", ticket: true },
      { key: "customer", header: "Customer" },
      { key: "items", header: "Items", align: "right" },
      { key: "date", header: "Date" },
      { key: "total", header: "Total", align: "right" },
      { key: "status", header: "Status", render: (row) => <StatusBadge label={row.statusLabel} status={row.status} /> },
      {
        key: "update",
        header: "Update status",
        render: (row) => {
          const locked = row.orderStatus === "cancelled";
          const shippedOrDone = row.orderStatus === "shipped" || row.orderStatus === "delivered";
          return (
            <Select
              size="sm"
              value={row.orderStatus}
              disabled={locked || updatingId === row.id}
              onChange={(v) => changeStatus(row, v as OrderStatus)}
              ariaLabel={`Update status for order ${row.number}`}
              title={locked ? "Cancelled orders can't be changed" : undefined}
              options={ORDER_STATUSES.map((s) => ({
                value: s,
                label: LABELS[s],
                disabled: s === "cancelled" && shippedOrDone,
              }))}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatingId]
  );

  return (
    <>
      <Header title="Orders" subtitle={loading ? "Loading…" : `${orders.length} of ${allOrders.length} orders shown.`} />

      <div className="px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} style={{ color: COLORS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order or customer"
              aria-label="Search orders"
              style={controlStyle}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg text-sm outline-none"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as "all" | OrderStatus)}
            ariaLabel="Filter by status"
            options={[{ value: "all", label: "All statuses" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: LABELS[s] }))]}
          />
        </div>

        {(error || actionError) && (
          <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error ?? actionError}</p>
        )}
        <DataTable
          columns={columns}
          data={orders}
          keyField="id"
          emptyLabel={loading ? "Loading orders…" : allOrders.length === 0 ? "No orders yet." : "No orders match these filters."}
        />
      </div>
    </>
  );
}
