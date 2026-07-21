import api from "@/lib/axios";

export interface StockItem {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  price: number;
  mrp: number | null;
  hsnCode: string | null;
  gstRate: number | null;
  minStock: number;
  description: string | null;
  ownerId: number;
  createdAt: string;
}

export interface StockListResponse {
  success: boolean;
  stocks: StockItem[];
}

export interface StockResponse {
  success: boolean;
  stock: StockItem;
}

export const stockService = {
  create: async (data: {
    name: string;
    sku?: string;
    quantity: number;
    unit: string;
    price: number;
    mrp?: number;
    hsnCode?: string;
    gstRate?: number;
    minStock?: number;
    description?: string;
  }): Promise<StockResponse> => {
    const response = await api.post<StockResponse>("/stocks", data);
    return response.data;
  },

  getAll: async (): Promise<StockListResponse> => {
    const response = await api.get<StockListResponse>("/stocks");
    return response.data;
  },

  getById: async (id: number): Promise<StockResponse> => {
    const response = await api.get<StockResponse>(`/stocks/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      name: string;
      sku?: string;
      quantity: number;
      unit: string;
      price: number;
      mrp?: number;
      hsnCode?: string;
      gstRate?: number;
      minStock?: number;
      description?: string;
    }
  ): Promise<StockResponse> => {
    const response = await api.put<StockResponse>(`/stocks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/stocks/${id}`);
    return response.data;
  },
};
