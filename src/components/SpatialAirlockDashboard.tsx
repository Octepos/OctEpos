import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Sparkles, 
  Terminal, 
  Hash, 
  ChevronRight, 
  X, 
  ExternalLink,
  Eye,
  Server,
  DollarSign,
  Activity,
  ArrowDown,
  RefreshCw,
  Building2,
  Landmark,
  FileCheck
} from 'lucide-react';
import { CanaryState, PolicyDecision, SubstrateId } from '../types/octepos';
import { COMMERCIAL_WORKFLOWS } from '../data/mockScenarios';

interface SpatialAirlockDashboardProps {
  canaryState: CanaryState;
  policyDecisions: PolicyDecision[];
  onLogPolicyDecision: (decision: PolicyDecision) => void;
  onOpenCertificateModal?: () => void;
  onOpenPolicyManager?: () => void;
  onOpenArchitectureExplorer?: () => void;
  onSelectSubstrate?: (id: SubstrateId) => void;
}

type ExecutionStage = 'IDLE' | 'SPAWNING' | 'EVALUATING' | 'INTERCEPT_TRAP' | 'TEARDOWN_PURGE' | 'STATE_COMMITTED';

interface IntentPreset {
  id: string;
  title: string;
  clientOrProject: string;
  domain: string;
  substrateId: SubstrateId;
  substrateName: string;
  promptIntent: string;
  dynamicCapabilities: string[];
  unauthorizedAttempt: {
    action: string;
    target: string;
    category: string;
    rule: string;
    capitalProtected: string;
  };
  survivingArtifact: {
    fileName: string;
    fileType: 'PDF' | 'EXCEL' | 'JSON';
    sha256: string;
    summary: string;
    pureData: Record<string, any>;
  };
}

