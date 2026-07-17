import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  MARKETING: "Marketing",
  API: "API User",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        <p className="text-muted-foreground mt-1">View and manage your account.</p>
      </div>
      <Card className="border-0 shadow-md max-w-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.fullName?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{user?.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {roleLabels[user?.role || ""] || user?.role}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm text-foreground mt-1">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</p>
              <p className="text-sm text-foreground mt-1">{roleLabels[user?.role || ""] || user?.role}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="mt-8"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
