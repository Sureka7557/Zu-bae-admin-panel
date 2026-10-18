import { Link } from "react-router-dom";
import Header from "../components/Header";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import type { ApiCategory } from "../api/mappers";

export default function Categories() {
  const { data, loading, error } = useQuery<ApiCategory[]>(ENDPOINTS.categories);
  const categories = data ?? [];

  return (
    <>
      <Header
        title="Categories"
        subtitle={loading ? "Loading…" : `${categories.length} categories. Set in the product model on the server.`}
      />
      <div className="px-8 py-6 space-y-4">
        {error && <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
              className="rounded-xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#8B7770]"
            >
              <span style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }} className="text-sm font-medium">
                {cat.name}
              </span>
              <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
              </span>
            </Link>
          ))}
        </div>

        {!loading && categories.length === 0 && !error && (
          <p style={{ color: COLORS.textMuted, fontFamily: FONTS.body }} className="text-sm text-center py-8">
            No categories found.
          </p>
        )}
      </div>
    </>
  );
}
