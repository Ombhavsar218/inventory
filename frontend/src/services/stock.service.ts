import api from "@/lib/axios";

export interface StockItem {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  price: number;
  minStock: number;
  description: string | null;
  shopId: number | null;
  shop: { id: number; name: string } | null;
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
    minStock?: number;
    description?: string;
    shopId?: number;
  }): Promise<StockResponse> => {
    const response = await api.post<StockResponse>("/stocks", data);
    return response.data;
  },

  getAll: async (shopId?: number): Promise<StockListResponse> => {
    const params = shopId ? { shopId } : {};
    const response = await api.get<StockListResponse>("/stocks", { params });
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
      minStock?: number;
      description?: string;
      shopId?: number;
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
