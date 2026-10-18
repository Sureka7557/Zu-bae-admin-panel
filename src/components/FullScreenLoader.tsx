import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

interface FullScreenLoaderProps {
  label?: string;
}

/** Plain full-page loading state with its own background so the screen is never blank. */
export default function FullScreenLoader({ label = "Loading…" }: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: COLORS.background }}
    >
      <div
        className="h-8 w-8 rounded-full border-2 animate-spin"
        style={{ borderColor: COLORS.border, borderTopColor: COLORS.primary }}
      />
      <p style={{ fontFamily: FONTS.body, color: COLORS.textSecondary }} className="text-sm">
        {label}
      </p>
    </div>
  );
}
