import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { COLORS } from "../constants/COLORS";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: COLORS.background,
        backgroundImage:
          "radial-gradient(ellipse 1200px 600px at 100% 0%, rgba(200,164,107,0.06), transparent 60%)",
      }}
    >
      <Sidebar />

      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div key={location.pathname} className="fade-in-elegant min-h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
