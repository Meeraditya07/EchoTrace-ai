import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  ShieldAlert, 
  Layers, 
  Flame, 
  Droplets, 
  Zap, 
  DoorClosed, 
  Wind 
} from 'lucide-react';
import type { DashboardMetrics, Observation, TimelineEvent } from '../types';

interface DashboardProps {
  metrics: DashboardMetrics;
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
  onOpenReportModal: () => void;
  onOpenAIModal: () => void;
  onNavigateToTab: (tab: 'dashboard' | 'observations' | 'clusters' | 'timeline' | 'playbooks') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  observations,
  onSelectObservation,
  onOpenReportModal,
  onOpenAIModal,
  onNavigateToTab
}) => {
  // Extract all timeline events sorted by timestamp desc
  const allEvents: (TimelineEvent & { obsTitle: string })[] = [];
  observations.forEach(obs => {
    obs.timeline.forEach(event => {
      allEvents.push({ ...event, obsTitle: obs.title });
    });
  });
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentEvents = allEvents.slice(0, 6);

  // Find the primary featured recurring cluster (Curie Science Hall)
  const labRecurrence = observations.find(o => o.id === 'OBS-2026-003');

  // Category counts
  const categoryCounts = observations.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Responsible AI Banner */}
      <div className="ai-status-banner">
        <div className="ai-status-left">
          <span className="ai-pulse-dot" />
          <div className="ai-status-text">
            <strong>Transparent Local Correlation Engine v1.2 Active:</strong> Heuristic multi-signal temporal matching. All connections marked <em>needs verification</em>.
          </div>
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenAIModal}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
        >
          <ShieldAlert size={14} />
          <span>View Principles</span>
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Memory Records</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.totalObservations}</div>
          <div className="metric-subtext">Across {metrics.activeBuildingsCount} campus buildings</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Open Problems</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            {metrics.openProblems}
          </div>
          <div className="metric-subtext">Awaiting field maintenance</div>
        </div>

        <div className="metric-card" style={{ border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div className="metric-header">
            <span className="metric-title">Potentially Recurring</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            {metrics.potentiallyRecurring}
          </div>
          <div className="metric-subtext">Flagged by temporal matcher</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Verified Resolutions</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            {metrics.verifiedResolutions}
          </div>
          <div className="metric-subtext">Confirmed by staff inspection</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Recurrence Risk Index</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: metrics.recurrenceRiskIndex === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
            {metrics.recurrenceRiskIndex}
          </div>
          <div className="metric-subtext">Curie Science Lab active cluster</div>
        </div>
      </div>

      {/* Featured Recurrence Spotlight: The Lab 204 Case */}
      {labRecurrence && (
        <div className="recurrence-alert-banner">
          <div style={{ color: 'var(--accent-amber)', marginTop: '2px' }}>
            <Sparkles size={24} />
          </div>
          <div className="recurrence-alert-content">
            <div className="recurrence-alert-header">
              <span className="recurrence-alert-title">
                Active Recurrence Pattern Spotlight: Curie Science Hall (Lab 204 Corridor)
              </span>
              <span className="badge badge-ai-suggested">91% Correlation</span>
            </div>
            <p className="recurrence-alert-desc">
              EchoTrace AI connected 3 separate observations over 5 days in the same 2nd-floor corridor. 
              Ordinary systems treat these as 3 isolated complaints. EchoTrace tracks the underlying hydro-leak pattern to prevent repeat slip hazards.
            </p>

            <div className="recurrence-chain-pills">
              <span className="chain-step-pill">1. Mon: Ceiling Water Leak (#OBS-001)</span>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="chain-step-pill">2. Wed: Slippery Hallway Floor (#OBS-002)</span>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="chain-step-pill" style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}>
                3. Fri: Floor Wet Again (#OBS-003)
              </span>

              <button 
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
                onClick={() => onSelectObservation(labRecurrence)}
              >
                Inspect Incident Chain
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Section: Recent Activity vs Category Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Recent Activity Stream */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Campus Memory Activity</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToTab('timeline')}
              style={{ fontSize: '0.75rem' }}
            >
              Full Timeline
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentEvents.map(event => (
              <div 
                key={event.id}
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {event.title}
                    </span>
                    <span className={`badge ${
                      event.badgeType === 'ai' ? 'badge-ai-suggested' : 
                      event.badgeType === 'human' ? 'badge-medium' : 
                      event.badgeType === 'resolution' ? 'badge-resolved' : 'badge-open'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {event.badgeType.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {event.description}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Obs: {event.observationId} • Actor: {event.actor}
                  </div>
                </div>

                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Category Breakdown & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: 'var(--accent-indigo)' }} />
              Category Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { cat: 'plumbing', label: 'Plumbing & Water', icon: Droplets, color: '#38bdf8' },
                { cat: 'safety', label: 'Slip & Life Safety', icon: AlertTriangle, color: '#f59e0b' },
                { cat: 'electrical', label: 'Electrical & Power', icon: Zap, color: '#fbbf24' },
                { cat: 'hvac', label: 'HVAC & Climate', icon: Wind, color: '#818cf8' },
                { cat: 'access', label: 'Access Control', icon: DoorClosed, color: '#10b981' },
              ].map(item => {
                const count = categoryCounts[item.cat] || 0;
                return (
                  <div 
                    key={item.cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <item.icon size={15} style={{ color: item.color }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Reporting CTA Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.25rem' 
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
              Report a New Campus Issue
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
              Submit an observation with instant real-time memory scanning to identify related historical problems.
            </p>
            <button 
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={onOpenReportModal}
            >
              <PlusCircle size={15} />
              Open Reporting Form
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
