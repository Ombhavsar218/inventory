import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Warehouse,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Package,
  Store,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER", "SUPERADMIN"] },
  { to: "/bills", label: "Bills", icon: Receipt, roles: ["OWNER", "SUPERADMIN", "MARKETING"] },
  { to: "/purchase", label: "Purchase", icon: ShoppingCart, roles: ["OWNER", "SUPERADMIN"] },
  { to: "/stock", label: "Stock", icon: Package, roles: ["OWNER", "SUPERADMIN"] },
  { to: "/shops", label: "Shops", icon: Store, roles: ["OWNER", "SUPERADMIN"] },
  { to: "/users", label: "Users", icon: Users, roles: ["SUPERADMIN"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["OWNER", "SUPERADMIN", "MARKETING"] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden lg:flex w-[270px] flex-col bg-white border-r" style={{ borderColor: "var(--app-border)" }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "none" }}>
        <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center" style={{ background: "var(--app-indigo-bg)", color: "var(--app-indigo)" }}>
          <Warehouse className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-bold leading-tight" style={{ color: "var(--app-text-dark)" }}>Total Stock</h1>
          <p className="text-[12px] leading-none mt-0.5" style={{ color: "var(--app-text-light)" }}>Inventory Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] text-[14.5px] font-medium transition-colors ${
                  isActive
                    ? "font-semibold"
                    : "hover:bg-gray-50"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--app-indigo-bg)" : undefined,
                color: isActive ? "var(--app-indigo)" : "var(--app-text-mid)",
              })}
            >
              <Icon className="h-[19px] w-[19px]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
