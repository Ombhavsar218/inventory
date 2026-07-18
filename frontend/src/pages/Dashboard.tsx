import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Store,
  Package,
  Receipt,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Clock,
  Loader2,
  ArrowRight,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardService, type DashboardStats } from "@/services/dashboard.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatThousands(value: number) {
  if (value >= 100000) return `₹${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStats = useCallback(async (month?: string) => {
    try {
      const data = await dashboardService.getStats(month);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!loading) {
      setChartLoading(true);
      dashboardService.getStats(selectedMonth).then((data) => {
        setStats(data);
        setChartLoading(false);
      }).catch(() => setChartLoading(false));
    }
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const kpiCards = [
    {
      title: "Total Shops",
      value: stats.totalShops,
      icon: Store,
      color: "text-blue-600",
      bg: "bg-blue-50",
      onClick: () => navigate("/shops"),
    },
    {
      title: "Stock Items",
      value: stats.totalStockItems,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      onClick: () => navigate("/stock"),
    },
    {
      title: "Today's Bills",
      value: stats.todayBills,
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-50",
      onClick: () => navigate("/bills"),
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-violet-600",
      bg: "bg-violet-50",
      onClick: undefined,
    },
  ];

  const currentMonth = new Date().getFullYear() - new Date(selectedMonth.split("-").map(Number)[0]).getFullYear() === 0 &&
    new Date().getMonth() + 1 === parseInt(selectedMonth.split("-")[1]);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`group border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${card.onClick ? "cursor-pointer" : ""}`}
              onClick={card.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <span className="text-xl font-bold text-foreground">{card.value}</span>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mt-3">{card.title}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Daily Sales Line Chart */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Daily Sales</h3>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium text-foreground min-w-[100px] text-center">
                    {formatMonthLabel(selectedMonth)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <button
                onClick={() => navigate("/bills")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {chartLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : stats.dailySales.length === 0 || stats.dailySales.every((d) => d.totalAmount === 0) ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No sales data for this month</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailySales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(0, Math.floor(stats.dailySales.length / 10))}
                    />
                    <YAxis
                      tickFormatter={formatThousands}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
            </div>
            {stats.lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All stock levels healthy</p>
            ) : (
              <div className="space-y-2.5">
                {stats.lowStockItems.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/stock/${item.id}/edit`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.shop?.name || "No shop"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`text-sm font-bold ${item.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {item.minStock} {item.unit}</span>
                    </div>
                  </div>
                ))}
                {stats.lowStockItems.length > 6 && (
                  <button
                    onClick={() => navigate("/stock")}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center py-1"
                  >
                    +{stats.lowStockItems.length - 6} more
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bills */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Recent Bills</h3>
              </div>
              <button
                onClick={() => navigate("/bills")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {stats.recentBills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No bills created yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/bills/${bill.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{bill.shopName}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.itemsCount} item(s) &middot; {bill.creator} &middot;{" "}
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0 ml-3">
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Top Selling Items</h3>
            </div>
            {stats.topSellingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No sales data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.topSellingItems.map((item, index) => (
                  <div
                    key={item.stockId}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/stock/${item.stockId}/edit`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.totalQuantity} {item.unit} sold
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0 ml-3">
                      ₹{item.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
