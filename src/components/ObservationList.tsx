import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Tag, 
  ChevronRight, 
  Filter, 
  RotateCcw
} from 'lucide-react';
import type { FilterState, Observation, ProblemStatus, Severity } from '../types';

interface ObservationListProps {
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
  onOpenReportModal: () => void;
}

export const ObservationList: React.FC<ObservationListProps> = ({
  observations,
  onSelectObservation,
  onOpenReportModal
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    building: 'all',
    severity: 'all',
    status: 'all',
    onlyRecurring: false
  });

  const buildings = Array.from(new Set(observations.map(o => o.building)));

  const filteredObservations = observations.filter(obs => {
    // Search query match
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchText = `${obs.id} ${obs.title} ${obs.description} ${obs.building} ${obs.specificLocation} ${obs.tags.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Category filter
    if (filters.category !== 'all' && obs.category !== filters.category) {
      return false;
    }

    // Building filter
    if (filters.building !== 'all' && obs.building !== filters.building) {
      return false;
    }

    // Severity filter
    if (filters.severity !== 'all' && obs.severity !== filters.severity) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && obs.status !== filters.status) {
      return false;
    }

    // Only recurring
    if (filters.onlyRecurring) {
      const hasRecurring = obs.suggestedMatches && obs.suggestedMatches.some(m => m.overallConfidence >= 60);
      if (!hasRecurring) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      building: 'all',
      severity: 'all',
      status: 'all',
      onlyRecurring: false
    });
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'low': return <span className="badge badge-low">Low</span>;
      case 'medium': return <span className="badge badge-medium">Medium</span>;
      case 'high': return <span className="badge badge-high">High</span>;
      case 'critical': return <span className="badge badge-critical">Critical</span>;
    }
  };

  const getStatusBadge = (st: ProblemStatus) => {
    switch (st) {
      case 'open': return <span className="badge badge-open">Open</span>;
      case 'investigating': return <span className="badge badge-investigating">Investigating</span>;
      case 'action_taken': return <span className="badge badge-medium">Action Taken</span>;
      case 'resolved': return <span className="badge badge-resolved">Resolved</span>;
    }
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search problems by keyword, room, tag, or #ID..."
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>

        <div className="filter-selects">
          <select 
            className="select-ctrl"
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing & Water</option>
            <option value="safety">Slip & Safety</option>
            <option value="electrical">Electrical & Power</option>
            <option value="hvac">HVAC & Climate</option>
            <option value="access">Access & Doors</option>
            <option value="structural">Structural</option>
            <option value="sanitation">Sanitation</option>
          </select>

          <select 
            className="select-ctrl"
            value={filters.building}
            onChange={e => setFilters(prev => ({ ...prev, building: e.target.value }))}
          >
            <option value="all">All Buildings</option>
            {buildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select 
            className="select-ctrl"
            value={filters.severity}
            onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select 
            className="select-ctrl"
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="action_taken">Action Taken</option>
            <option value="resolved">Resolved</option>
          </select>

          <button 
            className={`toggle-btn ${filters.onlyRecurring ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, onlyRecurring: !prev.onlyRecurring }))}
            title="Filter to only problems with AI-suggested recurrences"
          >
            <Sparkles size={14} />
            <span>Recurring Only</span>
          </button>

          {(filters.searchQuery || filters.category !== 'all' || filters.building !== 'all' || filters.severity !== 'all' || filters.status !== 'all' || filters.onlyRecurring) && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Observation List */}
      {filteredObservations.length === 0 ? (
        <div className="empty-state">
          <Filter className="empty-state-icon" />
          <h3 className="empty-state-title">No Matching Observations Found</h3>
          <p className="empty-state-text">
            No logged campus observations matched your current filter criteria. Try clearing search filters or report a new problem.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
              Reset Filters
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenReportModal}>
              Report Problem
            </button>
          </div>
        </div>
      ) : (
        <div className="observation-list">
          {filteredObservations.map(obs => {
            const topMatch = obs.suggestedMatches && obs.suggestedMatches.length > 0 ? obs.suggestedMatches[0] : null;
            const hasRecurringAlert = topMatch && topMatch.overallConfidence >= 60;

            return (
              <div 
                key={obs.id} 
                className="observation-card"
                onClick={() => onSelectObservation(obs)}
              >
                <div className="obs-card-header">
                  <div className="obs-card-title-row">
                    <span className="obs-id">{obs.id}</span>
                    <h3 className="obs-title">{obs.title}</h3>
                  </div>

                  <div className="obs-badges">
                    {getSeverityBadge(obs.severity)}
                    {getStatusBadge(obs.status)}
                    {hasRecurringAlert && (
                      <span className="badge badge-ai-suggested">
                        <Sparkles size={12} />
                        Echo Pattern ({topMatch.overallConfidence}%)
                      </span>
                    )}
                  </div>
                </div>

                <p className="obs-card-desc">
                  {obs.description}
                </p>

                <div className="obs-card-meta">
                  <div className="meta-group">
                    <div className="meta-item">
                      <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                      <span><strong>{obs.building}</strong> • {obs.specificLocation}</span>
                    </div>

                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{new Date(obs.timestamp).toLocaleDateString()} at {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="meta-item">
                      <Tag size={14} />
                      <span style={{ textTransform: 'capitalize' }}>{obs.category}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>Inspect Memory</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
