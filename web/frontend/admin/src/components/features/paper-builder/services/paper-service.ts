import { apiClient } from '@/lib/api-client';

export const paperService = {
  getPaper: async (id: string) => {
    const response = await apiClient.get(`/papers/${id}`);
    return response.data;
  },

  updatePaper: async (id: string, data: any) => {
    const response = await apiClient.patch(`/papers/${id}`, data);
    return response.data;
  },
};
