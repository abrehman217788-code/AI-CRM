import api from '@/lib/api';
import type { Sequence } from '@/types';

export const sequenceService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: Sequence[]; meta: any }>('/sequences', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Sequence>(`/sequences/${id}`).then(r => r.data),

  create: (data: Partial<Sequence> & { steps?: any[] }) =>
    api.post<Sequence>('/sequences', data).then(r => r.data),

  update: (id: string, data: Partial<Sequence>) =>
    api.put<Sequence>(`/sequences/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/sequences/${id}`).then(r => r.data),

  addStep: (sequenceId: string, step: any) =>
    api.post(`/sequences/${sequenceId}/steps`, step).then(r => r.data),

  updateStep: (stepId: string, data: any) =>
    api.put(`/sequences/steps/${stepId}`, data).then(r => r.data),

  removeStep: (stepId: string) =>
    api.delete(`/sequences/steps/${stepId}`).then(r => r.data),
};
