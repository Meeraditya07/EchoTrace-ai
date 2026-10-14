import type { DashboardMetrics, Observation, ProblemStatus, VerificationStatus } from '../types';
import { generatePlaybookForObservation } from './playbookEngine';
import { findSuggestedMatches } from './similarityEngine';

const STORAGE_KEY = 'echotrace_ai_observations_v1';

export const SEED_OBSERVATIONS: Observation[] = [
  {
    id: 'OBS-2026-001',
    title: 'Ceiling water leak dripping onto walkway',
    description: 'Noticed continuous water dripping from the ceiling acoustic tiles directly into the pedestrian walkway outside Chemistry Lab 204. Small puddle forming on linoleum tiles.',
    category: 'plumbing',
    building: 'Curie Science Hall',
    specificLocation: '2nd Floor Corridor, outside Chemistry Lab 204',
    timestamp: '2026-10-05T08:30:00.000Z',
    severity: 'medium',
    status: 'investigating',
    reporterType: 'faculty',
    isSyntheticDemo: true,
    tags: ['water', 'ceiling', 'leak', 'lab-204'],
    suggestedMatches: [],
    timeline: [
      {
        id: 'tl-001-1',
        observationId: 'OBS-2026-001',
        timestamp: '2026-10-05T08:30:00.000Z',
        type: 'report_filed',
        title: 'Initial Report Submitted',
        description: 'Reported by Dr. K. Henderson (Faculty). Water dripping from ceiling tiles.',
        actor: 'Faculty Reporter',
        badgeType: 'report'
      },
      {
        id: 'tl-001-2',
        observationId: 'OBS-2026-001',
        timestamp: '2026-10-05T10:15:00.000Z',
        type: 'preventive_action',
        title: 'Temporary Catch Bucket Placed',
        description: 'Custodial team placed standard bucket and caution cone beneath drip spot.',
        actor: 'Zone Custodial Crew',
        badgeType: 'action'
      }
    ]
  },
  {
    id: 'OBS-2026-002',
    title: 'Extremely slippery hallway floor near lab entrance',
    description: 'Corridor floor is very slick right near the entrance to Lab 204. Several students almost slipped while rushing to organic chemistry lecture. Looks like moisture on smooth tile.',
    category: 'safety',
    building: 'Curie Science Hall',
    specificLocation: '2nd Floor Corridor, entrance to Lab 204',
    timestamp: '2026-10-07T10:15:00.000Z',
    severity: 'high',
    status: 'investigating',
    reporterType: 'student',
    isSyntheticDemo: true,
    tags: ['slippery', 'hazard', 'wet', 'lab-204'],
    suggestedMatches: [
      {
        targetObservationId: 'OBS-2026-001',
        overallConfidence: 89,
        confidenceLevel: 'Very High',
        signals: [
          {
            type: 'location_proximity',
            label: 'Physical Proximity',
            detail: 'Exact area match in Curie Science Hall (corridor, lab-204)',
            score: 95,
            weight: 0.35
          },
          {
            type: 'temporal_proximity',
            label: 'Temporal Sequence',
            detail: '49 hours after prior observation — active recurrence sequence',
            score: 85,
            weight: 0.25
          },
          {
            type: 'symptom_overlap',
            label: 'Symptom & Keyword Overlap',
            detail: 'Shared symptom signals: ["water", "slippery", "wet", "hazard"]',
            score: 85,
            weight: 0.30
          },
          {
            type: 'category_match',
            label: 'Category Alignment',
            detail: 'Interdependent categories (safety & plumbing) known to produce secondary hazards',
            score: 75,
            weight: 0.10
          }
        ],
        summaryExplanation: 'Detected in Curie Science Hall (2nd Floor Corridor, near Lab 204) 49 hours after Report #OBS-2026-001. Water/slip symptoms coincide directly. AI flags this as potentially related recurrence; physical inspection needed to verify if overhead leak caused floor slickness.',
        verificationStatus: 'verified_related',
        verificationNotes: 'Maintenance Tech R. Sanchez confirmed bucket overflowed and splashed surrounding tile floor during evening hours.',
        verifiedBy: 'Facility Maintenance Supervisor',
        verifiedAt: '2026-10-07T12:00:00.000Z'
      }
    ],
    timeline: [
      {
        id: 'tl-002-1',
        observationId: 'OBS-2026-002',
        timestamp: '2026-10-07T10:15:00.000Z',
        type: 'report_filed',
        title: 'Hazard Reported',
        description: 'Anonymous student reported hazardous slippery floor near Lab 204.',
        actor: 'Student Reporter',
        badgeType: 'report'
      },
      {
        id: 'tl-002-2',
        observationId: 'OBS-2026-002',
        timestamp: '2026-10-07T10:16:00.000Z',
        type: 'ai_pattern_detected',
        title: 'EchoTrace Pattern Triggered',
        description: 'AI correlated with OBS-2026-001 (89% match). Flagged potential link between ceiling water leak and slippery floor.',
        actor: 'EchoTrace Engine v1.2',
        badgeType: 'ai'
      },
      {
        id: 'tl-002-3',
        observationId: 'OBS-2026-002',
        timestamp: '2026-10-07T12:00:00.000Z',
        type: 'relation_verified',
        title: 'Human Field Verification Confirmed',
        description: 'Supervisor verified relation: Catch bucket overflowed, soaking the walkway floor.',
        actor: 'Facility Supervisor',
        badgeType: 'human'
      }
    ]
  },
  {
    id: 'OBS-2026-003',
    title: 'Floor is wet again around Lab 204 walkway',
    description: 'The floor outside Lab 204 is wet again despite being mopped yesterday. Puddle has spread across two tile joints. Water seems to be recurring from the same spot.',
    category: 'plumbing',
    building: 'Curie Science Hall',
    specificLocation: '2nd Floor Corridor outside Lab 204',
    timestamp: '2026-10-09T14:45:00.000Z',
    severity: 'high',
    status: 'open',
    reporterType: 'facility_staff',
    isSyntheticDemo: true,
    tags: ['water', 'wet', 'puddle', 'lab-204', 'repeat'],
    suggestedMatches: [
      {
        targetObservationId: 'OBS-2026-002',
        overallConfidence: 91,
        confidenceLevel: 'Very High',
        signals: [
          {
            type: 'location_proximity',
            label: 'Physical Proximity',
            detail: 'Exact area match in Curie Science Hall (Lab 204 corridor)',
            score: 95,
            weight: 0.35
          },
          {
            type: 'temporal_proximity',
            label: 'Temporal Sequence',
            detail: '52 hours after prior slippery floor observation',
            score: 85,
            weight: 0.25
          },
          {
            type: 'symptom_overlap',
            label: 'Symptom & Keyword Overlap',
            detail: 'Shared symptom signals: ["water", "wet", "puddle", "repeat"]',
            score: 90,
            weight: 0.30
          },
          {
            type: 'category_match',
            label: 'Category Alignment',
            detail: 'Interdependent categories (plumbing & safety)',
            score: 75,
            weight: 0.10
          }
        ],
        summaryExplanation: 'Third sequential recurrence in Curie Science Hall Lab 204 within 4 days. Demonstrates persistent moisture source that surface mopping does not address.',
        verificationStatus: 'unverified'
      },
      {
        targetObservationId: 'OBS-2026-001',
        overallConfidence: 87,
        confidenceLevel: 'Very High',
        signals: [
          {
            type: 'location_proximity',
            label: 'Physical Proximity',
            detail: 'Identical ceiling leak origin zone outside Lab 204',
            score: 95,
            weight: 0.35
          },
          {
            type: 'temporal_proximity',
            label: 'Temporal Sequence',
            detail: '102 hours (~4.2 days) after initial leak report',
            score: 75,
            weight: 0.25
          },
          {
            type: 'symptom_overlap',
            label: 'Symptom & Keyword Overlap',
            detail: 'Shared symptom signals: ["water", "leak", "puddle", "ceiling"]',
            score: 85,
            weight: 0.30
          },
          {
            type: 'category_match',
            label: 'Category Alignment',
            detail: 'Exact category match: PLUMBING',
            score: 90,
            weight: 0.10
          }
        ],
        summaryExplanation: 'Strong chronological recurrence indicating that the initial leak was never permanently resolved and continues to cause downstream hazards.',
        verificationStatus: 'unverified'
      }
    ],
    timeline: [
      {
        id: 'tl-003-1',
        observationId: 'OBS-2026-003',
        timestamp: '2026-10-09T14:45:00.000Z',
        type: 'report_filed',
        title: 'Recurrence Observation Reported',
        description: 'Custodial staff flagged recurring puddle after weekend cleaning.',
        actor: 'Facility Custodian',
        badgeType: 'report'
      },
      {
        id: 'tl-003-2',
        observationId: 'OBS-2026-003',
        timestamp: '2026-10-09T14:46:00.000Z',
        type: 'ai_pattern_detected',
        title: 'Recurrent Pattern Flagged (3-Incident Cluster)',
        description: 'EchoTrace AI identified a 3-stage temporal pattern across 4 days. Preventive playbook generated for piping inspection.',
        actor: 'EchoTrace Engine v1.2',
        badgeType: 'ai'
      }
    ]
  },
  {
    id: 'OBS-2026-004',
    title: 'Circuit breaker trip in computer lab during class',
    description: 'Power cut out to Rows 3 and 4 workstations. Breaker Panel 2B tripped with a faint electrical click. Professor had to switch to whiteboard lecture.',
    category: 'electrical',
    building: 'Turing Engineering Center',
    specificLocation: 'Ground Floor, Room 102 (Graphics Lab)',
    timestamp: '2026-10-10T11:20:00.000Z',
    severity: 'medium',
    status: 'open',
    reporterType: 'faculty',
    isSyntheticDemo: true,
    tags: ['breaker', 'power', 'graphics-lab', 'circuit'],
    suggestedMatches: [],
    timeline: [
      {
        id: 'tl-004-1',
        observationId: 'OBS-2026-004',
        timestamp: '2026-10-10T11:20:00.000Z',
        type: 'report_filed',
        title: 'Breaker Trip Reported',
        description: 'Faculty reported sudden circuit trip on graphics lab workstations.',
        actor: 'CS Dept Faculty',
        badgeType: 'report'
      }
    ]
  },
  {
    id: 'OBS-2026-005',
    title: 'Exterior security door latch failing to catch',
    description: 'The heavy exterior emergency exit door does not latch shut automatically unless pulled hard. Remains ajar by half an inch, allowing unauthorized entry from quad.',
    category: 'access',
    building: 'Oak Student Dormitory',
    specificLocation: 'West Wing Ground Exit, near Bike Racks',
    timestamp: '2026-10-11T16:00:00.000Z',
    severity: 'high',
    status: 'open',
    reporterType: 'student',
    isSyntheticDemo: true,
    tags: ['door', 'latch', 'security', 'dormitory'],
    suggestedMatches: [],
    timeline: [
      {
        id: 'tl-005-1',
        observationId: 'OBS-2026-005',
        timestamp: '2026-10-11T16:00:00.000Z',
        type: 'report_filed',
        title: 'Access Hazard Reported',
        description: 'Student resident reported unsecured exterior door.',
        actor: 'Resident Student',
        badgeType: 'report'
      }
    ]
  },
  {
    id: 'OBS-2026-006',
    title: 'HVAC chilled air cut off, room temperature reached 82°F',
    description: 'Central supply diffuser is blowing warm stagnant air. Students complaining of stifling heat during 2-hour lecture.',
    category: 'hvac',
    building: 'Turing Engineering Center',
    specificLocation: '2nd Floor, Lecture Hall B',
    timestamp: '2026-10-12T09:30:00.000Z',
    severity: 'medium',
    status: 'investigating',
    reporterType: 'faculty',
    isSyntheticDemo: true,
    tags: ['hvac', 'temperature', 'vent', 'hot'],
    suggestedMatches: [],
    timeline: [
      {
        id: 'tl-006-1',
        observationId: 'OBS-2026-006',
        timestamp: '2026-10-12T09:30:00.000Z',
        type: 'report_filed',
        title: 'HVAC Failure Reported',
        description: 'Reported by instructor during morning lecture.',
        actor: 'Faculty Member',
        badgeType: 'report'
      }
    ]
  }
];

