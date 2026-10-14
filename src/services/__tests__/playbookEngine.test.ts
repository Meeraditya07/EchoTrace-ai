import { describe, it, expect } from 'vitest';
import { generatePlaybookForObservation } from '../playbookEngine';
import type { Observation, Category } from '../../types';

describe('Playbook Engine - Contextual Recurrence Prevention Playbooks', () => {
  const mockObs = (category: Category): Observation => ({
    id: 'OBS-TEST-PLAYBOOK',
    title: `Test Problem for ${category}`,
    description: `Detailed description for testing category ${category}`,
    category,
    building: 'Curie Science Hall',
    specificLocation: 'Room 101',
    timestamp: '2026-10-14T10:00:00.000Z',
    severity: 'high',
    status: 'open',
    reporterType: 'faculty_staff',
    isSyntheticDemo: false,
    tags: ['test'],
    suggestedMatches: [],
    timeline: []
  });

  const categories: Category[] = ['plumbing', 'safety', 'electrical', 'hvac', 'access', 'structural', 'sanitation'];

  it.each(categories)('generates valid multi-phase playbook with actionable tasks for %s', (category) => {
    const playbook = generatePlaybookForObservation(mockObs(category));

    expect(playbook.id).toBe(`pb-OBS-TEST-PLAYBOOK`);
    expect(playbook.category).toBe(category);
    expect(playbook.patternName).toBeTruthy();
    expect(playbook.suggestedRationale).toBeTruthy();
    expect(playbook.disclaimer).toBeTruthy();
    expect(playbook.actions.length).toBeGreaterThanOrEqual(2);

    // Verify all actions have valid fields
    for (const action of playbook.actions) {
      expect(action.id).toBeTruthy();
      expect(action.title).toBeTruthy();
      expect(action.description).toBeTruthy();
      expect(action.recommendedRole).toBeTruthy();
      expect(['immediate_safety', 'root_cause_diagnosis', 'recurrence_prevention']).toContain(action.phase);
      expect(action.isCompleted).toBe(false);
    }

    // Verify presence of recurrence prevention phase
    const hasPreventionPhase = playbook.actions.some(a => a.phase === 'recurrence_prevention');
    expect(hasPreventionPhase).toBe(true);
  });

  it('provides plumbing-specific containment and borescope diagnostic actions', () => {
    const playbook = generatePlaybookForObservation(mockObs('plumbing'));
    const actionTitles = playbook.actions.map(a => a.title);

    expect(actionTitles).toContain('Immediate Hazard Containment');
    expect(actionTitles).toContain('Overhead & Riser Borescope Inspection');
    expect(actionTitles).toContain('Permanent Seal & IoT Moisture Sensor Installation');
  });

  it('provides electrical lockout and thermal camera scan actions', () => {
    const playbook = generatePlaybookForObservation(mockObs('electrical'));
    const actionTitles = playbook.actions.map(a => a.title);

    expect(actionTitles).toContain('Circuit Isolation & Lockout/Tagout');
    expect(actionTitles).toContain('Thermal Camera Load Audit');
  });
});
