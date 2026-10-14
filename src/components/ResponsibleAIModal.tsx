import { X, ShieldAlert, Cpu, Lock, UserCheck, Eye } from 'lucide-react';

interface ResponsibleAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleAIModal: React.FC<ResponsibleAIModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Responsible AI & Transparency Charter</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ethical boundaries, algorithm transparency, and privacy commitments
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

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <Cpu size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                Transparent Local Heuristic Correlation Engine v1.2
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                EchoTrace AI runs entirely on a transparent, client-side temporal and semantic matching engine. 
                We <strong>never pretend a cloud LLM API was invoked when it was not</strong>. 
                Similarity scores are computed deterministically through multi-signal heuristics.
              </p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Eye size={17} style={{ color: 'var(--accent-indigo)' }} />
              Multi-Signal Explainability Framework
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>1. Physical Proximity (35%)</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Matches building zones and specific room numbers (e.g. Curie Hall Lab 204).
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>2. Temporal Proximity (25%)</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Evaluates delta in hours/days. Highest weight within active 72-hour window.
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>3. Symptom Overlap (30%)</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Scans keyword clusters (e.g., water leak, puddle, slippery floor).
                </p>
              </div>
              <div style={{ background: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>4. Cross-Category Alignment (10%)</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Recognizes interdependencies (e.g. plumbing leak producing safety slip hazard).
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            padding: '1rem'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-amber)' }}>
              <UserCheck size={17} />
              Human-in-the-Loop Verification Strict Rule
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>EchoTrace AI never claims that an earlier problem caused a later problem without physical evidence.</strong> All connections are presented strictly as <em>"AI-suggested — needs verification"</em>. 
              Only campus maintenance staff or authorized inspectors can mark a suggested relationship as <strong>Verified Related</strong> or <strong>Rejected Unrelated</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}>
              <Lock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Privacy & Synthetic Data Standard
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                No personally identifiable student records (names, student IDs, phone numbers) are gathered or displayed. 
                Reports display only coarse reporter roles (e.g., "Student Reporter", "Faculty Member"). 
                Pre-populated incident records are explicitly labelled as synthetic demonstration data.
              </p>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
