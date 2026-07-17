import api from "@/lib/axios";

export interface Shop {
  id: number;
  name: string;
  address: string;
  gstNo: string | null;
  fssaiNo: string | null;
  ownerId: number;
  owner: { id: number; fullName: string };
  createdAt: string;
}

export interface ShopListResponse {
  success: boolean;
  shops: Shop[];
}

export interface ShopResponse {
  success: boolean;
  shop: Shop;
}

export const shopService = {
  create: async (data: { name: string; address: string; gstNo?: string; fssaiNo?: string }): Promise<ShopResponse> => {
    const response = await api.post<ShopResponse>("/shops", data);
    return response.data;
  },

  getAll: async (): Promise<ShopListResponse> => {
    const response = await api.get<ShopListResponse>("/shops");
    return response.data;
  },

  getById: async (id: number): Promise<ShopResponse> => {
    const response = await api.get<ShopResponse>(`/shops/${id}`);
    return response.data;
  },

  update: async (id: number, data: { name: string; address: string; gstNo?: string; fssaiNo?: string }): Promise<ShopResponse> => {
    const response = await api.put<ShopResponse>(`/shops/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/shops/${id}`);
    return response.data;
  },
};
