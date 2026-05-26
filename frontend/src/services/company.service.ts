import api from '@/lib/api';
import type { Company, PaginatedResult } from '@/types';

export const companyService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; industry?: string }) =>
    api.get<PaginatedResult<Company>>('/companies', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Company>(`/companies/${id}`).then(r => r.data),

  create: (data: Partial<Company>) =>
    api.post<Company>('/companies', data).then(r => r.data),

  update: (id: string, data: Partial<Company>) =>
    api.put<Company>(`/companies/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/companies/${id}`).then(r => r.data),
};
