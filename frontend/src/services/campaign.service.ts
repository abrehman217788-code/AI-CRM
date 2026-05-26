import api from '@/lib/api';
import type { Campaign, PaginatedResult } from '@/types';

export const campaignService = {
  getAll: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
    api.get<PaginatedResult<Campaign>>('/campaigns', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Campaign>(`/campaigns/${id}`).then(r => r.data),

  create: (data: Partial<Campaign>) =>
    api.post<Campaign>('/campaigns', data).then(r => r.data),

  update: (id: string, data: Partial<Campaign>) =>
    api.put<Campaign>(`/campaigns/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/campaigns/${id}`).then(r => r.data),
};
