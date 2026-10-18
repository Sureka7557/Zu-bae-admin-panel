import { useEffect } from "react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(32,16,15,0.45)" }}
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
        className="w-full max-w-sm rounded-xl p-6"
      >
        <h2 id="confirm-title" style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.text }} className="text-base font-semibold">
          {title}
        </h2>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 1.6 }} className="mt-2 text-sm">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(32,16,15,0.04)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            style={{ backgroundColor: COLORS.danger, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
