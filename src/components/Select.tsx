import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  disabled?: boolean;
  title?: string;
  size?: "md" | "sm";
}

/**
 * Styled dropdown that replaces the native <select>.
 * The menu is rendered in a portal, so it is never clipped by tables or scroll containers.
 */
export default function Select({ value, onChange, options, ariaLabel, disabled, title, size = "md" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const small = size === "sm";

  const close = useCallback(() => setOpen(false), []);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = Math.min(options.length * 38 + 12, 280);
    const flip = window.innerHeight - rect.bottom < menuHeight + 12 && rect.top > menuHeight;
    setPos(
      flip
        ? { bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width }
        : { top: rect.bottom + 4, left: rect.left, width: rect.width }
    );
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  // Close on outside click, resize, or scrolling the page behind the menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !menuRef.current?.contains(t)) close();
    };
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  // Keep the highlighted option visible when using the keyboard
  useLayoutEffect(() => {
    if (open) menuRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    close();
    buttonRef.current?.focus();
  };

  const move = (dir: 1 | -1) => {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(options[active]); }
    else if (e.key === "Tab") close();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        style={{
          fontFamily: FONTS.body,
          color: COLORS.text,
          backgroundColor: COLORS.cardWarm,
          border: `1px solid ${open ? COLORS.textMuted : COLORS.border}`,
        }}
        className={`flex items-center justify-between gap-2 rounded-lg outline-none cursor-pointer transition-colors focus-visible:border-[#8B7770] disabled:cursor-not-allowed disabled:opacity-60 ${
          small ? "px-2.5 py-1.5 text-xs min-w-[120px]" : "px-3 py-2 text-sm min-w-[150px]"
        }`}
      >
        <span className="truncate">{selected?.label ?? "Select…"}</span>
        <ChevronDown
          size={small ? 13 : 15}
          color={COLORS.textMuted}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              minWidth: Math.max(pos.width, small ? 150 : 180),
              maxHeight: 280,
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 8px 24px rgba(32,16,15,0.10)",
              zIndex: 60,
            }}
            className="overflow-y-auto rounded-lg p-1.5"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => !opt.disabled && setActive(i)}
                  onClick={() => choose(opt)}
                  style={{
                    fontFamily: isSelected ? FONTS.bodyMedium : FONTS.body,
                    color: opt.disabled ? COLORS.textMuted : isSelected ? COLORS.primary : COLORS.text,
                    backgroundColor: i === active && !opt.disabled ? COLORS.cardWarm : "transparent",
                    opacity: opt.disabled ? 0.55 : 1,
                  }}
                  className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${
                    opt.disabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} strokeWidth={2} className="shrink-0" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
