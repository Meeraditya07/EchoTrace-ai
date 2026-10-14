import { useState, useEffect } from 'react';
import { 
  getObservations, 
  createObservation, 
  updateObservationStatus, 
  verifyMatchRelationship, 
  togglePlaybookTask, 
  resetToSeedData, 
  calculateMetrics 
} from './services/storage';
import type { 
  Observation, 
  ProblemStatus, 
  VerificationStatus, 
  Category, 
  ReporterType, 
  Severity 
} from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ObservationList } from './components/ObservationList';
import { ClustersView } from './components/ClustersView';
import { TimelineView } from './components/TimelineView';
import { ObservationDetailModal } from './components/ObservationDetailModal';
import { ProblemReportModal } from './components/ProblemReportModal';
import { ResponsibleAIModal } from './components/ResponsibleAIModal';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export function App() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'observations' | 'clusters' | 'timeline' | 'playbooks'>('dashboard');
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loaded = getObservations();
    setObservations(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const metrics = calculateMetrics(observations);

  // Handlers
  const handleCreateObservation = (data: {
    title: string;
    description: string;
    category: Category;
    building: string;
    specificLocation: string;
    severity: Severity;
    reporterType: ReporterType;
    timestamp?: string;
  }) => {
    const newObs = createObservation(data);
    const updated = getObservations();
    setObservations(updated);
    setSelectedObservation(newObs);
    
    if (newObs.suggestedMatches.length > 0) {
      showToast(`Observation #${newObs.id} logged! ${newObs.suggestedMatches.length} AI Echo connection(s) identified.`);
    } else {
      showToast(`Observation #${newObs.id} saved to campus problem memory.`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ProblemStatus, notes?: string) => {
    const updatedObs = updateObservationStatus(id, newStatus, notes);
    if (updatedObs) {
      const updated = getObservations();
      setObservations(updated);
      setSelectedObservation(updatedObs);
      showToast(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    }
  };

  const handleVerifyMatch = (
    obsId: string, 
    targetId: string, 
    status: VerificationStatus, 
    notes?: string
  ) => {
    const updatedObs = verifyMatchRelationship(obsId, targetId, status, notes);
    if (updatedObs) {
      const updated = getObservations();
      setObservations(updated);
      setSelectedObservation(updatedObs);
      const isVerified = status === 'verified_related';
      showToast(isVerified 
        ? `Relationship to #${targetId} verified by field inspector.` 
        : `Relationship to #${targetId} rejected.`
      );
    }
  };

  const handleTogglePlaybookTask = (obsId: string, actionId: string) => {
    const updatedObs = togglePlaybookTask(obsId, actionId);
    if (updatedObs) {
      const updated = getObservations();
      setObservations(updated);
      setSelectedObservation(updatedObs);
      showToast('Preventive playbook progress recorded.');
    }
  };

  const handleResetData = () => {
    if (confirm('Reset to the standard multi-day water leak & slippery floor scenario demo dataset?')) {
      const reset = resetToSeedData();
      setObservations(reset);
      setSelectedObservation(null);
      showToast('Reset to default synthetic demo problem dataset.');
    }
  };

  return (
    <div className="app-container">
      {/* Toast alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main View Router */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            metrics={metrics}
            observations={observations}
            onSelectObservation={setSelectedObservation}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'observations' && (
          <ObservationList 
            observations={observations}
            onSelectObservation={setSelectedObservation}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'clusters' && (
          <ClustersView 
            observations={observations}
            onSelectObservation={setSelectedObservation}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView 
            observations={observations}
            onSelectObservation={setSelectedObservation}
          />
        )}
      </main>

      {/* Observation Detail Inspection Modal */}
      <ObservationDetailModal 
        observation={selectedObservation}
        allObservations={observations}
        onClose={() => setSelectedObservation(null)}
        onUpdateStatus={handleUpdateStatus}
        onVerifyMatch={handleVerifyMatch}
        onTogglePlaybookTask={handleTogglePlaybookTask}
        onSelectOtherObservation={setSelectedObservation}
      />

      {/* Report Problem Modal */}
      <ProblemReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        existingObservations={observations}
        onSubmit={handleCreateObservation}
      />

      {/* Responsible AI Modal */}
      <ResponsibleAIModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* App Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-1)',
        padding: '1.5rem',
        marginTop: 'auto',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong>ECHOTRACE AI</strong> — Temporal Problem Memory & Recurrence Prevention System.
            <div style={{ marginTop: '0.2rem' }}>
              Student Innovation Hackathon Prototype • Transparent Client-Side Heuristic Correlation v1.2
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
              Zero PII Collection
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={14} style={{ color: 'var(--accent-cyan)' }} />
              100% Transparent Local Logic
            </span>
            <span>•</span>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}
            >
              AI Principles Charter
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
