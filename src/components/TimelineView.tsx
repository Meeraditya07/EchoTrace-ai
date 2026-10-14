import { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  FileText,
  ChevronRight
} from 'lucide-react';
import type { Observation, TimelineEvent } from '../types';

interface TimelineViewProps {
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  observations,
  onSelectObservation
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Flatten all events across all observations
  const allEvents: (TimelineEvent & { obsRef: Observation })[] = [];
  observations.forEach(obs => {
    (obs.timeline || []).forEach(ev => {
      allEvents.push({ ...ev, obsRef: obs });
    });
  });

  // Sort descending by timestamp
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = allEvents.filter(ev => {
    if (filterType === 'all') return true;
    return ev.badgeType === filterType;
  });

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText size={14} />;
      case 'ai': return <Sparkles size={14} />;
      case 'human': return <UserCheck size={14} />;
      case 'action': return <Wrench size={14} />;
      case 'resolution': return <CheckCircle2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={22} style={{ color: 'var(--accent-cyan)' }} />
            Campus Temporal Memory Timeline
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Chronological log of initial reports, AI correlation detections, human verifications, and preventive maintenance actions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="nav-tabs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'report', label: 'Reports' },
            { id: 'ai', label: 'AI Detections' },
            { id: 'human', label: 'Human Verifications' },
            { id: 'action', label: 'Actions Taken' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${filterType === tab.id ? 'active' : ''}`}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Clock className="empty-state-icon" />
          <h3 className="empty-state-title">No Timeline Events Found</h3>
          <p className="empty-state-text">No events match the selected filter category.</p>
        </div>
      ) : (
        <div className="timeline-track" style={{ paddingLeft: '2rem' }}>
          {filteredEvents.map(event => (
            <div key={event.id} className={`timeline-node ${event.badgeType}`}>
              <div className="timeline-pin" style={{ width: '20px', height: '20px', left: '-2rem' }}>
                {getBadgeIcon(event.badgeType)}
              </div>
              <div 
                className="timeline-card"
                onClick={() => onSelectObservation(event.obsRef)}
                style={{ cursor: 'pointer', transition: 'border-color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div className="timeline-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="obs-id">#{event.obsRef.id}</span>
                    <span className="timeline-card-title">{event.title}</span>
                    <span className={`badge ${
                      event.badgeType === 'ai' ? 'badge-ai-suggested' : 
                      event.badgeType === 'human' ? 'badge-medium' : 
                      event.badgeType === 'resolution' ? 'badge-resolved' : 'badge-open'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {event.badgeType.toUpperCase()}
                    </span>
                  </div>
                  <span className="timeline-card-time">
                    {new Date(event.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <p className="timeline-card-desc" style={{ marginBottom: '0.5rem' }}>
                  {event.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.45rem',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span><strong>Actor:</strong> {event.actor}</span>
                    <span>•</span>
                    <span><strong>Location:</strong> {event.obsRef.building} ({event.obsRef.specificLocation})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    <span>View Observation</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
