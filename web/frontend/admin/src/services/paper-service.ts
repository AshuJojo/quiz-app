import { apiClient } from '@/lib/api-client';
import { CreatePaperInput, UpdatePaperInput } from '@/types/paper';

export const paperService = {
  getPapers: async (examId?: string, search?: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('/papers', {
      params: { examId, search, page, limit },
    });
    return response.data;
  },

  getPaper: async (id: string) => {
    const response = await apiClient.get(`/papers/${id}`);
    return response.data;
  },

  createPaper: async (data: CreatePaperInput) => {
    const response = await apiClient.post('/papers', data);
    return response.data;
  },

  updatePaper: async (id: string, data: UpdatePaperInput) => {
    const response = await apiClient.patch(`/papers/${id}`, data);
    return response.data;
  },

  deletePaper: async (id: string) => {
    const response = await apiClient.delete(`/papers/${id}`);
    return response.data;
  },

  bulkDeletePapers: async (ids: string[]) => {
    const response = await apiClient.delete('/papers', {
      data: { ids },
    });
    return response.data;
  },
};
