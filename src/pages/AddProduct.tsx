import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { UploadCloud, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import { useApi } from "../hooks/useApi";
import { useQuery } from "../hooks/useQuery";
import { ENDPOINTS } from "../api/endpoints";
import { PRODUCT_CATEGORIES, type ApiProduct } from "../api/mappers";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fieldStyle = {
  fontFamily: FONTS.body,
  color: COLORS.text,
  backgroundColor: COLORS.cardWarm,
  border: `1px solid ${COLORS.border}`,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block group">
      <span
        style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary }}
        className="text-xs font-medium block mb-1.5 transition-colors duration-150 group-focus-within:text-[#4B101D]"
      >
        {label}
      </span>
      {children}
      {hint && (
        <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs mt-1 block">
          {hint}
        </span>
      )}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }} className="text-sm font-medium">
          {label}
        </div>
        <div style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs mt-0.5">
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{ backgroundColor: checked ? COLORS.primary : COLORS.border }}
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full cursor-pointer transition-colors duration-200"
      >
        <span
          style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
          className="absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        />
      </button>
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  category: PRODUCT_CATEGORIES[0] as string,
  price: "",
  stock: "",
  sizes: "",
  description: "",
  isFeatured: false,
  isActive: true,
};

export default function AddProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const api = useApi();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: existing, loading: loadingExisting, error: loadError } = useQuery<ApiProduct>(
    id ? ENDPOINTS.product(id) : null
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Fill the form when editing.
  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      category: existing.category,
      price: String(existing.price),
      stock: String(existing.stock),
      sizes: (existing.sizes ?? []).join(", "),
      description: existing.description,
      isFeatured: existing.isFeatured,
      isActive: existing.isActive,
    });
    setKeptImages(existing.images ?? []);
    setRemovedImages([]);
  }, [existing]);

  // Object URLs for previews of newly picked files.
  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const totalImages = keptImages.length + newFiles.length;

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    setError(null);
    const picked = Array.from(list);
    const images = picked.filter((f) => f.type.startsWith("image/"));
    const tooBig = images.find((f) => f.size > MAX_IMAGE_BYTES);

    if (images.length < picked.length) setError("Only image files can be uploaded.");
    else if (tooBig) setError(`"${tooBig.name}" is larger than 5 MB.`);

    const allowed = images.filter((f) => f.size <= MAX_IMAGE_BYTES);
    const room = MAX_IMAGES - totalImages;
    if (allowed.length > room) setError(`A product can have up to ${MAX_IMAGES} images.`);
    if (room > 0 && allowed.length > 0) setNewFiles((prev) => [...prev, ...allowed.slice(0, room)]);
  };

  const removeKept = (url: string) => {
    setKeptImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Enter a product name.";
    if (!form.description.trim()) return "Enter a description.";
    const price = Number(form.price.replace(/,/g, ""));
    if (form.price.trim() === "" || Number.isNaN(price) || price < 0) return "Enter a valid price.";
    const stock = Number(form.stock || 0);
    if (!Number.isInteger(stock) || stock < 0) return "Stock must be a whole number, 0 or more.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description.trim());
      body.append("price", String(Number(form.price.replace(/,/g, ""))));
      body.append("stock", String(Number(form.stock || 0)));
      body.append("category", form.category);
      body.append(
        "sizes",
        JSON.stringify(form.sizes.split(",").map((s) => s.trim()).filter(Boolean))
      );
      body.append("isFeatured", String(form.isFeatured));
      body.append("isActive", String(form.isActive));
      newFiles.forEach((f) => body.append("images", f));

      if (isEdit && id) {
        if (removedImages.length > 0) body.append("removeImages", JSON.stringify(removedImages));
        await api.put(`${ENDPOINTS.products}/${id}`, body);
      } else {
        await api.post(ENDPOINTS.products, body);
      }
      navigate("/products");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = PRODUCT_CATEGORIES.includes(form.category as (typeof PRODUCT_CATEGORIES)[number])
    ? [...PRODUCT_CATEGORIES]
    : [...PRODUCT_CATEGORIES, form.category];

  const title = isEdit ? "Edit product" : "Add product";
  const subtitle = isEdit ? "Update this product's details." : "Create a new product listing.";

  if (isEdit && loadingExisting) {
    return (
      <>
        <Header title={title} subtitle="Loading product…" />
        <div className="px-8 py-6">
          <div className="h-64 max-w-4xl rounded-xl animate-pulse" style={{ backgroundColor: COLORS.cardWarm }} />
        </div>
      </>
    );
  }

  if (isEdit && loadError) {
    return (
      <>
        <Header title={title} subtitle="We couldn't load this product." />
        <div className="px-8 py-6">
          <p style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">{loadError}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={title} subtitle={subtitle} />

      <form onSubmit={handleSubmit} noValidate className="px-8 py-6 max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Details */}
          <div
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
            className="rounded-xl p-6 space-y-5 fade-in-elegant"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Product name">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Velvet wrap dress"
                  style={fieldStyle}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  style={fieldStyle}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Price (₹)">
                <input
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="3,499"
                  inputMode="decimal"
                  style={{ ...fieldStyle, fontFamily: FONTS.mono }}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                />
              </Field>
              <Field label="Stock quantity">
                <input
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  placeholder="24"
                  inputMode="numeric"
                  style={{ ...fieldStyle, fontFamily: FONTS.mono }}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                />
              </Field>
            </div>

            <Field label="Sizes" hint="Separate with commas, for example S, M, L, XL. Leave empty if not applicable.">
              <input
                value={form.sizes}
                onChange={(e) => set("sizes", e.target.value)}
                placeholder="S, M, L, XL"
                style={fieldStyle}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                placeholder="Describe the fabric, fit and care."
                style={fieldStyle}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
              />
            </Field>
          </div>

          {/* Images + visibility */}
          <div className="space-y-6">
            <div
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
              className="rounded-xl p-6 space-y-4 fade-in-elegant"
            >
              <div className="flex items-baseline justify-between">
                <span style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary }} className="text-xs font-medium">
                  Product images
                </span>
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">
                  {totalImages}/{MAX_IMAGES}
                </span>
              </div>

              {totalImages > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {keptImages.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span
                          style={{ backgroundColor: COLORS.primary, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
                          className="absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px]"
                        >
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeKept(url)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {previews.map((src, i) => (
                    <div key={src} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {keptImages.length === 0 && i === 0 && (
                        <span
                          style={{ backgroundColor: COLORS.primary, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
                          className="absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px]"
                        >
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalImages < MAX_IMAGES && (
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                  style={{
                    borderColor: isDragging ? COLORS.primary : COLORS.border,
                    backgroundColor: isDragging ? "rgba(200, 164, 107, 0.08)" : COLORS.cardWarm,
                  }}
                  className="border border-dashed rounded-lg py-7 flex flex-col items-center justify-center gap-2 cursor-pointer transition-elegant hover:border-[#C8A46B]"
                >
                  <UploadCloud size={20} color={isDragging ? COLORS.primary : COLORS.textMuted} strokeWidth={1.5} />
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs text-center px-2">
                    {isDragging ? "Drop to upload" : "Drag and drop, or click to choose"}
                  </span>
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-[11px]">
                    Up to 5 images, 5 MB each
                  </span>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <div
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
              className="rounded-xl p-6 space-y-5 fade-in-elegant"
            >
              <Toggle
                checked={form.isActive}
                onChange={(v) => set("isActive", v)}
                label="Visible in store"
                description="Hidden products stay in the catalog but customers can't see them."
              />
              <Toggle
                checked={form.isFeatured}
                onChange={(v) => set("isFeatured", v)}
                label="Featured"
                description="Show this product in the featured section of the app."
              />
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" style={{ color: COLORS.danger, fontFamily: FONTS.body }} className="text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
            className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150 hover:bg-[rgba(32,16,15,0.03)] active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ backgroundColor: COLORS.primary, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
            className="btn-elegant px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer active:scale-[0.97] disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save product"}
          </button>
        </div>
      </form>
    </>
  );
}