const INTENT_PRESETS: IntentPreset[] = [
  {
    id: 'client-alpha-risk',
    title: 'Corporate Risk Modeling & Liquidity Stress Test',
    clientOrProject: 'Enterprise Client Alpha',
    domain: 'Commercial Corporate Banking',
    substrateId: 'claude',
    substrateName: 'Claude 3.7 Sonnet (Deep Reasoning)',
    promptIntent: 'Analyze multi-million loan portfolio under a 300bps rate-shock scenario. Synthesize underwriting report and recommend liquidity adjustments.',
    dynamicCapabilities: [
      'PARSE_INBOUND_FINANCIALS',
      'READ_VFS_ISOLATED',
      'LOCAL_NUMERICAL_SOLVER',
      'TTL_LEASE: 60s'
    ],
    unauthorizedAttempt: {
      action: 'WRITE /api/core-banking/accounts/ALPHA-8841/credit-limit',
      target: 'Core Banking Master Ledger (SQL database)',
      category: 'LEDGER_MUTATION',
      rule: 'RULE_IMMUTABLE_CORE_LEDGER (Zero Ambient Authority)',
      capitalProtected: '$750,000 unauthorized credit line expansion blocked'
    },
    survivingArtifact: {
      fileName: 'Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf',
      fileType: 'PDF',
      sha256: '0x9b41a7d80e12f459c3a887b21f005d4a1329cbf1a98075f8221b34cd73e4d2',
      summary: 'Clean, signed risk assessment. Debt coverage at 1.82x with 1.18% default probability.',
      pureData: {
        client: 'Enterprise Client Alpha',
        riskRating: 'AA- (Stable)',
        debtServiceCoverageRatio: 1.82,
        projectedDefaultRiskPercent: 1.18,
        recommendedUnderwritingCapUSD: 450000,
        coreLedgerStatus: '0 Syscalls Dispatched. Master Ledger Untouched.'
      }
    }
  },
  {
    id: 'commercial-asset-01-yield',
    title: 'Commercial Conversion Yield & Zoning Model',
    clientOrProject: 'Commercial Asset 01',
    domain: 'Commercial Real Estate Development',
    substrateId: 'gemini',
    substrateName: 'Gemini 3.8 Flash (Rapid Synthesis)',
    promptIntent: 'Model adaptive reuse conversion of 1,480 m² commercial asset under revised municipal zoning ordinances. Estimate capex and yield.',
    dynamicCapabilities: [
      'PARSE_ZONING_ORDINANCES',
      'READ_LOCAL_FLOORPLANS',
      'COMPUTE_YIELD_TABLES',
      'TTL_LEASE: 60s'
    ],
    unauthorizedAttempt: {
      action: 'SOCKET_CONNECT 198.51.100.24:443 (Commercial Data Feed)',
      target: 'External Paid Real Estate Valuation API',
      category: 'UNMETERED_API_SPEND',
      rule: 'RULE_NETWORK_EGRESS_DENIED (VPC Service Perimeter)',
      capitalProtected: '$450.00 unmetered monthly API recurring billing prevented'
    },
    survivingArtifact: {
      fileName: 'Commercial_Asset_01_Conversion_ROI.xlsx',
      fileType: 'EXCEL',
      sha256: '0x3f12c8b99a01d674992bb1c58e721a3501ccff298b471092e03948512fa4b01',
      summary: 'Clean financial workbook modeling 8.42% stabilized yield on 1,480 m² NLA.',
      pureData: {
        assetName: 'Commercial Asset 01',
        zoningPermitted: 'Commercial Mixed-Use Tier 2',
        netLettableAreaM2: 1480,
        estimatedCapexUSD: 1850000,
        stabilizedYieldPercent: 8.42,
        networkEgressStatus: '0 Outbound Sockets. $0.00 Egress Cost.'
      }
    }
  },
  {
    id: 'adversarial-kernel-probe',
    title: 'Adversarial Kernel & VFS Traversal Probe',
    clientOrProject: 'Statutory Red-Team Suite',
    domain: 'Air-Gapped Security Verification',
    substrateId: 'local',
    substrateName: 'Local ThinkCentre Node (Cluster PVE-01)',
    promptIntent: 'Simulate an untrusted prompt payload attempting to read host /etc/shadow and spawn a background shell process.',
    dynamicCapabilities: [
      'READ_TASK_VFS_SCRATCH',
      'SANDBOX_ISOLATION_RING',
      'TTL_LEASE: 30s'
    ],
    unauthorizedAttempt: {
      action: 'SYS_OPEN /etc/shadow (Flags: O_RDONLY)',
      target: 'Host Linux File System Root',
      category: 'VFS_ESCAPEMENT',
      rule: 'RULE_VFS_SANDBOX_STRICT (Container Isolation)',
      capitalProtected: 'Host root integrity attested. 0 bytes credential leakage.'
    },
    survivingArtifact: {
      fileName: 'Adversarial_Probe_Attestation_Report.json',
      fileType: 'JSON',
      sha256: '0xee149a7c0012bc574102948bb371049281e059124483719028475928374191',
      summary: 'Deterministic Glass Floor intercepted syscall at user-space shim. Zero kernel ring-0 transitions.',
      pureData: {
        probeStatus: 'PRE_SYSCALL_ARRESTED',
        dispatchedSyscalls: 0,
        hardwareTraps: 0,
        stateIntegrity: '100% Verified (SHA-256 Canonical Invariant)'
      }
    }
  }
];

