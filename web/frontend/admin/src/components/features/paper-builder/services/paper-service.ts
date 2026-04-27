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

  /** Dedicated endpoint — the only way to change isPublished. */
  publishPaper: async (id: string, isPublished: boolean) => {
    const response = await apiClient.patch(`/papers/${id}/publish`, { isPublished });
    return response.data;
  },

  getVariants: async (id: string) => {
    const response = await apiClient.get(`/papers/${id}/variants`);
    return response.data;
  },

  createVariant: async (parentId: string, data: { language: string; title?: string }) => {
    const response = await apiClient.post(`/papers/${parentId}/variants`, data);
    return response.data;
  },

  deleteVariant: async (id: string) => {
    const response = await apiClient.delete(`/papers/${id}`);
    return response.data;
  },
};
