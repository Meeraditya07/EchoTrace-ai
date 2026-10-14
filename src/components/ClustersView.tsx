import { 
  GitBranch, 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import type { Observation } from '../types';

interface ClustersViewProps {
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
}

interface ClusterGroup {
  id: string;
  name: string;
  building: string;
  zone: string;
  primaryRisk: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  observations: Observation[];
  timespan: string;
  summary: string;
}

export const ClustersView: React.FC<ClustersViewProps> = ({
  observations,
  onSelectObservation
}) => {
  // Build cluster groups based on observations
  const curieObs = observations.filter(o => o.building.includes('Curie') || o.specificLocation.includes('Lab 204'));
  const turingObs = observations.filter(o => o.building.includes('Turing'));
  const otherObs = observations.filter(o => !curieObs.includes(o) && !turingObs.includes(o));

  const clusters: ClusterGroup[] = [
    {
      id: 'cluster-curie-204',
      name: 'Curie Science Hall Lab 204 Moisture & Recurrent Slip Sequence',
      building: 'Curie Science Hall',
      zone: '2nd Floor Corridor outside Chemistry Lab 204',
      primaryRisk: 'Repeated Slip Hazard / Subfloor Water Intrusion',
      riskLevel: 'High',
      observations: curieObs,
      timespan: 'Oct 05 – Oct 09 (5-Day Active Sequence)',
      summary: 'Sequential progression starting with ceiling acoustic tile drip, followed 49 hours later by hallway slipping reports, and a subsequent recurrent wet floor after custodial mopping.'
    },
    {
      id: 'cluster-turing-power',
      name: 'Turing Engineering Ground Floor Electrical & Thermal Load Chain',
      building: 'Turing Engineering Center',
      zone: 'Ground Floor & 2nd Floor Wings',
      primaryRisk: 'Subpanel Overload / Intermittent Airflow Failure',
      riskLevel: 'Moderate',
      observations: turingObs,
      timespan: 'Oct 10 – Oct 12 (48-Hour Sequence)',
      summary: 'Graphics Lab workstation breaker trips accompanied by elevated lecture hall temperature complaints, indicating heavy circuit load.'
    }
  ];

  if (otherObs.length > 0) {
    clusters.push({
      id: 'cluster-campus-perimeter',
      name: 'Campus Perimeter Security & Access Hardware',
      building: 'Oak Student Dormitory',
      zone: 'West Wing Ground Exit',
      primaryRisk: 'Unsecured Exterior Egress Door',
      riskLevel: 'Moderate',
      observations: otherObs,
      timespan: 'Active Observation',
      summary: 'Heavy latch mechanism failing to catch automatically, leaving perimeter entry vulnerable.'
    });
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch size={22} style={{ color: 'var(--accent-indigo)' }} />
          Temporal Pattern Clusters
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          EchoTrace AI synthesizes isolated complaints into multi-stage problem chains. Inspect clusters to understand upstream causes and prevent repeats.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {clusters.map(cluster => (
          <div 
            key={cluster.id}
            style={{
              background: 'var(--bg-surface-1)',
              border: `1px solid ${cluster.riskLevel === 'High' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Cluster Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="badge" style={{ 
                    background: cluster.riskLevel === 'High' ? 'var(--accent-rose-glow)' : 'var(--accent-amber-glow)',
                    color: cluster.riskLevel === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                    border: `1px solid ${cluster.riskLevel === 'High' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {cluster.riskLevel} Recurrence Risk
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {cluster.timespan}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {cluster.name}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} style={{ color: 'var(--accent-cyan)' }} />
                <span>{cluster.building} ({cluster.zone})</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {cluster.summary}
            </p>

            {/* Sequence Cards */}
            <div style={{
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Chronological Problem Chain ({cluster.observations.length} Observations Linked)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {cluster.observations.map((obs, idx) => (
                  <div 
                    key={obs.id}
                    onClick={() => onSelectObservation(obs)}
                    style={{
                      background: 'var(--bg-surface-1)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 150ms'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)'
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="obs-id">#{obs.id}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {obs.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {new Date(obs.timestamp).toLocaleDateString()} • {obs.specificLocation}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600 }}>
                      <span>Review Details</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
