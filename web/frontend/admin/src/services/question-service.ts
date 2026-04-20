import { apiClient } from '@/lib/api-client';

export const questionService = {
  getQuestions: async (paperId: string) => {
    const response = await apiClient.get(`/papers/${paperId}/questions`);
    return response.data;
  },

  createQuestions: async (questions: any[]) => {
    const response = await apiClient.post('/questions', { questions });
    return response.data;
  },

  updateQuestion: async (id: string, data: any) => {
    const response = await apiClient.patch(`/questions/${id}`, data);
    return response.data;
  },

  updateQuestions: async (updates: any[]) => {
    const response = await apiClient.patch('/questions', { updates });
    return response.data;
  },

  deleteQuestion: async (id: string) => {
    const response = await apiClient.delete(`/questions/${id}`);
    return response.data;
  },

  deleteQuestions: async (ids: string[]) => {
    const response = await apiClient.delete('/questions', {
      data: { ids },
    });
    return response.data;
  },
};
