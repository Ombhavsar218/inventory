import api from "@/lib/axios";

export interface LowStockItem {
  id: number;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
  shop: { id: number; name: string } | null;
}

export interface DailySale {
  day: number;
  totalAmount: number;
  billsCount: number;
}

export interface RecentBill {
  id: number;
  shopId: number;
  shopName: string;
  totalAmount: number;
  itemsCount: number;
  creator: string;
  date: string;
}

export interface TopSellingItem {
  stockId: number;
  name: string;
  unit: string;
  totalQuantity: number;
  revenue: number;
}

export interface DashboardStats {
  success: boolean;
  totalShops: number;
  totalStockItems: number;
  todayBills: number;
  todayRevenue: number;
  totalRevenue: number;
  lowStockItems: LowStockItem[];
  dailySales: DailySale[];
  recentBills: RecentBill[];
  topSellingItems: TopSellingItem[];
}

export const dashboardService = {
  getStats: async (month?: string): Promise<DashboardStats> => {
    const params = month ? { month } : {};
    const response = await api.get<DashboardStats>("/dashboard/stats", { params });
    return response.data;
  },
};