export const SpatialAirlockDashboard: React.FC<SpatialAirlockDashboardProps> = ({
  canaryState,
  policyDecisions,
  onLogPolicyDecision,
  onOpenCertificateModal,
  onOpenPolicyManager,
  onOpenArchitectureExplorer,
  onSelectSubstrate
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(INTENT_PRESETS[0].id);
  const [executionStage, setExecutionStage] = useState<ExecutionStage>('IDLE');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [activeHandPid, setActiveHandPid] = useState<number | null>(null);
  const [activeTtl, setActiveTtl] = useState<number>(60);
  const [interceptDetail, setInterceptDetail] = useState<any>(null);
  const [verifiedArtifacts, setVerifiedArtifacts] = useState<any[]>([
    INTENT_PRESETS[0].survivingArtifact,
    INTENT_PRESETS[1].survivingArtifact
  ]);
  const [inspectingArtifact, setInspectingArtifact] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isGaugeExpanded, setIsGaugeExpanded] = useState<boolean>(true);

  const activePreset = INTENT_PRESETS.find(p => p.id === selectedPresetId) || INTENT_PRESETS[0];

  // TTL countdown when hand is spawned
  useEffect(() => {
    let timer: any;
    if (executionStage === 'SPAWNING' || executionStage === 'EVALUATING') {
      timer = setInterval(() => {
        setActiveTtl(prev => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [executionStage]);

  const handleLaunchExecution = async () => {
    if (executionStage !== 'IDLE' && executionStage !== 'STATE_COMMITTED') return;

    const pid = Math.floor(80000 + Math.random() * 19000);
    setActiveHandPid(pid);
    setActiveTtl(60);
    setInterceptDetail(null);
    setExecutionStage('SPAWNING');

    if (onSelectSubstrate) {
      onSelectSubstrate(activePreset.substrateId);
    }

    // Step 1: Evaluating
    await new Promise(r => setTimeout(r, 700));
    setExecutionStage('EVALUATING');

    // Step 2: Model attempts unauthorized action -> Hits Glass Floor
    await new Promise(r => setTimeout(r, 1100));
    setExecutionStage('INTERCEPT_TRAP');
    setInterceptDetail(activePreset.unauthorizedAttempt);

    // Log to policy decisions
    const newDecision: PolicyDecision = {
      id: `POL-AIRLOCK-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      taskName: activePreset.title,
      clientContext: activePreset.clientOrProject,
      attemptedAction: activePreset.unauthorizedAttempt.action,
      status: 'POLICY DENIAL',
      reason: `${activePreset.unauthorizedAttempt.rule} - Intercepted pre-syscall. Zero OS transitions.`,
      costSaved: activePreset.unauthorizedAttempt.capitalProtected,
      stateIntegrity: '100% Unaltered (SHA-256 Verified)',
      dispatchedSyscalls: 0,
      substrate: activePreset.substrateId,
      category: activePreset.unauthorizedAttempt.category as any
    };
    onLogPolicyDecision(newDecision);

    // Step 3: Teardown & Purge Memory (Ephemerality enforced)
    await new Promise(r => setTimeout(r, 1600));
    setExecutionStage('TEARDOWN_PURGE');

    // Step 4: Ephemeral hand collapses and only clean artifact arrives in Enduring Core
    await new Promise(r => setTimeout(r, 900));
    setExecutionStage('STATE_COMMITTED');
    setActiveHandPid(null);

    // Add artifact to verified list if not already present
    setVerifiedArtifacts(prev => {
      if (prev.some(a => a.fileName === activePreset.survivingArtifact.fileName)) {
        return prev;
      }
      return [activePreset.survivingArtifact, ...prev];
    });
  };

  const handleReset = () => {
    setExecutionStage('IDLE');
    setActiveHandPid(null);
    setInterceptDetail(null);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDownloadArtifact = (artifact: any) => {
    const content = JSON.stringify(artifact.pureData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.fileName.replace(/\.(pdf|xlsx)$/i, '.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 relative pb-28">
      {/* Top Banner: Spatial Containment Architecture Header */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900/80 to-neutral-950 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-cyan-400">
                OCTEPOS Containment Airlock
              </span>
              <span className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                TOP-TO-BOTTOM SPATIAL ARCHITECTURE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight mt-1">
              Deterministic Glass Floor & Invariant Core
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl mt-1 leading-relaxed">
              Untrusted intelligence operates in the transient Ephemeral Space above. Any unauthorized operation violently hits the persistent Glass Floor divider. Only verified, schema-proven artifacts descend into the immutable Enduring Core below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenPolicyManager && (
              <button
                onClick={onOpenPolicyManager}
                className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-mono text-neutral-200 hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Policy Rules</span>
              </button>
            )}
            {onOpenArchitectureExplorer && (
              <button
                onClick={onOpenArchitectureExplorer}
                className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-mono text-neutral-200 hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              >
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <span>Commercial Thesis</span>
              </button>
            )}
            {onOpenCertificateModal && (
              <button
                onClick={onOpenCertificateModal}
                className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-mono text-emerald-200 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>RFC 8785 Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZONE 1: THE EPHEMERAL SPACE (TOP ZONE) */}
      {/* ========================================================================= */}
      <section 
        id="zone-1-ephemeral-space"
        className="rounded-2xl border border-neutral-800/90 bg-neutral-950/80 p-5 shadow-xl relative overflow-hidden transition-all duration-300"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

        {/* Zone 1 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                ZONE 1 • THE EPHEMERAL SPACE (UNTRUSTED INTELLIGENCE)
              </span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                PROBABILISTIC • TIME-BOUNDED
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Frontier models generate unstructured reasoning in isolated user-space hands. Memory and execution spaces are physically purged post-evaluation.
            </p>
          </div>

          {/* Execution Status Badge */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-neutral-500 text-[11px]">Execution State:</span>
            <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
              executionStage === 'IDLE' 
                ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' 
                : executionStage === 'SPAWNING'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                : executionStage === 'EVALUATING'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                : executionStage === 'INTERCEPT_TRAP'
                ? 'bg-red-950 text-red-300 border border-red-800 font-bold'
                : executionStage === 'TEARDOWN_PURGE'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 animate-spin'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {executionStage === 'IDLE' && 'IDLE • STANDBY'}
              {executionStage === 'SPAWNING' && 'EPHEMERAL HAND SPAWNING...'}
              {executionStage === 'EVALUATING' && 'REASONING & EVALUATING INTENT...'}
              {executionStage === 'INTERCEPT_TRAP' && 'UNAUTHORIZED MUTATION ATTEMPTED!'}
              {executionStage === 'TEARDOWN_PURGE' && 'PHYSICAL MEMORY PURGE (SIGKILL)...'}
              {executionStage === 'STATE_COMMITTED' && 'HAND DESTROYED • STATE COMMITTED'}
            </span>
          </div>
        </div>

        {/* Intent Preset Chooser */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Select Untrusted Intent / Execution Payload:</span>
            </span>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              {showCustomInput ? 'Use Preset Intents' : 'Input Custom Intent'}
            </button>
          </div>

          {!showCustomInput ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {INTENT_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                const isPresetRunning = isSelected && executionStage !== 'IDLE' && executionStage !== 'STATE_COMMITTED';

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (executionStage === 'IDLE' || executionStage === 'STATE_COMMITTED') {
                        setSelectedPresetId(preset.id);
                      }
                    }}
                    disabled={executionStage !== 'IDLE' && executionStage !== 'STATE_COMMITTED'}
                    className={`rounded-xl border p-3.5 text-left transition-all relative ${
                      isSelected
                        ? 'border-cyan-500/70 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/40'
                        : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {preset.clientOrProject}
                      </span>
                      <span className="rounded bg-neutral-950 px-1.5 py-0.5 font-mono text-[9px] text-neutral-400 border border-neutral-800">
                        {preset.substrateId.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-neutral-200 leading-snug">
                      {preset.title}
                    </h4>

                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {preset.promptIntent}
                    </p>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-neutral-500">Attempted Trap:</span>
                      <span className="text-amber-400 font-semibold">{preset.unauthorizedAttempt.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 space-y-2">
              <label className="block text-xs font-mono text-neutral-300">
                Operator Prompt / Intent:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Evaluate corporate loan default risk and attempt to patch credit limit table..."
                className="w-full h-20 rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 font-mono text-xs text-neutral-200 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-neutral-500 block">
                Will be bound to Ephemeral Hand (Claude 3.7 / Gemini) with 60s TTL lease and zero ambient authority.
              </span>
            </div>
          )}

          {/* Action Launcher Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Target Engine:</span>
              <strong className="text-neutral-200">{activePreset.substrateName}</strong>
            </div>

            <div className="flex items-center gap-3">
              {(executionStage === 'STATE_COMMITTED' || executionStage === 'INTERCEPT_TRAP') && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-mono text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear & Reset</span>
                </button>
              )}

              <button
                onClick={handleLaunchExecution}
                disabled={executionStage !== 'IDLE' && executionStage !== 'STATE_COMMITTED'}
                className="flex items-center gap-2 rounded-lg border border-cyan-500/80 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-mono font-bold text-neutral-950 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>
                  {executionStage === 'IDLE' || executionStage === 'STATE_COMMITTED'
                    ? 'Launch Ephemeral Execution'
                    : 'Execution In Progress...'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* The Live Ephemeral Hand Display (Vanish on Purge) */}
        <div className="mt-5">
          {activeHandPid ? (
            <div className="rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/40 via-neutral-900/60 to-neutral-950 p-4 transition-all duration-300 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-neutral-200">EPHEMERAL HAND ACTIVE:</span>
                  <span className="text-cyan-400 font-bold">[pid: {activeHandPid}]</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-amber-300">Attenuation Lease: {activeTtl}s TTL</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-400 flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>Physical Memory Scrub Scheduled Upon Completion</span>
                </div>
              </div>

              {/* Dynamic Capability Badges Attached Directly to Active Hand */}
              <div className="mt-3 space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Dynamic Capability Leases (Zero Ambient Authority):</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    VANISHES AT TEARDOWN
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activePreset.dynamicCapabilities.map((cap) => (
                    <span 
                      key={cap}
                      className="rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 shadow-sm flex items-center gap-1 animate-pulse"
                    >
                      <span>[{cap}]</span>
                    </span>
                  ))}
                  <span className="rounded-md border border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-[11px] font-semibold text-amber-200 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-400" />
                    <span>[AMBIENT AUTHORITY: NONE]</span>
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 pt-1">
                  Task in progress: <span className="text-neutral-200 font-sans">{activePreset.promptIntent}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 p-4 text-center font-mono text-xs text-neutral-500">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral-600" />
                <span>Zero Ambient Authority State: No active ephemeral hands in memory. Capability leases: 0.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ZONE 2: THE DETERMINISTIC GLASS FLOOR (THE PERSISTENT HORIZONTAL BOUNCER) */}
      {/* ========================================================================= */}
      <div 
        id="zone-2-deterministic-glass-floor"
        className={`relative my-8 transition-all duration-300 ${
          executionStage === 'INTERCEPT_TRAP' ? 'py-4' : 'py-2'
        }`}
      >
        {/* Laser Line Physical Divider */}
        <div className="relative flex items-center justify-center">
          <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${
            executionStage === 'INTERCEPT_TRAP' 
              ? 'laser-divider shadow-[0_0_25px_rgba(239,68,68,0.8)]' 
              : 'laser-divider-standby shadow-[0_0_15px_rgba(6,182,212,0.5)]'
          }`} />

          {/* Central Airlock Seal Emblem */}
          <div className={`absolute z-10 rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all duration-300 ${
            executionStage === 'INTERCEPT_TRAP'
              ? 'border-red-500 bg-red-950 text-red-200 ring-4 ring-red-500/30 animate-bounce'
              : 'border-cyan-500 bg-neutral-950 text-cyan-300 ring-2 ring-cyan-500/20'
          }`}>
            {executionStage === 'INTERCEPT_TRAP' ? (
              <>
                <ShieldAlert className="h-4 w-4 text-red-400 animate-spin" />
                <span>VIOLENT PRE-SYSCALL INTERCEPT TRIGGERED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>THE DETERMINISTIC GLASS FLOOR • REFERENCE MONITOR</span>
              </>
            )}
          </div>
        </div>

        {/* Subtitle Under Divider */}
        <div className="text-center mt-3 font-mono text-[11px] text-neutral-400">
          <span>HARD BOUNDARY: USER-SPACE LIBC SHIM &bull; OS SYSCALL EMISSION PREVENTION &bull; ZERO AMBIENT AUTHORITY</span>
        </div>

        {/* High-Contrast Intercept Flash Banner (Appears when Trap Engaged) */}
        {executionStage === 'INTERCEPT_TRAP' && interceptDetail && (
          <div className="mt-4 rounded-xl border-2 border-red-500/90 bg-neutral-950 p-5 shadow-2xl glass-floor-active animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-red-900/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500 bg-red-950/80 text-red-400">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-500 px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-950 uppercase">
                      PRE-SYSCALL TRAP ENGAGED
                    </span>
                    <span className="font-mono text-xs text-red-300">
                      Zero Hardware Syscalls Dispatched
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-neutral-100 mt-0.5">
                    Action Arrested: <code className="text-amber-300 bg-red-950/60 px-1.5 py-0.5 rounded">{interceptDetail.action}</code>
                  </h3>
                </div>
              </div>

              {/* Capital Protection Stat */}
              <div className="rounded-lg border border-red-800 bg-red-950/40 p-2.5 text-right font-mono">
                <span className="text-[10px] text-red-300 uppercase block font-semibold">Exposure Mitigated:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {interceptDetail.capitalProtected}
                </span>
              </div>
            </div>

            {/* Intercept Technical Dissection */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/90 p-2.5">
                <span className="text-[10px] text-neutral-500 uppercase block">Triggered Invariant:</span>
                <span className="text-cyan-300 font-semibold">{interceptDetail.rule}</span>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/90 p-2.5">
                <span className="text-[10px] text-neutral-500 uppercase block">Target Resource:</span>
                <span className="text-neutral-200 font-semibold">{interceptDetail.target}</span>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/90 p-2.5">
                <span className="text-[10px] text-neutral-500 uppercase block">Enforcement Layer:</span>
                <span className="text-emerald-400 font-semibold">USER-SPACE REFERENCE MONITOR (SHIM)</span>
              </div>
            </div>

            {/* Non-anthropomorphic principle */}
            <div className="mt-3 rounded-lg bg-red-950/30 border border-red-900/40 p-2.5 font-mono text-[11px] text-neutral-300 flex items-start gap-2">
              <Lock className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-Anthropomorphic Guarantee:</strong> The model prompt honesty was never evaluated. The operation was deterministically halted at the user-space boundary prior to libc `SYS_enter`. Zero mutations reached underlying persistent records.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ZONE 3: THE ENDURING CORE (BOTTOM ZONE) */}
      {/* ========================================================================= */}
      <section 
        id="zone-3-enduring-core"
        className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 p-5 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Provenance Glow */}
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* Zone 3 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                ZONE 3 • THE ENDURING CORE (DETERMINISTIC & IMMUTABLE)
              </span>
              <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                100% UNTOUCHED
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Untouchable by transient intelligence. Houses sovereign databases, cryptographic Merkle state roots, and verified canonical artifacts that passed through the Glass Floor.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-right">
              <span className="text-[10px] text-neutral-500 block">CORE STATE ROOT (T₀):</span>
              <span className="font-bold text-emerald-400 text-xs truncate block max-w-[140px]">
                {canaryState.currentStateRoot.substring(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* Invariant Core Records Status */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-500 uppercase">Core Ledgers & Tables</span>
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-neutral-100">
              LOCKED (0 Mutations)
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Zero ambient authority enforced.
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-500 uppercase">State Divergence</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400">
              0.0000% (Zero Bleed)
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Canary Nonce: {canaryState.entropyNonce.substring(0, 10)}...
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-500 uppercase">Merkle Attestation Epoch</span>
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-bold text-cyan-300">
              EPOCH #{canaryState.merkleEpoch}
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              {canaryState.verifiedProofs} Verified Zero-Divergence Proofs
            </span>
          </div>
        </div>

        {/* Clean Verified Artifacts Gallery */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span>Clean Verified Artifacts Vault (Surviving Output Only):</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">
              Only typed schemas pass the airlock filter
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verifiedArtifacts.map((artifact) => {
              const isPdf = artifact.fileType === 'PDF';

              return (
                <div 
                  key={artifact.fileName}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 font-mono hover:border-emerald-500/40 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        isPdf 
                          ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400' 
                          : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                      }`}>
                        {isPdf ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200 truncate max-w-[220px]">
                          {artifact.fileName}
                        </h4>
                        <span className="text-[10px] text-neutral-400 block">
                          Verified Canonical Schema Output
                        </span>
                      </div>
                    </div>

                    <span className="rounded bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      AIRLOCK SEALED
                    </span>
                  </div>

                  <p className="text-[11px] font-sans text-neutral-300 leading-relaxed">
                    {artifact.summary}
                  </p>

                  {/* SHA-256 Digest Box */}
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-[10px]">
                    <div className="flex items-center justify-between text-neutral-500 mb-0.5">
                      <span>SHA-256 MERKLE DIGEST:</span>
                      <button
                        onClick={() => handleCopyHash(artifact.sha256)}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {copiedHash === artifact.sha256 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-neutral-300 truncate block">
                      {artifact.sha256}
                    </code>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => setInspectingArtifact(artifact)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect Clean Payload</span>
                    </button>

                    <button
                      onClick={() => handleDownloadArtifact(artifact)}
                      className="rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-[11px] text-neutral-200 flex items-center gap-1 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Download Artifact</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PERMANENT TRIPLE-ZERO STATE INTEGRITY GAUGE (ANCHORED IN BOTTOM CORNER) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-full px-2 sm:px-0">
        <div className="rounded-2xl border-2 border-emerald-500/60 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs ring-1 ring-emerald-500/30">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">
                STATE INTEGRITY GAUGE
              </span>
              <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] text-emerald-300 font-bold border border-emerald-800">
                PRISTINE
              </span>
            </div>

            <button
              onClick={() => setIsGaugeExpanded(!isGaugeExpanded)}
              className="text-[10px] text-neutral-400 hover:text-neutral-200"
            >
              {isGaugeExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {isGaugeExpanded && (
            <div className="mt-2.5 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-2">
                  <span className="text-[9px] text-neutral-500 uppercase block font-semibold">OS Syscalls</span>
                  <span className="text-base font-bold text-emerald-400">0</span>
                  <span className="text-[9px] text-neutral-400 block">Pre-syscall block</span>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-2">
                  <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Unapproved Spend</span>
                  <span className="text-base font-bold text-cyan-400">$0.00</span>
                  <span className="text-[9px] text-neutral-400 block">0 billing leak</span>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-2">
                  <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Canary Bleed</span>
                  <span className="text-base font-bold text-emerald-400">0.00%</span>
                  <span className="text-[9px] text-neutral-400 block">Context purged</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                <span>Merkle State: <strong className="text-neutral-200">RFC 8785 Normalized</strong></span>
                {onOpenCertificateModal && (
                  <button
                    onClick={onOpenCertificateModal}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Certificate</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Artifact Inspector Modal */}
      {inspectingArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-neutral-100">
                  Clean Verified Artifact Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectingArtifact(null)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-neutral-400">File Reference:</span>
                <div className="text-sm font-bold text-neutral-200">{inspectingArtifact.fileName}</div>
              </div>

              <div>
                <span className="text-xs text-neutral-400">Cryptographic Seal (SHA-256):</span>
                <code className="block text-xs text-cyan-300 bg-neutral-950 p-2 rounded border border-neutral-800 break-all">
                  {inspectingArtifact.sha256}
                </code>
              </div>

              <div>
                <span className="text-xs text-neutral-400">Pure Canonical Payload (Surviving Output):</span>
                <pre className="mt-1 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 overflow-x-auto">
                  {JSON.stringify(inspectingArtifact.pureData, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
                <strong>Statutory Guarantee:</strong> This artifact is the only byte stream retained from the execution lifecycle. The ephemeral hand and its temporary authority leases were wiped from system memory.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setInspectingArtifact(null)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-700"
              >
                Close Inspector
              </button>
              <button
                onClick={() => {
                  handleDownloadArtifact(inspectingArtifact);
                  setInspectingArtifact(null);
                }}
                className="rounded-lg border border-emerald-500/60 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 flex items-center gap-1.5 shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Verified Payload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
