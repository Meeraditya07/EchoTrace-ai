import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  CheckSquare, 
  ExternalLink
} from 'lucide-react';
import type { 
  Observation, 
  ProblemStatus, 
  VerificationStatus
} from '../types';

interface ObservationDetailModalProps {
  observation: Observation | null;
  allObservations: Observation[];
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ProblemStatus, notes?: string) => void;
  onVerifyMatch: (obsId: string, targetId: string, status: VerificationStatus, notes?: string) => void;
  onTogglePlaybookTask: (obsId: string, actionId: string) => void;
  onSelectOtherObservation: (obs: Observation) => void;
}

export const ObservationDetailModal: React.FC<ObservationDetailModalProps> = ({
  observation,
  allObservations,
  onClose,
  onUpdateStatus,
  onVerifyMatch,
  onTogglePlaybookTask,
  onSelectOtherObservation
}) => {
  const [activeTab, setActiveTab] = useState<'echoes' | 'timeline' | 'playbook'>('echoes');

  if (!observation) return null;

  const matches = observation.suggestedMatches || [];
  const timeline = [...(observation.timeline || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const playbook = observation.playbook;

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'open': return <span className="badge badge-open">Open</span>;
      case 'investigating': return <span className="badge badge-investigating">Investigating</span>;
      case 'action_taken': return <span className="badge badge-medium">Action Taken</span>;
      case 'resolved': return <span className="badge badge-resolved">Resolved</span>;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'low': return <span className="badge badge-low">Low</span>;
      case 'medium': return <span className="badge badge-medium">Medium</span>;
      case 'high': return <span className="badge badge-high">High</span>;
      case 'critical': return <span className="badge badge-critical">Critical</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="obs-id">{observation.id}</span>
              {getSeverityBadge(observation.severity)}
              {getStatusBadge(observation.status)}
              {observation.isSyntheticDemo && (
                <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                  Synthetic Demo Data
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{observation.title}</h2>
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

        {/* Observation Metadata Bar */}
        <div style={{
          background: 'var(--bg-surface-2)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span><strong>{observation.building}</strong> — {observation.specificLocation}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
            <span>{new Date(observation.timestamp).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Tag size={15} style={{ color: 'var(--text-muted)' }} />
            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{observation.category}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          
          {/* Description Block */}
          <div style={{ 
            background: 'var(--bg-surface-2)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Reported Conditions
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {observation.description}
            </p>
          </div>

          {/* Quick Status Control Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Operational Status:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(['open', 'investigating', 'action_taken', 'resolved'] as ProblemStatus[]).map(st => (
                <button
                  key={st}
                  className={`btn btn-sm ${observation.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                  onClick={() => onUpdateStatus(observation.id, st)}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Inner Tabs: Echoes vs Timeline vs Prevention Playbook */}
          <div className="nav-tabs" style={{ marginBottom: '1.25rem' }}>
            <button 
              className={`nav-tab-btn ${activeTab === 'echoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('echoes')}
            >
              <Sparkles size={15} />
              AI-Suggested Echoes ({matches.length})
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Clock size={15} />
              Chronological Timeline ({timeline.length})
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'playbook' ? 'active' : ''}`}
              onClick={() => setActiveTab('playbook')}
            >
              <CheckSquare size={15} />
              Prevention Playbook
            </button>
          </div>

          {/* TAB 1: AI SUGGESTED ECHOES */}
          {activeTab === 'echoes' && (
            <div>
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.2rem' }}>
                  <ShieldCheck size={16} />
                  <span>AI Recurrence Detection Boundary</span>
                </div>
                Connections are computed via multi-signal temporal heuristics. 
                <strong> Similarity does not prove a shared physical cause without human field verification.</strong>
              </div>

              {matches.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p className="empty-state-title">No Related Echoes Detected</p>
                  <p className="empty-state-text">
                    This observation does not currently share sufficient temporal, physical, or symptom proximity with other logged reports.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {matches.map(match => {
                    const target = allObservations.find(o => o.id === match.targetObservationId);
                    if (!target) return null;

                    const isVerified = match.verificationStatus === 'verified_related';
                    const isRejected = match.verificationStatus === 'rejected_unrelated';

                    return (
                      <div 
                        key={match.targetObservationId}
                        style={{
                          background: 'var(--bg-surface-2)',
                          border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : isRejected ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.15rem'
                        }}
                      >
                        {/* Header of Match */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span className="obs-id">#{target.id}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                {match.overallConfidence}% Match ({match.confidenceLevel})
                              </span>
                              {isVerified && <span className="badge badge-resolved">Verified Related</span>}
                              {isRejected && <span className="badge badge-critical">Rejected Unrelated</span>}
                              {!isVerified && !isRejected && <span className="badge badge-investigating">Needs Field Verification</span>}
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {target.title}
                            </h4>
                          </div>

                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectOtherObservation(target)}
                            title="Inspect Target Observation"
                          >
                            <ExternalLink size={14} />
                            <span>View Target</span>
                          </button>
                        </div>

                        {/* Target summary info */}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          Reported on {new Date(target.timestamp).toLocaleString()} in {target.building} ({target.specificLocation})
                        </div>

                        {/* Explainability Explanation */}
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                          {match.summaryExplanation}
                        </p>

                        {/* Multi-Signal Breakdown */}
                        <div className="signal-breakdown">
                          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Signal Confidence Breakdown
                          </div>
                          {match.signals.map(sig => (
                            <div key={sig.type} className="signal-row">
                              <div className="signal-row-header">
                                <span style={{ color: 'var(--text-secondary)' }}>{sig.label}: {sig.detail}</span>
                                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{sig.score}%</span>
                              </div>
                              <div className="signal-bar-track">
                                <div 
                                  className="signal-bar-fill" 
                                  style={{ 
                                    width: `${sig.score}%`,
                                    background: sig.score >= 80 ? 'var(--accent-cyan)' : sig.score >= 60 ? 'var(--accent-amber)' : 'var(--text-muted)'
                                  }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Human Verification Action Bar */}
                        <div style={{
                          marginTop: '1rem',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Human-in-the-Loop Action:
                          </span>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                const note = prompt('Optional verification notes (e.g., "Confirmed ceiling pipe leak caused floor wetness"):', match.verificationNotes || '');
                                if (note !== null) {
                                  onVerifyMatch(observation.id, target.id, 'verified_related', note);
                                }
                              }}
                            >
                              <CheckCircle2 size={14} />
                              Verify Related
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                const note = prompt('Reason for rejection (e.g., "Different independent water bottle spill"):', match.verificationNotes || '');
                                if (note !== null) {
                                  onVerifyMatch(observation.id, target.id, 'rejected_unrelated', note);
                                }
                              }}
                            >
                              <XCircle size={14} />
                              Reject Unrelated
                            </button>
                          </div>
                        </div>

                        {/* Show verification audit info if present */}
                        {match.verifiedBy && (
                          <div style={{
                            marginTop: '0.65rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-surface-1)',
                            padding: '0.4rem 0.65rem',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            <strong>Verification Audit:</strong> Marked by {match.verifiedBy} on {new Date(match.verifiedAt || '').toLocaleString()}.
                            {match.verificationNotes && <span> Note: "{match.verificationNotes}"</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Complete audit trail of reports, automated pattern correlations, inspections, and resolutions.
              </div>

              <div className="timeline-track">
                {timeline.map(event => (
                  <div key={event.id} className={`timeline-node ${event.badgeType}`}>
                    <div className="timeline-pin" />
                    <div className="timeline-card">
                      <div className="timeline-card-header">
                        <span className="timeline-card-title">{event.title}</span>
                        <span className="timeline-card-time">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="timeline-card-desc">{event.description}</p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '0.35rem', fontWeight: 600 }}>
                        Actor: {event.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PREVENTION PLAYBOOK */}
          {activeTab === 'playbook' && playbook && (
            <div>
              <div className="playbook-container" style={{ margin: 0 }}>
                <div className="playbook-header">
                  <span className="playbook-badge">{playbook.patternName}</span>
                  <h3 className="playbook-title">Targeted Preventive Playbook</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {playbook.suggestedRationale}
                  </p>
                </div>

                <div className="playbook-disclaimer">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{playbook.disclaimer}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {playbook.actions.map(action => (
                    <div key={action.id} className="playbook-task-item">
                      <input 
                        type="checkbox" 
                        className="task-checkbox"
                        checked={action.isCompleted}
                        onChange={() => onTogglePlaybookTask(observation.id, action.id)}
                      />
                      <div className="task-content">
                        <div className={`task-title ${action.isCompleted ? 'completed' : ''}`}>
                          {action.title}
                        </div>
                        <p className="task-desc">{action.description}</p>
                        <div className="task-meta">
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            Role: {action.recommendedRole}
                          </span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>
                            Phase: {action.phase.replace('_', ' ')}
                          </span>
                          {action.isCompleted && (
                            <>
                              <span>•</span>
                              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                Completed by {action.completedBy || 'Technician'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