// Initialize playbooks for seed data
SEED_OBSERVATIONS.forEach(obs => {
  obs.playbook = generatePlaybookForObservation(obs);
});

export function getObservations(): Observation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveObservations(SEED_OBSERVATIONS);
      return SEED_OBSERVATIONS;
    }
    const parsed = JSON.parse(raw) as Observation[];
    return parsed;
  } catch (err) {
    console.error('Failed to load observations from localStorage:', err);
    return SEED_OBSERVATIONS;
  }
}

export function saveObservations(observations: Observation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
  } catch (err) {
    console.error('Failed to save observations to localStorage:', err);
  }
}

export function createObservation(input: {
  title: string;
  description: string;
  category: Observation['category'];
  building: string;
  specificLocation: string;
  severity: Observation['severity'];
  reporterType: Observation['reporterType'];
  timestamp?: string;
  tags?: string[];
}): Observation {
  const currentObservations = getObservations();
  const nextNum = currentObservations.length + 1;
  const id = `OBS-2026-${String(nextNum).padStart(3, '0')}`;
  const timestamp = input.timestamp || new Date().toISOString();

  // Create partial observation for similarity comparison
  const candidate: Observation = {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    building: input.building.trim(),
    specificLocation: input.specificLocation.trim(),
    timestamp,
    severity: input.severity,
    status: 'open',
    reporterType: input.reporterType || 'student',
    isSyntheticDemo: false,
    tags: input.tags || [],
    suggestedMatches: [],
    timeline: [
      {
        id: `tl-${id}-1`,
        observationId: id,
        timestamp,
        type: 'report_filed',
        title: 'Observation Submitted',
        description: `Logged in ${input.building} (${input.specificLocation}). Severity: ${input.severity.toUpperCase()}.`,
        actor: input.reporterType === 'facility_staff' ? 'Facility Staff' : 'Campus Reporter',
        badgeType: 'report'
      }
    ]
  };

  // Run AI Similarity Engine
  const matches = findSuggestedMatches(candidate, currentObservations);
  candidate.suggestedMatches = matches;

  // If matches were found, add an AI timeline event
  if (matches.length > 0) {
    const bestMatch = matches[0];
    candidate.timeline.push({
      id: `tl-${id}-ai-match`,
      observationId: id,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      type: 'ai_pattern_detected',
      title: `Potential Recurrence Detected (${bestMatch.overallConfidence}% confidence)`,
      description: `AI correlated with #${bestMatch.targetObservationId}. ${bestMatch.summaryExplanation}`,
      actor: 'EchoTrace Engine v1.2',
      badgeType: 'ai'
    });
  }

  // Generate Contextual Prevention Playbook
  candidate.playbook = generatePlaybookForObservation(candidate);

  const updated = [candidate, ...currentObservations];
  saveObservations(updated);
  return candidate;
}

