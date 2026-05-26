import api from '@/lib/api';
import type { Activity } from '@/types';

export const activityService = {
  getByLead: (leadId: string) =>
    api.get<{ data: Activity[]; meta: any }>(`/activities/lead/${leadId}`).then(r => r.data.data),

  create: (data: Partial<Activity>) =>
    api.post<Activity>('/activities', data).then(r => r.data),

  update: (id: string, data: Partial<Activity>) =>
    api.put<Activity>(`/activities/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/activities/${id}`).then(r => r.data),
};
