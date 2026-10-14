import { useState, useId } from 'react';
import { 
  X, 
  AlertTriangle, 
  Sparkles, 
  Send 
} from 'lucide-react';
import type { Category, Observation, ReporterType, Severity } from '../types';
import { findSuggestedMatches } from '../services/similarityEngine';

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingObservations: Observation[];
  onSubmit: (data: {
    title: string;
    description: string;
    category: Category;
    building: string;
    specificLocation: string;
    severity: Severity;
    reporterType: ReporterType;
    timestamp?: string;
  }) => void;
}

const PRESET_BUILDINGS = [
  'Curie Science Hall',
  'Turing Engineering Center',
  'Franklin Dining Commons',
  'Oak Student Dormitory',
  'Main Campus Library',
  'Athletics & Recreation Center'
];

export const ProblemReportModal: React.FC<ProblemReportModalProps> = ({
  isOpen,
  onClose,
  existingObservations,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('plumbing');
  const [building, setBuilding] = useState('Curie Science Hall');
  const [specificLocation, setSpecificLocation] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [reporterType, setReporterType] = useState<ReporterType>('student');
  const [customTimestamp, setCustomTimestamp] = useState(() => {
    const now = new Date();
    // Format to datetime-local string YYYY-MM-DDTHH:mm
    return now.toISOString().slice(0, 16);
  });

  const titleInputId = useId();
  const descInputId = useId();
  const categoryInputId = useId();
  const buildingInputId = useId();
  const locationInputId = useId();
  const severityInputId = useId();
  const timeInputId = useId();
  const reporterInputId = useId();

  // Run dynamic preview match while user types
  const candidateMock: Observation = {
    id: 'PREVIEW-TEMP',
    title: title || 'Draft Observation',
    description: description || '',
    category,
    building,
    specificLocation: specificLocation || '',
    timestamp: customTimestamp ? new Date(customTimestamp).toISOString() : new Date().toISOString(),
    severity,
    status: 'open',
    reporterType,
    isSyntheticDemo: false,
    tags: [],
    suggestedMatches: [],
    timeline: []
  };

  const previewMatches = (title.length > 3 || specificLocation.length > 2)
    ? findSuggestedMatches(candidateMock, existingObservations)
    : [];

  const topMatch = previewMatches.length > 0 ? previewMatches[0] : null;
  const targetObs = topMatch 
    ? existingObservations.find(o => o.id === topMatch.targetObservationId) 
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !specificLocation.trim()) {
      alert('Please fill in the title, description, and specific location.');
      return;
    }

    onSubmit({
      title,
      description,
      category,
      building,
      specificLocation,
      severity,
      reporterType,
      timestamp: customTimestamp ? new Date(customTimestamp).toISOString() : undefined
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setSpecificLocation('');
    onClose();
  };

  // Quick fill preset for testing
  const handleFillDemoScenario = (scenario: 'leak' | 'slip' | 'electrical') => {
    if (scenario === 'leak') {
      setTitle('Water dripping from pipe valve near Lab 204');
      setDescription('Noticed fresh puddle under the overhead pipe junction outside Lab 204.');
      setCategory('plumbing');
      setBuilding('Curie Science Hall');
      setSpecificLocation('2nd Floor Corridor outside Lab 204');
      setSeverity('high');
    } else if (scenario === 'slip') {
      setTitle('Slick wet spot near Lab 204 hallway');
      setDescription('Students are slipping on a wet patch outside chemistry laboratory.');
      setCategory('safety');
      setBuilding('Curie Science Hall');
      setSpecificLocation('2nd Floor Corridor, entrance to Lab 204');
      setSeverity('high');
    } else {
      setTitle('Flickering overhead ballast and buzzing noise');
      setDescription('Light tube flickering rapidly and smelling warm in computer cluster.');
      setCategory('electrical');
      setBuilding('Turing Engineering Center');
      setSpecificLocation('Ground Floor, Room 102 Graphics Lab');
      setSeverity('medium');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Report Facility Observation</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                EchoTrace AI will cross-reference historical memory to prevent repeat occurrences
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ padding: '0.35rem 0.6rem' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Quick Scenario presets for fast hackathon demo testing */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.25rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem'
          }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Demo Quick-Fill:</span>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              onClick={() => handleFillDemoScenario('leak')}
            >
              Lab 204 Water Leak
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              onClick={() => handleFillDemoScenario('slip')}
            >
              Lab 204 Slippery Floor
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              onClick={() => handleFillDemoScenario('electrical')}
            >
              Turing Breaker Buzz
            </button>
          </div>

          {/* Real-time Echo Preview Banner */}
          {topMatch && targetObs && (
            <div className="echo-preview-box">
              <div className="echo-preview-header">
                <Sparkles size={16} />
                <span>Real-Time EchoTrace Memory Match Detected ({topMatch.overallConfidence}% Confidence)</span>
              </div>
              <p className="echo-preview-text">
                Similar historical observation found: <strong>#{targetObs.id} — {targetObs.title}</strong> in {targetObs.building}. 
                When submitted, EchoTrace AI will automatically link them for technician inspection.
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor={titleInputId} className="form-label">Problem Title *</label>
            <input 
              id={titleInputId}
              type="text" 
              className="form-input" 
              placeholder="e.g. Water dripping from ceiling or Slippery floor near laboratory"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={descInputId} className="form-label">Detailed Observation Description *</label>
            <textarea 
              id={descInputId}
              className="form-textarea" 
              rows={3}
              placeholder="Describe what you observed, potential symptoms (water, smell, spark, sticking door), and exact visible conditions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor={categoryInputId} className="form-label">Category</label>
              <select 
                id={categoryInputId}
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
              >
                <option value="plumbing">Plumbing & Water Leaks</option>
                <option value="safety">Slip, Trip & Life Safety</option>
                <option value="electrical">Electrical & Lighting</option>
                <option value="hvac">HVAC & Climate Control</option>
                <option value="access">Access Control & Doors</option>
                <option value="structural">Structural & Flooring</option>
                <option value="sanitation">Hygiene & Sanitation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={severityInputId} className="form-label">Severity Level</label>
              <select 
                id={severityInputId}
                className="form-select"
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
              >
                <option value="low">Low (Cosmetic / Minor Inconvenience)</option>
                <option value="medium">Medium (Disruptive / Attention Needed)</option>
                <option value="high">High (Active Safety Hazard)</option>
                <option value="critical">Critical (Immediate Evacuation / Danger)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor={buildingInputId} className="form-label">Campus Building / Zone</label>
              <select 
                id={buildingInputId}
                className="form-select"
                value={building}
                onChange={e => setBuilding(e.target.value)}
              >
                {PRESET_BUILDINGS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={locationInputId} className="form-label">Specific Room / Corridor *</label>
              <input 
                id={locationInputId}
                type="text" 
                className="form-input" 
                placeholder="e.g. 2nd Floor Corridor, outside Lab 204"
                value={specificLocation}
                onChange={e => setSpecificLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor={timeInputId} className="form-label">Observation Date & Time</label>
              <input 
                id={timeInputId}
                type="datetime-local" 
                className="form-input"
                value={customTimestamp}
                onChange={e => setCustomTimestamp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor={reporterInputId} className="form-label">Reporter Role (Privacy-Preserved)</label>
              <select 
                id={reporterInputId}
                className="form-select"
                value={reporterType}
                onChange={e => setReporterType(e.target.value as ReporterType)}
              >
                <option value="student">Student Reporter (Anonymous)</option>
                <option value="faculty">Faculty / Department Staff</option>
                <option value="facility_staff">Campus Facility / Custodial Technician</option>
                <option value="visitor">Campus Visitor</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} />
              Submit to Problem Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
