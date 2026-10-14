import { describe, it, expect, beforeEach } from 'vitest';
import {
  getObservations,
  saveObservations,
  createObservation,
  updateObservationStatus,
  verifyMatchRelationship,
  togglePlaybookTask,
  resetToSeedData,
  calculateMetrics,
  sanitizeInput,
  SEED_OBSERVATIONS
} from '../storage';
import type { Observation } from '../../types';

describe('Storage Service - EchoTrace Problem Memory', () => {
  beforeEach(() => {
    resetToSeedData();
  });

  describe('Report Creation', () => {
    it('creates a valid observation with generated ID, default open status, and timeline event', () => {
      const initialCount = getObservations().length;
      const created = createObservation({
        title: 'Water valve spraying inside mechanical room',
        description: 'Observed pressurized water spray coming from the secondary riser valve. Floor has 1 inch of standing water.',
        category: 'plumbing',
        building: 'Curie Science Hall',
        specificLocation: 'Basement Mechanical Room 012',
        severity: 'high',
        reporterType: 'facility_staff'
      });

      expect(created.id).toMatch(/^OBS-2026-\d{3}$/);
      expect(created.title).toBe('Water valve spraying inside mechanical room');
      expect(created.status).toBe('open');
      expect(created.isSyntheticDemo).toBe(false);
      expect(created.timeline.length).toBeGreaterThanOrEqual(1);
      expect(created.timeline[0].type).toBe('report_filed');
      expect(created.playbook).toBeDefined();
      expect(created.playbook?.actions.length).toBeGreaterThan(0);

      const all = getObservations();
      expect(all.length).toBe(initialCount + 1);
      expect(all[0].id).toBe(created.id);
    });

    it('correlates with existing problem memory and adds AI detection event when match is found', () => {
      // Seed data contains OBS-2026-001 (Curie Science Hall 2nd Floor Corridor outside Chemistry Lab 204 water leak)
      const report = createObservation({
        title: 'Wet slick spot on floor near Lab 204',
        description: 'Slippery floor puddle reappeared right outside Chemistry Lab 204 walkway.',
        category: 'safety',
        building: 'Curie Science Hall',
        specificLocation: '2nd Floor Corridor outside Lab 204',
        severity: 'high',
        reporterType: 'student'
      });

      expect(report.suggestedMatches.length).toBeGreaterThan(0);
      const match = report.suggestedMatches[0];
      expect(match.overallConfidence).toBeGreaterThanOrEqual(60);
      expect(match.verificationStatus).toBe('unverified');

      const aiEvent = report.timeline.find(t => t.type === 'ai_pattern_detected');
      expect(aiEvent).toBeDefined();
      expect(aiEvent?.actor).toBe('EchoTrace Engine v1.2');
    });
  });

  describe('Required-Field Validation & Input Sanitization', () => {
    it('throws error when input title is missing, empty, or shorter than 3 characters', () => {
      expect(() => {
        createObservation({
          title: '  ',
          description: 'A valid description of the hazard',
          category: 'safety',
          building: 'Curie Science Hall',
          specificLocation: 'Room 101',
          severity: 'medium'
        });
      }).toThrow(/title is required and must be at least 3 characters/i);

      expect(() => {
        createObservation({
          title: 'ab',
          description: 'A valid description of the hazard',
          category: 'safety',
          building: 'Curie Science Hall',
          specificLocation: 'Room 101',
          severity: 'medium'
        });
      }).toThrow(/title is required and must be at least 3 characters/i);
    });

    it('throws error when description is missing or shorter than 5 characters', () => {
      expect(() => {
        createObservation({
          title: 'Valid Hazard Title',
          description: 'tiny',
          category: 'safety',
          building: 'Curie Science Hall',
          specificLocation: 'Room 101',
          severity: 'medium'
        });
      }).toThrow(/description is required and must be at least 5 characters/i);
    });

    it('throws error when specific location or building is missing', () => {
      expect(() => {
        createObservation({
          title: 'Valid Hazard Title',
          description: 'Valid long description of the situation',
          category: 'safety',
          building: 'Curie Science Hall',
          specificLocation: ' ',
          severity: 'medium'
        });
      }).toThrow(/specific location is required/i);

      expect(() => {
        createObservation({
          title: 'Valid Hazard Title',
          description: 'Valid long description of the situation',
          category: 'safety',
          building: ' ',
          specificLocation: 'Room 101',
          severity: 'medium'
        });
      }).toThrow(/building name is required/i);
    });

    it('sanitizes control characters and enforces length limits on inputs', () => {
      const sanitized = sanitizeInput('Hello\x00\x08World\x1F! Long text that should be truncated.', 12);
      expect(sanitized).toBe('HelloWorld!');
      expect(sanitized.length).toBeLessThanOrEqual(12);
    });

    it('falls back to safe default category and reporterType when invalid inputs are provided', () => {
      const obs = createObservation({
        title: 'Unusual event with strange enum value',
        description: 'Details about the unexpected occurrence in facility.',
        // @ts-expect-error Testing invalid enum fallback
        category: 'non_existent_category',
        building: 'Curie Science Hall',
        specificLocation: 'Main Atrium',
        severity: 'low',
        // @ts-expect-error Testing invalid enum fallback
        reporterType: 'unknown_role'
      });

      expect(obs.category).toBe('plumbing'); // default safe fallback
      expect(obs.reporterType).toBe('student'); // default safe fallback
    });

    it('parses valid custom timestamps and falls back to ISO string for unparseable input', () => {
      const obsWithValidDate = createObservation({
        title: 'Historical report from yesterday',
        description: 'Observed intermittent power flicker yesterday evening.',
        category: 'electrical',
        building: 'Turing Engineering Center',
        specificLocation: 'Room 201',
        severity: 'medium',
        timestamp: '2026-10-10T14:00:00.000Z'
      });
      expect(obsWithValidDate.timestamp).toBe('2026-10-10T14:00:00.000Z');

      const obsWithInvalidDate = createObservation({
        title: 'Observation with bad date string',
        description: 'Observed intermittent power flicker yesterday evening.',
        category: 'electrical',
        building: 'Turing Engineering Center',
        specificLocation: 'Room 201',
        severity: 'medium',
        timestamp: 'not-a-valid-date'
      });
      expect(isNaN(Date.parse(obsWithInvalidDate.timestamp))).toBe(false);
    });
  });

  describe('Persistence & Seed Data Handling', () => {
    it('loads initial seed observations when storage is initialized', () => {
      const obs = getObservations();
      expect(obs.length).toBe(SEED_OBSERVATIONS.length);
      expect(obs.some(o => o.id === 'OBS-2026-001')).toBe(true);
    });

    it('persists modifications across save and load cycles', () => {
      const testList: Observation[] = [
        {
          id: 'TEST-001',
          title: 'Isolated Test Item',
          description: 'Testing isolated persistence cycle',
          category: 'structural',
          building: 'Main Campus Library',
          specificLocation: '3rd Floor Stacks',
          timestamp: '2026-10-14T10:00:00.000Z',
          severity: 'low',
          status: 'resolved',
          reporterType: 'faculty',
          isSyntheticDemo: true,
          tags: ['test'],
          suggestedMatches: [],
          timeline: []
        }
      ];

      saveObservations(testList);
      const loaded = getObservations();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('TEST-001');
    });

    it('recovers gracefully to seed data if persisted data is corrupted or invalid JSON', () => {
      // Simulate corrupted data
      // @ts-expect-error Passing invalid data to test fallback
      saveObservations('invalid_non_array_data');
      const recovered = getObservations();
      expect(recovered.length).toBe(SEED_OBSERVATIONS.length);
      expect(recovered[0].id).toBe('OBS-2026-001');
    });

    it('resets cleanly back to seed dataset with resetToSeedData()', () => {
      createObservation({
        title: 'Temporary extra observation',
        description: 'Will be wiped out by resetToSeedData',
        category: 'hvac',
        building: 'Turing Engineering Center',
        specificLocation: 'HVAC Duct B',
        severity: 'medium'
      });
      expect(getObservations().length).toBeGreaterThan(SEED_OBSERVATIONS.length);

      const reset = resetToSeedData();
      expect(reset.length).toBe(SEED_OBSERVATIONS.length);
      expect(getObservations().length).toBe(SEED_OBSERVATIONS.length);
    });
  });

  describe('Error Handling & Operational Workflow', () => {
    it('updates observation status and logs a timeline audit event', () => {
      const updated = updateObservationStatus('OBS-2026-001', 'resolved', 'Pipe coupling replaced and ceiling tile dried.');
      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('resolved');

      const latestEvent = updated?.timeline[updated.timeline.length - 1];
      expect(latestEvent?.type).toBe('status_changed');
      expect(latestEvent?.description).toContain('Pipe coupling replaced');
      expect(latestEvent?.badgeType).toBe('resolution');
    });

    it('returns null when updating non-existent observation ID', () => {
      const result = updateObservationStatus('OBS-9999-DOES-NOT-EXIST', 'resolved');
      expect(result).toBeNull();
    });

    it('rejects invalid status values and returns null', () => {
      // @ts-expect-error Testing invalid status enum
      const result = updateObservationStatus('OBS-2026-001', 'invalid_status_enum');
      expect(result).toBeNull();
    });

    it('records human field verification and logs relation_verified audit event', () => {
      // OBS-2026-002 has a match to OBS-2026-001
      const updated = verifyMatchRelationship(
        'OBS-2026-002',
        'OBS-2026-001',
        'verified_related',
        'Physical water trail connects ceiling leak to floor slickness.',
        'Inspector John Doe'
      );

      expect(updated).not.toBeNull();
      const match = updated?.suggestedMatches.find(m => m.targetObservationId === 'OBS-2026-001');
      expect(match?.verificationStatus).toBe('verified_related');
      expect(match?.verifiedBy).toBe('Inspector John Doe');
      expect(match?.verificationNotes).toBe('Physical water trail connects ceiling leak to floor slickness.');

      const lastTimeline = updated?.timeline[updated.timeline.length - 1];
      expect(lastTimeline?.type).toBe('relation_verified');
    });

    it('records human relationship rejection and logs relation_rejected audit event', () => {
      const updated = verifyMatchRelationship(
        'OBS-2026-002',
        'OBS-2026-001',
        'rejected_unrelated',
        'Independent drink spill confirmed by security camera review.',
        'Safety Officer Jane'
      );

      expect(updated).not.toBeNull();
      const match = updated?.suggestedMatches.find(m => m.targetObservationId === 'OBS-2026-001');
      expect(match?.verificationStatus).toBe('rejected_unrelated');
      expect(match?.verifiedBy).toBe('Safety Officer Jane');

      const lastTimeline = updated?.timeline[updated.timeline.length - 1];
      expect(lastTimeline?.type).toBe('relation_rejected');
    });

    it('returns null when verifying non-existent observation or non-existent target match', () => {
      const res1 = verifyMatchRelationship('NON-EXISTENT', 'OBS-2026-001', 'verified_related');
      expect(res1).toBeNull();

      const res2 = verifyMatchRelationship('OBS-2026-001', 'NON-EXISTENT-MATCH', 'verified_related');
      expect(res2).toBeNull();
    });

    it('toggles playbook task completion state and appends preventive action timeline item', () => {
      const obs = getObservations().find(o => o.id === 'OBS-2026-001');
      const actionId = obs?.playbook?.actions[0].id;
      expect(actionId).toBeDefined();

      const updated = togglePlaybookTask('OBS-2026-001', actionId!, 'Technician Alex');
      expect(updated).not.toBeNull();
      const action = updated?.playbook?.actions.find(a => a.id === actionId);
      expect(action?.isCompleted).toBe(true);
      expect(action?.completedBy).toBe('Technician Alex');

      const actionEvent = updated?.timeline.find(t => t.type === 'preventive_action' && t.actor === 'Technician Alex');
      expect(actionEvent).toBeDefined();

      // Toggle off again
      const toggledBack = togglePlaybookTask('OBS-2026-001', actionId!);
      const actionOff = toggledBack?.playbook?.actions.find(a => a.id === actionId);
      expect(actionOff?.isCompleted).toBe(false);
      expect(actionOff?.completedAt).toBeUndefined();
    });
  });

  describe('Metrics Calculation', () => {
    it('accurately computes dashboard counts and recurrence risk index', () => {
      const obs = getObservations();
      const metrics = calculateMetrics(obs);

      expect(metrics.totalObservations).toBe(obs.length);
      expect(metrics.openProblems).toBeGreaterThan(0);
      expect(metrics.activeBuildingsCount).toBeGreaterThan(0);
      expect(['Low', 'Elevated', 'High']).toContain(metrics.recurrenceRiskIndex);
    });
  });
});
