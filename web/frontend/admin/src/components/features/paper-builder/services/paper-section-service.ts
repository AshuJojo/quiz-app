import { apiClient } from '@/lib/api-client';

export const paperSectionService = {
  addSectionsToPaper: async (paperId: string, sectionIds: string[]) => {
    const response = await apiClient.post(`/papers/${paperId}/sections`, { sectionIds });
    return response.data;
  },

  removeSectionFromPaper: async (paperId: string, sectionId: string) => {
    const response = await apiClient.delete(`/papers/${paperId}/sections/${sectionId}`);
    return response.data;
  },

  reorderPaperSections: async (
    paperId: string,
    updates: { sectionId: string; order: number }[]
  ) => {
    const response = await apiClient.patch(`/papers/${paperId}/sections`, { updates });
    return response.data;
  },
};
