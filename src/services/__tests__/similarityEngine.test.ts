import { describe, it, expect } from 'vitest';
import {
  analyzeObservationRelationship,
  findSuggestedMatches
} from '../similarityEngine';
import type { Observation } from '../../types';

describe('Similarity Engine - Multi-Signal Temporal & Semantic Matcher', () => {
  const baseLeak: Observation = {
    id: 'OBS-LEAK-01',
    title: 'Ceiling water leak dripping onto walkway',
    description: 'Continuous water dripping from the ceiling acoustic tiles directly onto floor outside Lab 204. Small puddle forming.',
    category: 'plumbing',
    building: 'Curie Science Hall',
    specificLocation: '2nd Floor Corridor outside Chemistry Lab 204',
    timestamp: '2026-10-05T08:30:00.000Z',
    severity: 'medium',
    status: 'investigating',
    reporterType: 'faculty',
    isSyntheticDemo: false,
    tags: ['water', 'ceiling', 'leak', 'lab-204'],
    suggestedMatches: [],
    timeline: []
  };

  const relatedSlip: Observation = {
    id: 'OBS-SLIP-02',
    title: 'Extremely slippery hallway floor near lab entrance',
    description: 'Corridor floor is slick right near entrance to Lab 204. Moisture on smooth tile posing slip hazard.',
    category: 'safety',
    building: 'Curie Science Hall',
    specificLocation: '2nd Floor Corridor outside Chemistry Lab 204',
    timestamp: '2026-10-07T10:15:00.000Z', // 49 hours later
    severity: 'high',
    status: 'open',
    reporterType: 'student',
    isSyntheticDemo: false,
    tags: ['slippery', 'hazard', 'wet', 'lab-204'],
    suggestedMatches: [],
    timeline: []
  };

  const differentBuilding: Observation = {
    id: 'OBS-DIFF-03',
    title: 'Tripping hazard on cracked linoleum tile',
    description: 'Cracked floor tile outside auditorium causes students to trip.',
    category: 'structural',
    building: 'Turing Engineering Center',
    specificLocation: 'Ground Floor Auditorium Entrance',
    timestamp: '2026-10-06T12:00:00.000Z',
    severity: 'medium',
    status: 'open',
    reporterType: 'student',
    isSyntheticDemo: false,
    tags: ['tile', 'trip'],
    suggestedMatches: [],
    timeline: []
  };

  it('detects high-confidence recurrence between leak and subsequent slippery floor in same location', () => {
    const match = analyzeObservationRelationship(relatedSlip, baseLeak);

    expect(match).not.toBeNull();
    expect(match?.targetObservationId).toBe(baseLeak.id);
    expect(match?.overallConfidence).toBeGreaterThanOrEqual(75);
    expect(match?.confidenceLevel).toMatch(/High|Very High/);
    expect(match?.verificationStatus).toBe('unverified');

    // Verify all 4 signals are populated
    expect(match?.signals.length).toBe(4);
    const locSig = match?.signals.find(s => s.type === 'location_proximity');
    const timeSig = match?.signals.find(s => s.type === 'temporal_proximity');
    const symptomSig = match?.signals.find(s => s.type === 'symptom_overlap');
    const catSig = match?.signals.find(s => s.type === 'category_match');

    expect(locSig).toBeDefined();
    expect(locSig?.score).toBeGreaterThanOrEqual(90);

    expect(timeSig).toBeDefined();
    expect(timeSig?.score).toBeGreaterThanOrEqual(70);

    expect(symptomSig).toBeDefined();
    expect(symptomSig?.score).toBeGreaterThan(0);

    // Cross-category alignment recognizes plumbing + safety synergy
    expect(catSig).toBeDefined();
    expect(catSig?.score).toBe(75);
  });

  it('returns null when observations are in different buildings', () => {
    const match = analyzeObservationRelationship(baseLeak, differentBuilding);
    expect(match).toBeNull();
  });

  it('returns null when comparing an observation with itself', () => {
    const match = analyzeObservationRelationship(baseLeak, baseLeak);
    expect(match).toBeNull();
  });

  it('finds and sorts suggested matches by overallConfidence descending', () => {
    const intermediateDrip: Observation = {
      id: 'OBS-DRIP-04',
      title: 'Moisture on wall corner near Lab 204',
      description: 'Minor moisture staining on wall corner near Lab 204 corridor.',
      category: 'plumbing',
      building: 'Curie Science Hall',
      specificLocation: '2nd Floor Corridor outside Chemistry Lab 204',
      timestamp: '2026-10-06T09:00:00.000Z',
      severity: 'low',
      status: 'open',
      reporterType: 'facility_staff',
      isSyntheticDemo: false,
      tags: ['moisture'],
      suggestedMatches: [],
      timeline: []
    };

    const matches = findSuggestedMatches(relatedSlip, [differentBuilding, intermediateDrip, baseLeak]);

    expect(matches.length).toBeGreaterThanOrEqual(2);
    // Verified sorted descending
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].overallConfidence).toBeGreaterThanOrEqual(matches[i + 1].overallConfidence);
    }
    // differentBuilding should not be in the matches
    expect(matches.some(m => m.targetObservationId === differentBuilding.id)).toBe(false);
  });

  it('generates transparent responsible AI explainability summary', () => {
    const match = analyzeObservationRelationship(relatedSlip, baseLeak);
    expect(match?.summaryExplanation).toBeDefined();
    expect(match?.summaryExplanation).toContain('Curie Science Hall');
    expect(match?.summaryExplanation).toContain('field inspection is strictly required');
  });
});
