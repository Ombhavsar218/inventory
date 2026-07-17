import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  ClipboardList,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const widgets = [
  {
    title: "Products",
    description: "Manage your product catalog",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    count: 0,
  },
  {
    title: "Orders",
    description: "Track and process orders",
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    count: 0,
  },
  {
    title: "Distributors",
    description: "Manage distributor network",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    count: 0,
  },
  {
    title: "Inventory",
    description: "Stock levels and movements",
    icon: BarChart3,
    color: "text-violet-600",
    bg: "bg-violet-50",
    count: 0,
  },
  {
    title: "Reports",
    description: "Analytics and insights",
    icon: TrendingUp,
    color: "text-rose-600",
    bg: "bg-rose-50",
    count: 0,
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.fullName?.split(" ")[0] || "User"}
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your inventory management system.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <Card
              key={widget.title}
              className="group cursor-default border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${widget.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${widget.color}`} />
                  </div>
                  <span className="text-primary text-xl font-bold">{widget.count}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mt-3">{widget.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{widget.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
