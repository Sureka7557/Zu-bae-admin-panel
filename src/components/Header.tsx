import { LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "A";
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const userName = isLoaded ? user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin" : "";

  return (
    <header
      style={{ backgroundColor: COLORS.cream, borderBottom: `1px solid ${COLORS.border}` }}
      className="flex items-center justify-between gap-4 px-8 py-4"
    >
      <div className="min-w-0">
        <h1 style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.text }} className="text-xl font-semibold truncate">
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => openUserProfile()}
          aria-label="Open your profile"
          className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-3 cursor-pointer transition-colors hover:bg-[rgba(32,16,15,0.05)]"
        >
          {!isLoaded ? (
            <div className="h-8 w-8 rounded-full animate-pulse" style={{ backgroundColor: COLORS.cardWarm }} />
          ) : user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div
              style={{ backgroundColor: COLORS.primary, fontFamily: FONTS.bodyMedium, color: COLORS.cream }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium"
            >
              {getInitials(userName)}
            </div>
          )}
          <span
            style={{ fontFamily: FONTS.bodyMedium, color: COLORS.text }}
            className="text-sm font-medium max-w-[160px] truncate"
          >
            {isLoaded ? userName : "Loading…"}
          </span>
        </button>

        <button
          aria-label="Sign out"
          title="Sign out"
          onClick={() => signOut({ redirectUrl: "/login" })}
          style={{ color: COLORS.textSecondary }}
          className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(161,61,61,0.08)] hover:text-[#A13D3D]"
        >
          <LogOut size={17} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
