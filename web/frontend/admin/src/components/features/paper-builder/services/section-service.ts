import { apiClient } from '@/lib/api-client';

export const sectionService = {
  // Get sections in a paper (ordered by PaperSection.order)
  getSectionsByPaperId: async (paperId: string) => {
    const response = await apiClient.get(`/papers/${paperId}/sections`);
    return response.data;
  },

  // Get all sections for an exam
  getSectionsByExamId: async (examId: string) => {
    const response = await apiClient.get(`/exams/${examId}/sections`);
    return response.data;
  },

  // Create sections under an exam
  createSections: async (sections: { examId: string; title: string }[]) => {
    const response = await apiClient.post('/sections', { sections });
    return response.data;
  },

  // Update section titles (exam-level)
  updateSections: async (updates: { id: string; title: string }[]) => {
    const response = await apiClient.patch('/sections', { updates });
    return response.data;
  },

  deleteSections: async (ids: string[]) => {
    const response = await apiClient.delete('/sections', { data: { ids } });
    return response.data;
  },
};
