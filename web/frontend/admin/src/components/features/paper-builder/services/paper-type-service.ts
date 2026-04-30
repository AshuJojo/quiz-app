import { apiClient } from '@/lib/api-client';

export const paperTypeService = {
  getByExamId: async (examId: string) => {
    const response = await apiClient.get('/paper-types', { params: { examId } });
    return response.data;
  },

  create: async (examId: string, name: string) => {
    const response = await apiClient.post('/paper-types', { examId, name });
    return response.data;
  },

  update: async (id: string, name: string) => {
    const response = await apiClient.patch(`/paper-types/${id}`, { name });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/paper-types/${id}`);
    return response.data;
  },
};
