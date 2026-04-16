import { CreateExamInput, UpdateExamInput } from '@/types/exam';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const examService = {
  getExams: async (
    parentId: string | null = null,
    page: number = 1,
    limit: number | 'all' = 10,
    search?: string
  ) => {
    const response = await axios.get(`${API_URL}/exams`, {
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
    const response = await axios.get(`${API_URL}/exams`, {
      params: { page, limit },
    });
    return response.data;
  },

  getExam: async (id: string) => {
    const response = await axios.get(`${API_URL}/exams/${id}`);
    return response.data;
  },

  createExam: async (data: CreateExamInput) => {
    const response = await axios.post(`${API_URL}/exams`, data);
    return response.data;
  },

  updateExam: async (id: string, data: UpdateExamInput) => {
    const response = await axios.patch(`${API_URL}/exams/${id}`, data);
    return response.data;
  },

  deleteExam: async (id: string) => {
    const response = await axios.delete(`${API_URL}/exams/${id}`);
    return response.data;
  },
  bulkDeleteExams: async (ids: string[]) => {
    const response = await axios.delete(`${API_URL}/exams`, {
      data: { ids },
    });
    return response.data;
  },
};
