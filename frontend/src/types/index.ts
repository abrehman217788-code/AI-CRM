export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  SDR = 'SDR',
  AE = 'AE',
  READ_ONLY = 'READ_ONLY',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  DISQUALIFIED = 'DISQUALIFIED',
  MQL = 'MQL',
  SQL = 'SQL',
  OPPORTUNITY = 'OPPORTUNITY',
  CONVERTED = 'CONVERTED',
  ARCHIVED = 'ARCHIVED',
}

export enum LeadSource {
  WEBSITE_FORM = 'WEBSITE_FORM',
  LANDING_PAGE = 'LANDING_PAGE',
  CHAT_WIDGET = 'CHAT_WIDGET',
  LINKEDIN_IMPORT = 'LINKEDIN_IMPORT',
  CSV_UPLOAD = 'CSV_UPLOAD',
  API_INGESTION = 'API_INGESTION',
  AD_PLATFORM = 'AD_PLATFORM',
  MANUAL = 'MANUAL',
  REFERRAL = 'REFERRAL',
}

export enum OpportunityStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  NEED_ANALYSIS = 'NEED_ANALYSIS',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  score: number;
  aiScore: number;
  status: LeadStatus;
  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  notes?: string;
  ownerId?: string;
  companyId?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  owner?: Partial<User>;
  contacts?: Contact[];
  activities?: Activity[];
  tasks?: Task[];
  opportunities?: Opportunity[];
  leadScores?: LeadScore[];
  _count?: { activities: number; tasks: number; opportunities: number };
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
  revenue?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  foundedYear?: number;
  technologies?: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number; opportunities: number };
}

export interface Contact {
  id: string;
  leadId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  role?: string;
  isPrimary: boolean;
}

export interface Opportunity {
  id: string;
  leadId: string;
  companyId?: string;
  ownerId?: string;
  name: string;
  stage: OpportunityStage;
  value: number;
  currency: string;
  probability: number;
  forecastDate?: string;
  closeDate?: string;
  notes?: string;
  createdAt: string;
  lead?: Partial<Lead>;
  company?: Company;
  owner?: Partial<User>;
}

export interface Activity {
  id: string;
  leadId: string;
  userId?: string;
  type: string;
  subject?: string;
  description?: string;
  duration?: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  user?: Partial<User>;
}

export interface Task {
  id: string;
  leadId?: string;
  userId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  aiGenerated?: boolean;
  lead?: Partial<Lead>;
  createdAt: string;
  updatedAt: string;
}

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  ownerId?: string;
  steps: SequenceStep[];
  owner?: Partial<User>;
  createdAt: string;
}

export interface SequenceStep {
  id: string;
  sequenceId: string;
  order: number;
  type: string;
  subject?: string;
  content?: string;
  delayDays: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  source: LeadSource;
  budget: number;
  spent: number;
  leadsGenerated: number;
  conversions: number;
  revenue: number;
  roi: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: string;
  triggerConfig?: any;
  conditions?: any;
  actions?: any;
  runCount: number;
  lastRunAt?: string;
  createdAt: string;
}

export interface LeadScore {
  id: string;
  leadId: string;
  score: number;
  factor: string;
  reason?: string;
  aiScore?: number;
  confidence?: number;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  mqls: number;
  sqls: number;
  opportunities: number;
  wonOpportunities: number;
  pipelineValue: number;
  wonValue: number;
  leadConversionRate: number;
  winRate: number;
}

export interface FunnelStage {
  name: string;
  count: number;
}

export interface PipelineSummary {
  stages: { stage: string; count: number; value: number }[];
  totalValue: number;
  wonValue: number;
  forecastValue: number;
  winRate: number;
}

export interface RepPerformance {
  id: string;
  name: string;
  email: string;
  role: string;
  leadsAssigned: number;
  activities: number;
  opportunities: number;
}

export interface AiInsights {
  conversionProbability: number;
  engagementScore: number;
  intentSignal: { level: string; signals: string[] };
  nextBestAction: string;
  suggestedActions: string[];
  insights: string[];
}

export interface AiRecommendations {
  priorityLeads: { id: string; name: string; score: number; aiScore: number; suggestedAction: string }[];
  summary: { totalActive: number; avgScore: number; highPriority: number };
}
