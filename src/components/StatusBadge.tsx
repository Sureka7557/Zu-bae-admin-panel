import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

export type BadgeStatus = "success" | "danger" | "warning" | "neutral";

const MAP: Record<BadgeStatus, { bg: string; text: string }> = {
  success: { bg: COLORS.successBg, text: COLORS.success },
  danger: { bg: COLORS.dangerBg, text: COLORS.danger },
  warning: { bg: COLORS.warningBg, text: COLORS.warning },
  neutral: { bg: COLORS.cardWarm, text: COLORS.textSecondary },
};

interface StatusBadgeProps {
  label: string;
  status: BadgeStatus;
  /** Kept for compatibility; the badge no longer shows a dot. */
  dot?: boolean;
}

export default function StatusBadge({ label, status }: StatusBadgeProps) {
  const { bg, text } = MAP[status];
  return (
    <span
      style={{ backgroundColor: bg, color: text, fontFamily: FONTS.bodyMedium }}
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      {label}
    </span>
  );
}