export function updateObservationStatus(
  id: string,
  newStatus: ProblemStatus,
  notes?: string,
  actor: string = 'Facility Operations'
): Observation | null {
  const observations = getObservations();
  const index = observations.findIndex(o => o.id === id);
  if (index === -1) return null;

  const target = observations[index];
  target.status = newStatus;

  target.timeline.push({
    id: `tl-${id}-${Date.now()}`,
    observationId: id,
    timestamp: new Date().toISOString(),
    type: 'status_changed',
    title: `Status Changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
    description: notes || `Operational status transitioned to ${newStatus}.`,
    actor,
    badgeType: newStatus === 'resolved' ? 'resolution' : 'action'
  });

  observations[index] = target;
  saveObservations(observations);
  return target;
}

export function verifyMatchRelationship(
  observationId: string,
  targetMatchId: string,
  verification: VerificationStatus,
  notes: string = '',
  actor: string = 'Human Facility Inspector'
): Observation | null {
  const observations = getObservations();
  const index = observations.findIndex(o => o.id === observationId);
  if (index === -1) return null;

  const obs = observations[index];
  const matchIndex = obs.suggestedMatches.findIndex(m => m.targetObservationId === targetMatchId);
  if (matchIndex === -1) return null;

  obs.suggestedMatches[matchIndex].verificationStatus = verification;
  obs.suggestedMatches[matchIndex].verificationNotes = notes;
  obs.suggestedMatches[matchIndex].verifiedBy = actor;
  obs.suggestedMatches[matchIndex].verifiedAt = new Date().toISOString();

  const isVerified = verification === 'verified_related';
  obs.timeline.push({
    id: `tl-${observationId}-verify-${Date.now()}`,
    observationId,
    timestamp: new Date().toISOString(),
    type: isVerified ? 'relation_verified' : 'relation_rejected',
    title: isVerified ? `Relationship Verified (#${targetMatchId})` : `Relationship Rejected (#${targetMatchId})`,
    description: notes || (isVerified ? `Field inspector verified physical connection to #${targetMatchId}.` : `Field inspector confirmed observations are unrelated.`),
    actor,
    badgeType: 'human'
  });

  observations[index] = obs;
  saveObservations(observations);
  return obs;
}

export function togglePlaybookTask(
  observationId: string,
  actionId: string,
  userName: string = 'Campus Facility Tech'
): Observation | null {
  const observations = getObservations();
  const index = observations.findIndex(o => o.id === observationId);
  if (index === -1) return null;

  const obs = observations[index];
  if (!obs.playbook) return null;

  const action = obs.playbook.actions.find(a => a.id === actionId);
  if (!action) return null;

  action.isCompleted = !action.isCompleted;
  action.completedAt = action.isCompleted ? new Date().toISOString() : undefined;
  action.completedBy = action.isCompleted ? userName : undefined;

  if (action.isCompleted) {
    obs.timeline.push({
      id: `tl-${observationId}-pb-${Date.now()}`,
      observationId,
      timestamp: new Date().toISOString(),
      type: 'preventive_action',
      title: `Playbook Action Completed: ${action.title}`,
      description: action.description,
      actor: userName,
      badgeType: 'action'
    });
  }

  observations[index] = obs;
  saveObservations(observations);
  return obs;
}

export function resetToSeedData(): Observation[] {
  saveObservations(SEED_OBSERVATIONS);
  return SEED_OBSERVATIONS;
}

export function calculateMetrics(observations: Observation[]): DashboardMetrics {
  const total = observations.length;
  const open = observations.filter(o => o.status === 'open' || o.status === 'investigating').length;
  
  // Recurring = has at least one suggested match with confidence >= 60
  const recurring = observations.filter(o => 
    o.suggestedMatches && o.suggestedMatches.some(m => m.overallConfidence >= 60)
  ).length;

  const resolved = observations.filter(o => o.status === 'resolved').length;

  const buildings = new Set(observations.map(o => o.building));

  let recurrenceRiskIndex: 'Low' | 'Elevated' | 'High' = 'Low';
  if (recurring >= 3) recurrenceRiskIndex = 'High';
  else if (recurring >= 1) recurrenceRiskIndex = 'Elevated';

  return {
    totalObservations: total,
    openProblems: open,
    potentiallyRecurring: recurring,
    verifiedResolutions: resolved,
    recurrenceRiskIndex,
    activeBuildingsCount: buildings.size
  };
}
