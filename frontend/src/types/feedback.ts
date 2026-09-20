export type WorkflowStage = 'inbox' | 'triaged' | 'encapsulated' | 'backlog' | 'in_progress' | 'resolved';

export type PriorityLevel = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';

export type CustomerTier = 'ENTERPRISE_VIP' | 'ENTERPRISE' | 'MID_MARKET' | 'SMB';

export type FeedbackCategory = 
  | 'SECURITY_COMPLIANCE' 
  | 'PERFORMANCE_SLA' 
  | 'INTEGRATION_API' 
  | 'USER_EXPERIENCE' 
  | 'ANALYTICS_REPORTING' 
  | 'BILLING_GOVERNANCE';

export type SentimentScore = 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE';

export interface CustomerAccount {
  id: string;
  name: string;
  tier: CustomerTier;
  annualRevenue: string; // e.g. "$450,000/yr"
  logoInitial: string;
  slaTierHours: number; // e.g., 4, 12, 24, 48
}

export interface EncapsulatedSpec {
  id: string;
  feedbackId: string;
  title: string;
  coreProblem: string;
  businessImpact: string;
  technicalScope: string[];
  acceptanceCriteria: string[];
  suggestedPriority: PriorityLevel;
  targetEpicLink?: string;
  encapsulatedBy: string;
  encapsulatedAt: string;
  confidenceScore: number; // 0 - 100%
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface FeedbackComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  message: string;
}

export interface FeedbackItem {
  id: string;
  code: string; // e.g., FB-1092
  title: string;
  rawContent: string;
  category: FeedbackCategory;
  priority: PriorityLevel;
  stage: WorkflowStage;
  account: CustomerAccount;
  sentiment: SentimentScore;
  submittedBy: string;
  submittedAt: string;
  slaDeadline: string; // ISO string
  isSlaBreached: boolean;
  encapsulatedSpec?: EncapsulatedSpec;
  auditTrail: AuditLog[];
  comments: FeedbackComment[];
  tags: string[];
}

export type Role = 'SUPPORT_SPECIALIST' | 'PRODUCT_MANAGER' | 'ENTERPRISE_ADMIN' | 'CUSTOMER_REP' | 'ENGINEERING_LEAD';
export type Theme = 'dark' | 'light';

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  details: string | null;
}

export interface UserPersona {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatar: string;
  email: string;
  permissions: string[];
  settings?: {
    theme?: Theme;
  };
  token?: string;
}
