import type { LucideIcon } from "lucide-react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number; // e.g. 12.4 or -3.2
  icon?: LucideIcon;
  /** Text after the delta. Default "vs previous period". */
  hint?: string;
}

export default function StatCard({ label, value, delta, icon: Icon, hint = "vs previous period" }: StatCardProps) {
  const color =
    delta === undefined || delta === 0 ? COLORS.textMuted : delta > 0 ? COLORS.success : COLORS.danger;

  return (
    <div
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
      className="rounded-xl p-5"
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: FONTS.body, color: COLORS.textSecondary }} className="text-sm">
          {label}
        </span>
        {Icon && <Icon size={16} color={COLORS.textMuted} strokeWidth={1.75} />}
      </div>

      <div
        style={{ fontFamily: FONTS.heading, color: COLORS.text }}
        className="text-2xl font-semibold mt-2 tabular-nums"
      >
        {value}
      </div>

      {delta !== undefined && (
        <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs mt-1.5">
          <span style={{ color, fontFamily: FONTS.bodyMedium }} className="font-medium">
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>{" "}
          {hint}
        </p>
      )}
    </div>
  );
}
