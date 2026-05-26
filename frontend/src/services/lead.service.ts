import api from '@/lib/api';
import type { Lead, LeadStatus, LeadSource, PaginatedResult, DashboardStats, FunnelStage, RepPerformance, PipelineSummary, AiInsights, AiRecommendations } from '@/types';

export const leadService = {
  getAll: (params?: any) => api.get<PaginatedResult<Lead>>('/leads', { params }).then(r => r.data),

  getById: (id: string) => api.get<Lead>(`/leads/${id}`).then(r => r.data),

  create: (data: Partial<Lead>) => api.post<Lead>('/leads', data).then(r => r.data),

  update: (id: string, data: Partial<Lead>) => api.put<Lead>(`/leads/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/leads/${id}`).then(r => r.data),

  bulkUpdate: (ids: string[], data: any) => api.post('/leads/bulk-update', { ids, data }).then(r => r.data),

  getDashboard: () => api.get<DashboardStats>('/analytics/dashboard').then(r => r.data),

  getFunnel: () => api.get<FunnelStage[]>('/analytics/funnel').then(r => r.data),

  getRepPerformance: () => api.get<RepPerformance[]>('/analytics/rep-performance').then(r => r.data),

  getPipelineSummary: () => api.get<PipelineSummary>('/pipeline/summary').then(r => r.data),

  getPipelineTrends: (days?: number) => api.get('/analytics/pipeline-trends', { params: { days } }).then(r => r.data),

  getKpis: () => api.get('/analytics/kpis').then(r => r.data),

  getLeadSourceRoi: () => api.get('/analytics/lead-source-roi').then(r => r.data),

  getAiInsights: (leadId: string) => api.get<AiInsights>(`/ai/insights/${leadId}`).then(r => r.data),

  getAiRecommendations: () => api.get<AiRecommendations>('/ai/recommendations').then(r => r.data),

  predictScore: (leadId: string) => api.get(`/ai/predict-score/${leadId}`).then(r => r.data),

  suggestEmail: (leadId: string, context?: string) => api.post(`/ai/suggest-email/${leadId}`, { context }).then(r => r.data),

  calculateScore: (leadId: string) => api.post(`/scoring/calculate/${leadId}`).then(r => r.data),

  enrichLead: (leadId: string) => api.post(`/enrichment/lead/${leadId}`).then(r => r.data),

  assignLead: (leadId: string) => api.post(`/routing/assign/${leadId}`).then(r => r.data),

  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },

  createActivity: (data: any) => api.post('/activities', data).then(r => r.data),
  getActivities: (leadId: string) => api.get(`/activities/lead/${leadId}`).then(r => r.data),

  createTask: (data: any) => api.post('/tasks', data).then(r => r.data),
  getMyTasks: (params?: any) => api.get('/tasks/my', { params }).then(r => r.data),
  completeTask: (id: string) => api.put(`/tasks/${id}/complete`).then(r => r.data),
};
