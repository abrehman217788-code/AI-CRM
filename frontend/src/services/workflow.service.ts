import api from '@/lib/api';
import type { Workflow } from '@/types';

export const workflowService = {
  getAll: () =>
    api.get<{ data: Workflow[] }>('/workflows').then(r => r.data.data),

  getById: (id: string) =>
    api.get<Workflow>(`/workflows/${id}`).then(r => r.data),

  create: (data: Partial<Workflow>) =>
    api.post<Workflow>('/workflows', data).then(r => r.data),

  update: (id: string, data: Partial<Workflow>) =>
    api.put<Workflow>(`/workflows/${id}`, data).then(r => r.data),

  toggle: (id: string) =>
    api.post<Workflow>(`/workflows/${id}/toggle`).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/workflows/${id}`).then(r => r.data),
};
