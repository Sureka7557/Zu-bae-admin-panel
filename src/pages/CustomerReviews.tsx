import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Star } from "lucide-react";
import { useAuth } from "@clerk/react";
import Header from "../components/Header";
import Select from "../components/Select";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type Review = {
  _id?: string;
  id?: string;
  clerkId?: string;
  rating: number;
  selectedTags?: string[];
  comment?: string;
  createdAt: string;
};

const controlStyle = {
  fontFamily: FONTS.body,
  color: COLORS.text,
  backgroundColor: COLORS.cardWarm,
  border: `1px solid ${COLORS.border}`,
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          strokeWidth={1.5}
          color={COLORS.gold}
          fill={s <= Math.round(value) ? COLORS.gold : "none"}
        />
      ))}
    </div>
  );
}

const formatDate = (iso: string) =>
  iso && !Number.isNaN(Date.parse(iso))
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export default function CustomerReviews() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      if (!API_URL) throw new Error("VITE_API_URL is missing from the admin environment.");

      const response = await fetch(`${API_URL}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (response.status === 401 || response.status === 403
              ? "Admin authorization failed. Check your Clerk session and admin role."
              : "Failed to load customer reviews.")
        );
      }
      setReviews(Array.isArray(result) ? result : result.reviews ?? result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while loading reviews.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
      const text = [r.clerkId ?? "", r.comment ?? "", ...(r.selectedTags ?? [])].join(" ").toLowerCase();
      return text.includes(q);
    });
  }, [reviews, search, ratingFilter]);

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const written = reviews.filter((r) => r.comment?.trim()).length;

  return (
    <>
      <Header
        title="Reviews"
        subtitle={
          loading
            ? "Loading…"
            : `${reviews.length} reviews · ${average.toFixed(1)} average · ${written} with comments`
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
              placeholder="Search comments or tags"
              aria-label="Search reviews"
              style={controlStyle}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg text-sm outline-none"
            />
          </div>

          <Select
            value={ratingFilter}
            onChange={setRatingFilter}
            ariaLabel="Filter by rating"
            options={[
              { value: "all", label: "All ratings" },
              ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "star" : "stars"}` })),
            ]}
          />

          <button
            type="button"
            onClick={() => void fetchReviews()}
            disabled={loading}
            style={{ ...controlStyle, fontFamily: FONTS.bodyMedium }}
            className="ml-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{error}</p>
        )}

        <div
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
          className="rounded-xl divide-y"
        >
          {filtered.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontFamily: FONTS.body }} className="text-sm text-center py-12">
              {loading
                ? "Loading reviews…"
                : reviews.length === 0
                  ? "No reviews yet."
                  : "No reviews match these filters."}
            </p>
          ) : (
            filtered.map((r, i) => (
              <article
                key={r._id ?? r.id ?? `${r.createdAt}-${i}`}
                style={{ borderColor: COLORS.border }}
                className="px-5 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Stars value={r.rating} />
                    <span style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }} className="text-sm font-medium">
                      Customer {r.clerkId ? r.clerkId.slice(-6) : "Guest"}
                    </span>
                  </div>
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                    {formatDate(r.createdAt)}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: FONTS.body,
                    color: r.comment?.trim() ? COLORS.textSecondary : COLORS.textMuted,
                    lineHeight: 1.6,
                  }}
                  className="mt-2 text-sm whitespace-pre-wrap break-words"
                >
                  {r.comment?.trim() || "No written comment."}
                </p>

                {!!r.selectedTags?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.selectedTags.map((tag) => (
                      <span
                        key={tag}
                        style={{ backgroundColor: COLORS.cardWarm, color: COLORS.textSecondary, fontFamily: FONTS.body }}
                        className="rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </>
  );
}
