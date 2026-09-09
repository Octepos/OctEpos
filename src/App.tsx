import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Server, 
  Flame, 
  RefreshCw, 
  ExternalLink, 
  Github, 
  Cloud, 
  Briefcase 
} from 'lucide-react';
import { 
  INITIAL_SUBSTRATES, 
  INITIAL_PROXMOX_CONFIG, 
  INITIAL_CANARY_STATE, 
  INITIAL_FORENSIC_EVENTS,
  INITIAL_POLICY_DECISIONS 
} from './data/mockScenarios';
import { 
  SubstrateId, 
  ForensicEvent, 
  ProxmoxClusterConfig, 
  CanaryState,
  AppMode,
  PolicyDecision
} from './types/octepos';
import { TopNav } from './components/TopNav';
import { SubstratesGrid } from './components/SubstratesGrid';
import { ExecutionPipeline } from './components/ExecutionPipeline';
import { ForensicEventCard } from './components/ForensicEventCard';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { CommercialExecutiveView } from './components/CommercialExecutiveView';
import { DynamicPolicyModal } from './components/DynamicPolicyModal';
import { CommercialArchitectureModal } from './components/CommercialArchitectureModal';
import { PublicReleaseModal } from './components/PublicReleaseModal';
import { ProxmoxClusterModal } from './components/ProxmoxClusterModal';
import { AdversarialTestModal } from './components/AdversarialTestModal';
import { EpistemicPrincipleModal } from './components/EpistemicPrincipleModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { CloudRunPerimeterModal } from './components/CloudRunPerimeterModal';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('EXECUTIVE_AUDIT');
  const [substrates] = useState(INITIAL_SUBSTRATES);
  const [selectedSubstrateId, setSelectedSubstrateId] = useState<SubstrateId>('local');
  const [proxmoxConfig, setProxmoxConfig] = useState<ProxmoxClusterConfig>(INITIAL_PROXMOX_CONFIG);
  const [canaryState, setCanaryState] = useState<CanaryState>(INITIAL_CANARY_STATE);
  const [forensicEvents, setForensicEvents] = useState<ForensicEvent[]>(INITIAL_FORENSIC_EVENTS);
  const [policyDecisions, setPolicyDecisions] = useState<PolicyDecision[]>(INITIAL_POLICY_DECISIONS);
  const [isSseConnected, setIsSseConnected] = useState(true);

  // Modals state
  const [isAdversarialModalOpen, setIsAdversarialModalOpen] = useState(false);
  const [isProxmoxModalOpen, setIsProxmoxModalOpen] = useState(false);
  const [isEpistemicModalOpen, setIsEpistemicModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isPublicReleaseModalOpen, setIsPublicReleaseModalOpen] = useState(false);
  const [isAuditCertificateModalOpen, setIsAuditCertificateModalOpen] = useState(false);
  const [isCloudRunModalOpen, setIsCloudRunModalOpen] = useState(false);
  const [activeTestRunning, setActiveTestRunning] = useState(false);

  // Live Server-Sent Events (SSE) stream listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/telemetry/stream');
      es.onopen = () => setIsSseConnected(true);
      es.onerror = () => setIsSseConnected(false);

      es.addEventListener('connected', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          if (data.merkleEpoch) {
            setCanaryState(prev => ({
              ...prev,
              merkleEpoch: data.merkleEpoch,
              currentStateRoot: data.currentStateRoot || prev.currentStateRoot
            }));
          }
        } catch (err) {}
      });

      es.addEventListener('lifecycle_teardown', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          setCanaryState(prev => ({
            ...prev,
            merkleEpoch: data.merkleEpoch || prev.merkleEpoch + 1,
            currentStateRoot: data.currentStateRoot || prev.currentStateRoot,
            verifiedProofs: prev.verifiedProofs + 1
          }));
        } catch (err) {}
      });

      es.addEventListener('glass_floor_intercept', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          const newEvt: ForensicEvent = {
            id: `EVT-${data.handId || Date.now().toString(36)}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            substrateId: 'gemini',
            attemptedAction: data.policyRule || 'POLICY_VIOLATION_INTERCEPTED',
            targetResource: data.detail || 'Internal Network Socket / DB Core',
            violationCode: 'DETERMINISTIC_GLASS_FLOOR_INTERCEPT',
            violationCategory: 'NET_EGRESS',
            nonAnthropomorphicEvaluation: data.detail || 'Intercepted pre-syscall. Zero syscalls dispatched to underlying OS.',
            interceptLocation: 'USERSPACE_REFERENCE_MONITOR_DETERMINISTIC_GLASS_FLOOR',
            syscallsDispatched: 0,
            computeCost: 0,
            stateLeakage: '0.00%',
            ephemeralTokenId: data.handId || 'EPHEM-TOKEN-AUTO',
            merkleStateRoot: canaryState.currentStateRoot,
            rawPayload: data,
            remediated: true
          };
          setForensicEvents(prev => [newEvt, ...prev]);
        } catch (err) {}
      });
    } catch (err) {
      console.warn('SSE connection skipped in client:', err);
    }

    return () => {
      es?.close();
    };
  }, []);

  const handleForensicTriggered = (newEvent: ForensicEvent) => {
    setForensicEvents(prev => [newEvent, ...prev]);
  };

  const handleDismissForensic = (id: string) => {
    setForensicEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleLogPolicyDecision = (newDecision: PolicyDecision) => {
    setPolicyDecisions(prev => [newDecision, ...prev]);
  };

  const handleMerkleRootUpdated = () => {
    const nextRoot = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCanaryState(prev => ({
      ...prev,
      currentStateRoot: prev.nextStateRoot,
      nextStateRoot: nextRoot,
      merkleEpoch: prev.merkleEpoch + 1,
      verifiedProofs: prev.verifiedProofs + 1
    }));
  };

  const handleRefreshCanary = () => {
    const reseededRoot = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCanaryState(prev => ({
      ...prev,
      currentStateRoot: reseededRoot,
      nextStateRoot: reseededRoot,
      entropyNonce: `0x${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)} (reseeded)`,
      divergencePercentage: 0.0000
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col cockpit-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar with Mode Switcher & Audit Triggers */}
      <TopNav
        appMode={appMode}
        onToggleAppMode={(mode) => setAppMode(mode)}
        onRunAdversarialTest={() => setIsAdversarialModalOpen(true)}
        onOpenProxmoxConfig={() => setIsProxmoxModalOpen(true)}
        onOpenEpistemicGuide={() => setIsEpistemicModalOpen(true)}
        onOpenPolicyManager={() => setIsPolicyModalOpen(true)}
        onOpenArchitectureExplorer={() => setIsArchitectureModalOpen(true)}
        onOpenPublicRelease={() => setIsPublicReleaseModalOpen(true)}
        onOpenCertificateModal={() => setIsAuditCertificateModalOpen(true)}
        onOpenCloudRunPerimeter={() => setIsCloudRunModalOpen(true)}
        isSseConnected={isSseConnected}
        activeTestRunning={activeTestRunning}
        forensicCount={forensicEvents.length}
      />

      {/* Main Cockpit Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Banner Alert: Reference Monitor Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-neutral-300 font-semibold">
              REFERENCE MONITOR INVARIANT:
            </span>
            <span className="text-neutral-400">
              {appMode === 'EXECUTIVE_AUDIT'
                ? 'Stateless execution enforced. Physical memory dropped upon verified artifact return. 0 master ledger mutations.'
                : 'Recursive attenuation enforced across all substrates. Zero Ambient Authority.'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              Proxmox Cluster: <strong className="text-neutral-200">2/2 Nodes</strong>
            </span>
            <span className="text-neutral-600">|</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Glass Floor: <strong className="text-emerald-400">0 Syscalls Sink</strong>
            </span>
          </div>
        </div>

        {/* View Mode Switching */}
        {appMode === 'EXECUTIVE_AUDIT' ? (
          /* Commercial Executive & Auditor View */
          <CommercialExecutiveView
            canaryState={canaryState}
            policyDecisions={policyDecisions}
            onLogPolicyDecision={handleLogPolicyDecision}
            onOpenPolicyManager={() => setIsPolicyModalOpen(true)}
            onOpenArchitectureExplorer={() => setIsArchitectureModalOpen(true)}
            onOpenPublicRelease={() => setIsPublicReleaseModalOpen(true)}
            onOpenCertificateModal={() => setIsAuditCertificateModalOpen(true)}
            onOpenCloudRunPerimeter={() => setIsCloudRunModalOpen(true)}
            onSelectSubstrate={(id) => setSelectedSubstrateId(id)}
          />
        ) : (
          /* Developer & Systems Engineering View */
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Intelligence Substrates 3-Column Layout */}
            <section id="section-substrates">
              <SubstratesGrid
                substrates={substrates}
                selectedSubstrateId={selectedSubstrateId}
                onSelectSubstrate={(id) => setSelectedSubstrateId(id)}
                onOpenProxmoxConfig={() => setIsProxmoxModalOpen(true)}
                thinkCentreNodes={proxmoxConfig.nodes}
              />
            </section>

            {/* 2. Central Execution Pipeline (Intent → Allocation → Hand → Brokered Action → Result) */}
            <section id="section-pipeline">
              <ExecutionPipeline
                selectedSubstrateId={selectedSubstrateId}
                onForensicTriggered={handleForensicTriggered}
                onMerkleRootUpdated={handleMerkleRootUpdated}
              />
            </section>

            {/* 3. Forensic Event Cards */}
            <section id="section-forensics" className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2 font-mono">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                    Audited Forensic Events
                  </h2>
                  <span className="rounded-full border border-red-500/40 bg-red-950/60 px-2 py-0.2 text-[10px] font-bold text-red-300">
                    {forensicEvents.length} INTERCEPTS LOGGED
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  NON-ANTHROPOMORPHIC BOUNDED EVALUATION
                </span>
              </div>

              <div className="space-y-3">
                {forensicEvents.map((evt) => (
                  <ForensicEventCard
                    key={evt.id}
                    event={evt}
                    onDismiss={() => handleDismissForensic(evt.id)}
                  />
                ))}
              </div>
            </section>

            {/* 4. Telemetry Dashboard */}
            <section id="section-telemetry">
              <div className="border-b border-neutral-800 pb-2 mb-4 flex items-center justify-between font-mono">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                  Audited Telemetry & Invariance Dashboard
                </h2>
                <span className="text-xs text-emerald-400 font-semibold">
                  CRYPTO-ATTESTED PROVENANCE
                </span>
              </div>

              <TelemetryDashboard
                canaryState={canaryState}
                onRefreshCanary={handleRefreshCanary}
                interceptCount={forensicEvents.length}
              />
            </section>
          </div>
        )}
      </main>

      {/* Cockpit Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950/90 py-5 text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-300 font-semibold">OCTEPOS Enterprise Sovereign</span>
            <span>• Merkle Provenance Root: {canaryState.currentStateRoot.substring(0, 18)}...</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <Cloud className="h-3.5 w-3.5 text-cyan-400" />
              Cloud Run Direct Container Ready
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Github className="h-3.5 w-3.5 text-neutral-300" />
              Merkle Provenance Chain Exportable
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdversarialTestModal
        isOpen={isAdversarialModalOpen}
        onClose={() => setIsAdversarialModalOpen(false)}
        onEmitForensicEvent={handleForensicTriggered}
      />

      <ProxmoxClusterModal
        isOpen={isProxmoxModalOpen}
        onClose={() => setIsProxmoxModalOpen(false)}
        config={proxmoxConfig}
        onSaveConfig={(updated) => setProxmoxConfig(updated)}
      />

      <EpistemicPrincipleModal
        isOpen={isEpistemicModalOpen}
        onClose={() => setIsEpistemicModalOpen(false)}
      />

      <DynamicPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      <CommercialArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <PublicReleaseModal
        isOpen={isPublicReleaseModalOpen}
        onClose={() => setIsPublicReleaseModalOpen(false)}
        onRunTest={() => setIsAdversarialModalOpen(true)}
      />

      <AuditCertificateModal
        isOpen={isAuditCertificateModalOpen}
        onClose={() => setIsAuditCertificateModalOpen(false)}
        canaryState={canaryState}
      />

      <CloudRunPerimeterModal
        isOpen={isCloudRunModalOpen}
        onClose={() => setIsCloudRunModalOpen(false)}
      />
    </div>
  );
}
