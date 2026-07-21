import api from "@/lib/axios";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "SUPERADMIN" | "OWNER" | "MARKETING" | "API";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { bills: number; stockItems: number; purchaseOrders: number };
}

export interface UserListResponse {
  success: boolean;
  users: User[];
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export const userService = {
  getAll: async (): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>("/users");
    return response.data;
  },

  getById: async (id: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    isActive?: boolean;
  }): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    }
  ): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>(`/users/${id}/toggle-status`);
    return response.data;
  },
};
