import api from "@/lib/axios";

export interface BillItem {
  id: number;
  stockId: number;
  quantity: number;
  unit: string;
  price: number;
  stock: { id: number; name: string; sku?: string | null; unit: string };
}

export interface Bill {
  id: number;
  customerName: string;
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

export const billService = {
  create: async (data: {
    customerName: string;
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

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};
