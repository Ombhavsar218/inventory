import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut, Warehouse, HelpCircle, X, LayoutDashboard, Receipt, ShoppingCart, Package, Store, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  MARKETING: "Marketing",
  API: "API User",
};

const ownerGuide = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "View your business overview — daily sales chart, KPI cards, low stock alerts, recent bills, and top selling items.",
      "Navigate months using the [<] [>] arrow buttons on the daily sales chart.",
    ],
  },
  {
    icon: Receipt,
    title: "Bills",
    color: "text-rose-600",
    bg: "bg-rose-50",
    items: [
      "View all bills grouped by shop for any date using the date picker.",
      "Click a shop name to see individual bills with details.",
      "Create new bills, edit existing ones, delete bills, and print GST invoices.",
      "Use the 'Print Bill' button on a shop's page to print a consolidated GST invoice for all items.",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Purchase",
    color: "text-amber-600",
    bg: "bg-amber-50",
    items: [
      "Track your purchase orders and procurement activity.",
    ],
  },
  {
    icon: Package,
    title: "Stock",
    color: "text-violet-600",
    bg: "bg-violet-50",
    items: [
      "Manage your inventory — add new items with MRP, HSN code, and GST rate.",
      "Edit or remove items. View current stock levels at a glance.",
      "Stock is automatically deducted when a bill is created and restored when a bill is deleted.",
    ],
  },
  {
    icon: Store,
    title: "Shops",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    items: [
      "Add and manage your shop/customer details — name, address, GST number, FSSAI number, phone, email, and state code.",
      "Click a shop name to view its details and all related bills.",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    color: "text-slate-600",
    bg: "bg-slate-100",
    items: [
      "Configure your business profile — company name, address, GSTIN, FSSAI, and bank details.",
      "These details appear on all printed GST invoices.",
    ],
  },
];

const marketingGuide = [
  {
    icon: Receipt,
    title: "Bills",
    color: "text-rose-600",
    bg: "bg-rose-50",
    items: [
      "Create and manage bills for your assigned shops.",
      "Select a shop, add items with quantities and prices, and submit.",
      "View, edit, and delete your previously created bills.",
      "Use the date picker to browse bills from different days.",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    color: "text-slate-600",
    bg: "bg-slate-100",
    items: [
      "View your profile and update your password.",
    ],
  },
];

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const isOwner = user?.role === "OWNER";
  const guideItems = isOwner ? ownerGuide : marketingGuide;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Warehouse className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-base font-bold text-foreground">Total Stock</h1>
        </div>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGuide(true)}
            className="text-muted-foreground hover:text-primary"
            title="Guide"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
              0
            </span>
          </Button>

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.fullName?.charAt(0) || "U"}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground leading-none">
                {roleLabels[user?.role || ""] || user?.role}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive ml-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGuide(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Total Stock Guide</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGuide(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              {guideItems.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                    </div>
                    <ul className="ml-9 space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div className="pt-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground text-center">
                  Need help? Contact your administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
