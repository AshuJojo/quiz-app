import { CreateExamInput, UpdateExamInput } from '@/types/exam';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const examService = {
  getExams: async (parentId: string | null = null) => {
    const response = await axios.get(`${API_URL}/exams`, {
      params: { parentId },
    });
    return response.data;
  },

  getAllExams: async () => {
    const response = await axios.get(`${API_URL}/exams`);
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
};
