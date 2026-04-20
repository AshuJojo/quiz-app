import { apiClient } from '@/lib/api-client';

export interface Section {
  id: string;
  title: string;
  order: number;
  paperId: string;
  isDefault: boolean;
  positiveMarks?: number;
  negativeMarks?: number;
}

export const sectionService = {
  getSectionsByPaperId: async (paperId: string) => {
    const response = await apiClient.get(`/papers/${paperId}/sections`);
    return response.data;
  },

  createSections: async (sections: any[]) => {
    const response = await apiClient.post('/sections', { sections });
    return response.data;
  },

  updateSections: async (updates: any[]) => {
    const response = await apiClient.patch('/sections', { updates });
    return response.data;
  },

  deleteSections: async (ids: string[]) => {
    const response = await apiClient.delete('/sections', {
      data: { ids },
    });
    return response.data;
  },
};
