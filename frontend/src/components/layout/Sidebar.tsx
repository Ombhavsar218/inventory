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
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER"] },
  { to: "/bills", label: "Bills", icon: Receipt, roles: ["OWNER", "MARKETING"] },
  { to: "/purchase", label: "Purchase", icon: ShoppingCart, roles: ["OWNER"] },
  { to: "/stock", label: "Stock", icon: Package, roles: ["OWNER"] },
  { to: "/shops", label: "Shops", icon: Store, roles: ["OWNER"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["OWNER", "MARKETING"] },
];

export default function Sidebar() {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden lg:flex w-64 flex-col bg-white border-r border-border">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Warehouse className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Total Stock</h1>
          <p className="text-xs text-muted-foreground leading-none">Inventory Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
