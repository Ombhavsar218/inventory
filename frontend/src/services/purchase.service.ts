import api from "@/lib/axios";

export interface PurchaseOrderItem {
  id: number;
  stockId: number;
  quantity: number;
  unit: string;
  price: number;
  stock: { id: number; name: string; sku?: string | null; unit: string; mrp?: number | null; hsnCode?: string | null; gstRate?: number | null };
}

export interface PurchaseOrder {
  id: number;
  invoiceNumber: string | null;
  date: string;
  status: "PENDING" | "RECEIVED";
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdBy: number;
  creator: { id: number; fullName: string; role: string };
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseListResponse {
  success: boolean;
  purchases: PurchaseOrder[];
}

export interface PurchaseResponse {
  success: boolean;
  purchase: PurchaseOrder;
}

export const purchaseService = {
  getAll: async (params?: { date?: string; status?: string }): Promise<PurchaseListResponse> => {
    const response = await api.get<PurchaseListResponse>("/purchases", { params });
    return response.data;
  },

  getById: async (id: number): Promise<PurchaseResponse> => {
    const response = await api.get<PurchaseResponse>(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: {
    date?: string;
    invoiceNumber?: string;
    paidAmount?: number;
    items: { stockId: number; quantity: number; unit: string; price: number }[];
  }): Promise<PurchaseResponse> => {
    const response = await api.post<PurchaseResponse>("/purchases", data);
    return response.data;
  },

  update: async (id: number, data: {
    date?: string;
    invoiceNumber?: string;
    paidAmount?: number;
    status?: string;
    items?: { stockId: number; quantity: number; unit: string; price: number }[];
  }): Promise<PurchaseResponse> => {
    const response = await api.put<PurchaseResponse>(`/purchases/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<PurchaseResponse> => {
    const response = await api.patch<PurchaseResponse>(`/purchases/${id}/status`, { status });
    return response.data;
  },
};
