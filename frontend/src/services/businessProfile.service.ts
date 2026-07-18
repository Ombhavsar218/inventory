import api from "@/lib/axios";

export interface BusinessProfile {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  stateCode: string | null;
  gstNo: string | null;
  fssaiNo: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankBranch: string | null;
  bankIFSC: string | null;
  createdAt: string;
}

export interface BusinessProfileResponse {
  success: boolean;
  profile: BusinessProfile;
}

export const businessProfileService = {
  get: async (): Promise<BusinessProfileResponse> => {
    const response = await api.get<BusinessProfileResponse>("/business-profile");
    return response.data;
  },

  update: async (data: Partial<BusinessProfile>): Promise<BusinessProfileResponse> => {
    const response = await api.put<BusinessProfileResponse>("/business-profile", data);
    return response.data;
  },
};
