import api from "@/lib/axios";
import type { LoginFormData } from "@/validations/auth.schema";

export interface User {
  id: number;
  fullName: string;
  email?: string;
  role: "OWNER" | "MARKETING" | "API";
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse {
  success: boolean;
  user: User;
}

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>("/auth/me");
    return response.data;
  },
};
