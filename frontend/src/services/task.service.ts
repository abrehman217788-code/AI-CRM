import api from '@/lib/api';
import type { Task, PaginatedResult } from '@/types';

export const taskService = {
  getAll: (params?: { page?: number; limit?: number; status?: string; priority?: string; leadId?: string }) =>
    api.get<PaginatedResult<Task>>('/tasks', { params }).then(r => r.data),

  getMyTasks: (params?: { status?: string }) =>
    api.get<{ data: Task[]; meta: any }>('/tasks/my', { params }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<Task>(`/tasks/${id}`).then(r => r.data),

  create: (data: Partial<Task>) =>
    api.post<Task>('/tasks', data).then(r => r.data),

  update: (id: string, data: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, data).then(r => r.data),

  complete: (id: string) =>
    api.put<Task>(`/tasks/${id}/complete`).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then(r => r.data),
};
