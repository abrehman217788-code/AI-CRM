import api from '@/lib/api';

export const chatbotService = {
  sendMessage: (visitorId: string, message: string, leadId?: string) =>
    api.post('/chatbot/message', { visitorId, message, leadId }).then(r => r.data),

  getSessions: (params?: { page?: number; limit?: number }) =>
    api.get('/chatbot/sessions', { params }).then(r => r.data),
};
