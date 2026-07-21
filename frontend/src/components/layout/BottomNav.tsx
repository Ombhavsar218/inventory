import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
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

export default function BottomNav() {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role || ""));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-white px-2 py-2 lg:hidden">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
