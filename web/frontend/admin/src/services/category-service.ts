import { Category, CategoryResponse } from '@/types/category';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const categoryService = {
  async getCategories(parentId: string | null = null): Promise<CategoryResponse> {
    const query = parentId ? `?parentId=${parentId}` : '?parentId=null';
    const response = await fetch(`${BASE_URL}/api/categories${query}`);
    return response.json();
  },

  async createCategory(data: Partial<Category>): Promise<CategoryResponse> {
    const response = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<CategoryResponse> {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCategory(id: string): Promise<CategoryResponse> {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
