import type { ReactNode } from "react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import logo from "../assets/ZB.png";

function LogoMark({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: COLORS.cream }}
      className="rounded-full flex items-center justify-center shrink-0"
    >
      <img src={logo} alt="Zu-Bae" className="h-full w-full object-contain p-1.5" />
    </div>
  );
}

interface AuthShellProps {
  heading: string;
  text: string;
  children: ReactNode;
}

export function AuthFormLoader() {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16" style={{ fontFamily: FONTS.body, color: COLORS.textMuted }}>
      <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: COLORS.border, borderTopColor: COLORS.primary }} />
      <span className="text-xs">Loading secure sign-in…</span>
    </div>
  );
}

export default function AuthShell({ heading, text, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <aside
        className="hidden lg:flex w-[42%] max-w-[560px] flex-col justify-between p-12"
        style={{ backgroundColor: COLORS.primaryDark, color: COLORS.cream }}
      >
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <span style={{ fontFamily: FONTS.headingSemiBold }} className="text-base font-semibold">
            Zu-Bae Admin
          </span>
        </div>

        <div>
          <h1 style={{ fontFamily: FONTS.heading, lineHeight: 1.2 }} className="text-4xl font-semibold mb-4">
            {heading}
          </h1>
          <p style={{ fontFamily: FONTS.body, color: COLORS.softNude, lineHeight: 1.7 }} className="max-w-sm text-[15px]">
            {text}
          </p>
        </div>

        <p style={{ fontFamily: FONTS.body, color: COLORS.softNude }} className="text-xs">
          Access is limited to authorised store staff.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <LogoMark size={40} />
          <span style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.primary }} className="text-lg font-semibold">
            Zu-Bae Admin
          </span>
        </div>

        <div className="flex w-full max-w-[440px] justify-center">{children}</div>
      </main>
    </div>
  );
}
