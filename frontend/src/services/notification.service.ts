import api from '@/lib/api';

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications/my', { params }).then(r => r.data),

  markRead: (id: string) =>
    api.post(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.post('/notifications/read-all').then(r => r.data),
};
