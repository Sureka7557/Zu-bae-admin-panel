import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Header from "../components/Header";
import DataTable, { type Column } from "../components/DataTable";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import { mapCustomer, type ApiCustomer } from "../api/mappers";
import { getInitials } from "../lib/format";

type Customer = ReturnType<typeof mapCustomer>;

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        {row.image ? (
          <img src={row.image} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
        ) : (
          <div
            style={{ backgroundColor: COLORS.cardWarm, color: COLORS.textSecondary, fontFamily: FONTS.bodyMedium }}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
          >
            {getInitials(row.name)}
          </div>
        )}
        <span style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }} className="font-medium">
          {row.name}
        </span>
      </div>
    ),
  },
  { key: "email", header: "Email" },
  { key: "orders", header: "Orders", align: "right" },
  { key: "spent", header: "Total spent", align: "right" },
  { key: "joined", header: "Joined" },
];

export default function Customers() {
  const { data, loading, error } = useQuery<ApiCustomer[]>(ENDPOINTS.customers);
  const [search, setSearch] = useState("");

  const all = useMemo(() => (data ?? []).map(mapCustomer), [data]);
  const customers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? all.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) : all;
  }, [all, search]);

  return (
    <>
      <Header
        title="Customers"
        subtitle={loading ? "Loading…" : `${customers.length} of ${all.length} customers.`}
      />
      <div className="px-8 py-6 space-y-4">
        <div className="relative w-full max-w-xs">
          <Search size={15} style={{ color: COLORS.textMuted }} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search customers"
            style={{
              fontFamily: FONTS.body,
              color: COLORS.text,
              backgroundColor: COLORS.cardWarm,
              border: `1px solid ${COLORS.border}`,
            }}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {error && <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error}</p>}

        <DataTable
          columns={columns}
          data={customers}
          keyField="id"
          emptyLabel={loading ? "Loading customers…" : all.length === 0 ? "No customers yet." : "No customers match your search."}
        />
      </div>
    </>
  );
}
