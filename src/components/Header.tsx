import { 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  Info, 
  Layers, 
  ListFilter, 
  GitBranch, 
  Clock
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'observations' | 'clusters' | 'timeline' | 'playbooks';
  setActiveTab: (tab: 'dashboard' | 'observations' | 'clusters' | 'timeline' | 'playbooks') => void;
  onOpenReportModal: () => void;
  onOpenAIModal: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAIModal,
  onResetData
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-area" onClick={() => setActiveTab('dashboard')}>
          <div className="logo-icon-wrap">
            <ShieldCheck size={24} />
          </div>
          <div className="brand-text">
            <h1>
              ECHOTRACE AI
              <span className="brand-badge">Memory System</span>
            </h1>
            <p className="brand-tagline">
              Remember the problem. Recognize the pattern. Prevent the repeat.
            </p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Main Navigation">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={16} />
            Dashboard
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'observations' ? 'active' : ''}`}
            onClick={() => setActiveTab('observations')}
          >
            <ListFilter size={16} />
            Problem Memory
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'clusters' ? 'active' : ''}`}
            onClick={() => setActiveTab('clusters')}
          >
            <GitBranch size={16} />
            Pattern Clusters
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={16} />
            Timeline
          </button>
        </nav>

        <div className="header-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenAIModal}
            title="Responsible AI & Algorithm Transparency"
          >
            <Info size={15} />
            <span>AI Principles</span>
          </button>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Reload Synthetic Demo Problem Sequence"
          >
            <RefreshCw size={14} />
            <span>Reset Demo</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenReportModal}
          >
            <PlusCircle size={16} />
            <span>Report Problem</span>
          </button>
        </div>
      </div>
    </header>
  );
};
