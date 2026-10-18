import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, ImageOff } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Select from "../components/Select";
import DataTable, { type Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useApi } from "../hooks/useApi";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import { mapProduct, PRODUCT_CATEGORIES, type ApiProduct } from "../api/mappers";

type Product = ReturnType<typeof mapProduct>;

const controlStyle = {
  fontFamily: FONTS.body,
  color: COLORS.text,
  backgroundColor: COLORS.cardWarm,
  border: `1px solid ${COLORS.border}`,
};

export default function Products() {
  const api = useApi();
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(ENDPOINTS.products);
  const [params, setParams] = useSearchParams();

  const category = params.get("category") ?? "all";
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const products = useMemo(() => (data ?? []).map(mapProduct), [data]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (stateFilter !== "all" && p.state !== stateFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, category, stateFilter]);

  const setCategory = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("category");
    else next.set("category", value);
    setParams(next, { replace: true });
  };

  const toggleVisibility = async (p: Product) => {
    setActionError(null);
    setBusyId(p.id);
    try {
      await api.put(`${ENDPOINTS.products}/${p.id}`, { isActive: !p.isActive });
      refetch();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setActionError(null);
    setBusyId(toDelete.id);
    try {
      await api.del(`${ENDPOINTS.products}/${toDelete.id}`);
      setToDelete(null);
      refetch();
    } catch (e) {
      setActionError((e as Error).message);
      setToDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<Product>[] = useMemo(
    () => [
      { key: "sku", header: "ID", ticket: true },
      {
        key: "name",
        header: "Product",
        render: (row) => (
          <div className="flex items-center gap-3 min-w-[200px]">
            {row.image ? (
              <img src={row.image} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div
                style={{ backgroundColor: COLORS.cardWarm }}
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              >
                <ImageOff size={16} color={COLORS.textMuted} strokeWidth={1.5} />
              </div>
            )}
            <span style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }} className="font-medium">
              {row.name}
            </span>
          </div>
        ),
      },
      { key: "category", header: "Category" },
      { key: "price", header: "Price", align: "right" },
      { key: "stock", header: "Stock", align: "right" },
      { key: "status", header: "Status", render: (row) => <StatusBadge label={row.statusLabel} status={row.status} /> },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              to={`/products/${row.id}/edit`}
              aria-label={`Edit ${row.name}`}
              title="Edit"
              style={{ color: COLORS.textSecondary }}
              className="p-1.5 rounded-md transition-colors hover:bg-[rgba(32,16,15,0.05)]"
            >
              <Pencil size={15} strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              disabled={busyId === row.id}
              onClick={() => toggleVisibility(row)}
              aria-label={row.isActive ? `Hide ${row.name}` : `Show ${row.name}`}
              title={row.isActive ? "Hide from store" : "Show in store"}
              style={{ color: COLORS.textSecondary }}
              className="p-1.5 rounded-md cursor-pointer transition-colors hover:bg-[rgba(32,16,15,0.05)] disabled:opacity-50"
            >
              {row.isActive ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
            </button>
            <button
              type="button"
              disabled={busyId === row.id}
              onClick={() => setToDelete(row)}
              aria-label={`Delete ${row.name}`}
              title="Delete"
              style={{ color: COLORS.danger }}
              className="p-1.5 rounded-md cursor-pointer transition-colors hover:bg-[rgba(161,61,61,0.08)] disabled:opacity-50"
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busyId]
  );

  return (
    <>
      <Header
        title="Products"
        subtitle={
          loading
            ? "Loading…"
            : `${visible.length} of ${products.length} products${category !== "all" ? ` in ${category}` : ""}.`
        }
      />

      <div className="px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} style={{ color: COLORS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              aria-label="Search products"
              style={controlStyle}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg text-sm outline-none"
            />
          </div>

          <Select
            value={category}
            onChange={setCategory}
            ariaLabel="Filter by category"
            options={[{ value: "all", label: "All categories" }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))]}
          />

          <Select
            value={stateFilter}
            onChange={setStateFilter}
            ariaLabel="Filter by status"
            options={[
              { value: "all", label: "All statuses" },
              { value: "in", label: "In stock" },
              { value: "low", label: "Low stock" },
              { value: "out", label: "Out of stock" },
              { value: "hidden", label: "Hidden" },
            ]}
          />

          <Link
            to="/products/new"
            style={{ backgroundColor: COLORS.primary, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Add product
          </Link>
        </div>

        {(error || actionError) && (
          <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error ?? actionError}</p>
        )}

        <div>
          <DataTable
            columns={columns}
            data={visible}
            keyField="id"
            emptyLabel={
              loading
                ? "Loading products…"
                : products.length === 0
                  ? "No products yet. Add your first product to get started."
                  : "No products match these filters."
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this product?"
        message={`"${toDelete?.name ?? ""}" will be removed from your catalog. This can't be undone.`}
        confirmLabel="Delete product"
        busy={toDelete !== null && busyId === toDelete.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
