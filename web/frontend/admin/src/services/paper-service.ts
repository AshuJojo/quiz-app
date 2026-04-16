import axios from 'axios';
import { CreatePaperInput, UpdatePaperInput } from '@/types/paper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const paperService = {
  getPapers: async (examId?: string, search?: string) => {
    const response = await axios.get(`${API_URL}/papers`, {
      params: { examId, search },
    });
    return response.data;
  },

  getPaper: async (id: string) => {
    const response = await axios.get(`${API_URL}/papers/${id}`);
    return response.data;
  },

  createPaper: async (data: CreatePaperInput) => {
    const response = await axios.post(`${API_URL}/papers`, data);
    return response.data;
  },

  updatePaper: async (id: string, data: UpdatePaperInput) => {
    const response = await axios.patch(`${API_URL}/papers/${id}`, data);
    return response.data;
  },

  deletePaper: async (id: string) => {
    const response = await axios.delete(`${API_URL}/papers/${id}`);
    return response.data;
  },
  bulkDeletePapers: async (ids: string[]) => {
    const response = await axios.delete(`${API_URL}/papers`, {
      data: { ids },
    });
    return response.data;
  },
};
