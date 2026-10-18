import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, FolderTree, MessageSquare } from "lucide-react";
import { COLORS } from "../constants/COLORS";
import { FONTS } from "../constants/FONTS";
import logo from "../assets/ZB.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Products", to: "/products", icon: Package },
  { label: "Orders", to: "/orders", icon: ShoppingBag },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Categories", to: "/categories", icon: FolderTree },
  { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside style={{ backgroundColor: COLORS.primaryDark }} className="h-screen w-60 flex flex-col shrink-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div
          style={{ backgroundColor: COLORS.cream }}
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
        >
          <img src={logo} alt="Zu-Bae" className="h-full w-full object-contain p-1.5" />
        </div>
        <div className="leading-tight">
          <div style={{ fontFamily: FONTS.headingSemiBold, color: COLORS.cream }} className="text-base font-semibold">
            Zu-Bae
          </div>
          <div style={{ fontFamily: FONTS.body, color: COLORS.softNude }} className="text-xs">
            Store admin
          </div>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={({ isActive }) => ({
              fontFamily: isActive ? FONTS.bodyMedium : FONTS.body,
              color: isActive ? COLORS.cream : COLORS.softNude,
              backgroundColor: isActive ? "rgba(255,249,245,0.10)" : "transparent",
            })}
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
