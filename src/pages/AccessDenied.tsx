import { useClerk, useUser } from "@clerk/react";
import { ShieldAlert, LogOut } from "lucide-react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

export default function AccessDenied() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center"
      style={{
        backgroundColor: COLORS.background,
        backgroundImage:
          "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(200,164,107,0.10), transparent 65%)",
      }}
    >
      <div
        className="fade-in-elegant w-full max-w-md rounded-2xl p-8 shadow-elegant-md"
        style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.dangerBg }}
        >
          <ShieldAlert size={26} color={COLORS.danger} strokeWidth={1.75} />
        </div>

        <h1 style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.primary }} className="text-xl font-semibold mb-2">
          This account can't open the dashboard
        </h1>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 1.7 }} className="text-sm mb-1">
          The dashboard is only available to admin accounts. Ask an administrator to give your account the
          admin role, then sign in again.
        </p>
        {email && (
          <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs mt-3">
            Signed in as {email}
          </p>
        )}

        <button
          onClick={() => signOut({ redirectUrl: "/login" })}
          style={{ backgroundColor: COLORS.primary, color: COLORS.cream, fontFamily: FONTS.bodyMedium }}
          className="btn-elegant mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer active:scale-[0.97]"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}
