export type Category = 
  | 'plumbing' 
  | 'electrical' 
  | 'hvac' 
  | 'structural' 
  | 'safety' 
  | 'access' 
  | 'sanitation';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ProblemStatus = 'open' | 'investigating' | 'action_taken' | 'resolved';

export type VerificationStatus = 'unverified' | 'verified_related' | 'rejected_unrelated' | 'pending_field_check';

export type ReporterType = 'student' | 'faculty' | 'facility_staff' | 'visitor';

export interface TimelineEvent {
  id: string;
  observationId: string;
  timestamp: string;
  type: 
    | 'report_filed' 
    | 'ai_pattern_detected' 
    | 'field_inspected' 
    | 'relation_verified' 
    | 'relation_rejected' 
    | 'preventive_action' 
    | 'status_changed';
  title: string;
  description: string;
  actor: string;
  badgeType: 'report' | 'ai' | 'human' | 'action' | 'resolution';
}

export interface MatchSignal {
  type: 'location_proximity' | 'temporal_proximity' | 'symptom_overlap' | 'category_match';
  label: string;
  detail: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.35
}

export interface RelatedObservationMatch {
  targetObservationId: string;
  overallConfidence: number; // 0 - 100
  confidenceLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  signals: MatchSignal[];
  summaryExplanation: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface PlaybookAction {
  id: string;
  title: string;
  description: string;
  phase: 'immediate_safety' | 'root_cause_diagnosis' | 'recurrence_prevention';
  recommendedRole: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Playbook {
  id: string;
  observationId: string;
  category: Category;
  patternName: string;
  suggestedRationale: string;
  disclaimer: string;
  actions: PlaybookAction[];
}

export interface Observation {
  id: string;
  title: string;
  description: string;
  category: Category;
  building: string;
  specificLocation: string;
  timestamp: string;
  severity: Severity;
  status: ProblemStatus;
  reporterType: ReporterType;
  isSyntheticDemo: boolean;
  tags: string[];
  suggestedMatches: RelatedObservationMatch[];
  timeline: TimelineEvent[];
  playbook?: Playbook;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  building: string;
  severity: string;
  status: string;
  onlyRecurring: boolean;
}

export interface DashboardMetrics {
  totalObservations: number;
  openProblems: number;
  potentiallyRecurring: number;
  verifiedResolutions: number;
  recurrenceRiskIndex: 'Low' | 'Elevated' | 'High';
  activeBuildingsCount: number;
}
