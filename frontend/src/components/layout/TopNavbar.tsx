import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  MARKETING: "Marketing",
  API: "API User",
};

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Warehouse className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-base font-bold text-foreground">Total Stock</h1>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
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
  );
}
