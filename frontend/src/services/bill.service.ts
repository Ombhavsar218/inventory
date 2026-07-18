import api from "@/lib/axios";

export interface BillItem {
  id: number;
  stockId: number;
  quantity: number;
  unit: string;
  price: number;
  stock: { id: number; name: string; sku?: string | null; unit: string; mrp?: number | null; hsnCode?: string | null; gstRate?: number | null };
}

export interface Bill {
  id: number;
  invoiceNumber: string | null;
  shopId: number;
  shop: { id: number; name: string; address?: string; gstNo?: string | null; fssaiNo?: string | null; phone?: string | null; email?: string | null; stateCode?: string | null };
  date: string;
  totalAmount: number;
  createdBy: number;
  creator: { id: number; fullName: string; role: string };
  items: BillItem[];
  createdAt: string;
}

export interface BillListResponse {
  success: boolean;
  bills: Bill[];
}

export interface BillResponse {
  success: boolean;
  bill: Bill;
}

export interface BillGrouped {
  shopId: number;
  shopName: string;
  totalAmount: number;
  totalItems: number;
  billsCount: number;
  bills: Bill[];
}

export interface ShopBillItem {
  stockName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  createdBy: string;
  billId: number;
  mrp?: number | null;
  hsnCode?: string | null;
  gstRate?: number | null;
}

export interface ShopBillsResponse {
  success: boolean;
  shop: { id: number; name: string; address?: string; gstNo?: string | null; fssaiNo?: string | null; phone?: string | null; email?: string | null; stateCode?: string | null } | null;
  date: string;
  totalAmount: number;
  totalItems: number;
  items: ShopBillItem[];
  billsCount: number;
}

export interface BillGroupedResponse {
  success: boolean;
  groups: BillGrouped[];
}

export const billService = {
  getGrouped: async (date?: string): Promise<BillGroupedResponse> => {
    const params = date ? { date } : {};
    const response = await api.get<BillGroupedResponse>("/bills/grouped", { params });
    return response.data;
  },

  getShopBills: async (shopId: number, date?: string): Promise<ShopBillsResponse> => {
    const params = date ? { date } : {};
    const response = await api.get<ShopBillsResponse>(`/bills/shop/${shopId}`, { params });
    return response.data;
  },

  create: async (data: {
    shopId: number;
    date?: string;
    items: { stockId: number; quantity: number; unit: string; price: number }[];
  }): Promise<BillResponse> => {
    const response = await api.post<BillResponse>("/bills", data);
    return response.data;
  },

  getAll: async (): Promise<BillListResponse> => {
    const response = await api.get<BillListResponse>("/bills");
    return response.data;
  },

  getById: async (id: number): Promise<BillResponse> => {
    const response = await api.get<BillResponse>(`/bills/${id}`);
    return response.data;
  },

  update: async (id: number, data: {
    shopId?: number;
    date?: string;
    items?: { stockId: number; quantity: number; unit: string; price: number }[];
  }): Promise<BillResponse> => {
    const response = await api.put<BillResponse>(`/bills/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};
