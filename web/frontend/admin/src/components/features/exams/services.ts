import { apiClient } from '@/lib/api-client';
import { CreateExamInput, UpdateExamInput } from './types';

export const examService = {
  getExams: async (
    parentId: string | null = null,
    page: number = 1,
    limit: number | 'all' = 10,
    search?: string
  ) => {
    const response = await apiClient.get('/exams', {
      params: {
        parentId: parentId ?? 'null',
        page,
        limit,
        search,
      },
    });
    return response.data;
  },

  getAllExams: async (page?: number, limit?: number) => {
    const response = await apiClient.get('/exams', {
      params: { page, limit },
    });
    return response.data;
  },

  getExam: async (id: string) => {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  },

  createExam: async (data: CreateExamInput) => {
    const response = await apiClient.post('/exams', data);
    return response.data;
  },

  updateExam: async (id: string, data: UpdateExamInput) => {
    const response = await apiClient.patch(`/exams/${id}`, data);
    return response.data;
  },

  deleteExam: async (id: string) => {
    const response = await apiClient.delete(`/exams/${id}`);
    return response.data;
  },

  bulkDeleteExams: async (ids: string[]) => {
    const response = await apiClient.delete('/exams', {
      data: { ids },
    });
    return response.data;
  },
};
