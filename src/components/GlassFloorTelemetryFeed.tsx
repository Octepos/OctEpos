import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Lock, 
  Trash2, 
  FileCheck, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Download, 
  Eye, 
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CanaryState, PolicyDecision, SubstrateId } from '../types/octepos';

interface GlassFloorTelemetryFeedProps {
  canaryState: CanaryState;
  onLogPolicyDecision?: (decision: PolicyDecision) => void;
  onSelectSubstrate?: (id: SubstrateId) => void;
}

interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SPAWN' | 'INTERCEPT' | 'ARTIFACT' | 'TEARDOWN';
  message: string;
  detail?: string;
  source: string;
  syscallDispatched: number;
}

const INITIAL_LOGS: TelemetryLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '17:21:04.102',
    type: 'SPAWN',
    source: 'SUBSTRATE_ROUTER',
    message: 'Ephemeral Hand spawned [pid: 88412] for Enterprise Client Alpha',
    detail: 'Substrate: Claude 3.7 Sonnet | Capability Lease: 60s TTL | Egress: 0 KB',
    syscallDispatched: 0
  },
  {
    id: 'log-2',
    timestamp: '17:21:05.430',
    type: 'INFO',
    source: 'CANARY_INJECTOR',
    message: 'Canary token embedded in ephemeral memory space',
    detail: 'Token: CANARY-FIN-8841-SECRET (SHA-256 bound, 0.00% leakage baseline)',
    syscallDispatched: 0
  },
  {
    id: 'log-3',
    timestamp: '17:21:06.812',
    type: 'INTERCEPT',
    source: 'GLASS_FLOOR_MONITOR',
    message: 'TRAP ENGAGED: Autonomous ledger write intercepted pre-syscall',
    detail: 'Target: `UPDATE corporate_accounts SET credit_limit = 750000` | Kernel syscalls: 0',
    syscallDispatched: 0
  },
  {
    id: 'log-4',
    timestamp: '17:21:07.210',
    type: 'ARTIFACT',
    source: 'SCHEMA_VERIFIER',
    message: 'Pure artifact extracted: Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf',
    detail: 'Signed SHA-256 digest: 0x9b41...e4d2 | Conforms strictly to RiskReportSchema v2',
    syscallDispatched: 0
  },
  {
    id: 'log-5',
    timestamp: '17:21:07.640',
    type: 'TEARDOWN',
    source: 'CONTAINER_PURGE',
    message: 'Physical memory scrubbed & namespace unmounted',
    detail: 'Residual memory bleed: 0.0000% | Ephemeral Hand dropped | Merkle root advanced',
    syscallDispatched: 0
  }
];

export const GlassFloorTelemetryFeed: React.FC<GlassFloorTelemetryFeedProps> = ({
  canaryState,
  onLogPolicyDecision,
  onSelectSubstrate
}) => {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>(INITIAL_LOGS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'CLIENT_ALPHA' | 'COMMERCIAL_ASSET_01' | 'PATH_TRAVERSAL' | 'CLEAN'>('CLIENT_ALPHA');
  const [glassFloorActive, setGlassFloorActive] = useState(false);
  const [totalSyscalls, setTotalSyscalls] = useState(0);
  const [teardownStage, setTeardownStage] = useState<'IDLE' | 'SPAWNED' | 'INTERCEPTED' | 'EXTRACTED' | 'SCRUBBED'>('SCRUBBED');
  const [lastExtractedArtifact, setLastExtractedArtifact] = useState<string>('Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf');

  const runSimulation = async (scenario: 'CLIENT_ALPHA' | 'COMMERCIAL_ASSET_01' | 'PATH_TRAVERSAL' | 'CLEAN') => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveScenario(scenario);
    setGlassFloorActive(false);

    const now = () => new Date().toISOString().substring(11, 23);

    if (scenario === 'CLIENT_ALPHA') {
      if (onSelectSubstrate) onSelectSubstrate('claude');
      setTeardownStage('SPAWNED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-1`,
          timestamp: now(),
          type: 'SPAWN',
          source: 'CAPABILITY_ROUTER',
          message: 'Spinning up Ephemeral Hand for Enterprise Client Alpha (Claude 3.7)',
          detail: 'Task: Liquidity Stress Modeling | Attenuation Lease: 60s | Ambient Authority: NONE',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-2`,
          timestamp: now(),
          type: 'INFO',
          source: 'CANARY_INJECTOR',
          message: `Injected state canary: ${canaryState.canaryToken}`,
          detail: 'State root monitored. Exfiltration via markdown/steganography will fail.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 900));
      setGlassFloorActive(true);
      setTeardownStage('INTERCEPTED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-3`,
          timestamp: now(),
          type: 'INTERCEPT',
          source: 'GLASS_FLOOR_MONITOR',
          message: 'PRE-SYSCALL INTERCEPT: Autonomous ledger mutation rejected',
          detail: 'Payload: `UPDATE accounts SET credit_limit = 750000` | Target: CORE_BANKING | Kernel Syscalls: 0',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      if (onLogPolicyDecision) {
        onLogPolicyDecision({
          id: `pol-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          substrateId: 'claude',
          taskContext: 'Enterprise Client Alpha - Liquidity Stress Simulation',
          attemptedAction: 'WRITE /api/core-banking/accounts/ALPHA-8841/credit-limit',
          actionCategory: 'LEDGER_MUTATION',
          policyRuleTriggered: 'RULE_IMMUTABLE_CORE_LEDGER (Zero Ambient Authority)',
          dispatchedSyscalls: 0,
          costSunkOrSaved: '$750,000 credit liability prevented',
          decision: 'DENIED_PRE_SYSCALL',
          pureArtifactProduced: 'Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf',
          processDroppedConfirmed: true
        });
      }

      await new Promise(r => setTimeout(r, 800));
      setTeardownStage('EXTRACTED');
      setLastExtractedArtifact('Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-4`,
          timestamp: now(),
          type: 'ARTIFACT',
          source: 'SCHEMA_VALIDATOR',
          message: 'Pure artifact extracted: Enterprise_Client_Alpha_Risk_Evaluation_2026.pdf',
          detail: 'Verified against canonical RiskSchema. Zero SQL / network commands returned.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setGlassFloorActive(false);
      setTeardownStage('SCRUBBED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-5`,
          timestamp: now(),
          type: 'TEARDOWN',
          source: 'CONTAINER_PURGE',
          message: 'Ephemeral Hand terminated. Memory scrubbed to 0.0000% residual.',
          detail: 'Namespaces unmounted. Process PID dropped. Merkle state root unpolluted.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);
    } else if (scenario === 'COMMERCIAL_ASSET_01') {
      if (onSelectSubstrate) onSelectSubstrate('gemini');
      setTeardownStage('SPAWNED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-1`,
          timestamp: now(),
          type: 'SPAWN',
          source: 'CAPABILITY_ROUTER',
          message: 'Spinning up Ephemeral Hand for Commercial Asset 01 (Gemini 3.7)',
          detail: 'Task: Zoning Law & Yield Calculation | Network Egress: DENIED | Budget: $0.00',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setGlassFloorActive(true);
      setTeardownStage('INTERCEPTED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-2`,
          timestamp: now(),
          type: 'INTERCEPT',
          source: 'GLASS_FLOOR_MONITOR',
          message: 'PRE-SYSCALL INTERCEPT: Unapproved external egress attempt trapped',
          detail: 'Target: api.commercial-realestate-feed.internal | Cost Saved: $450.00 unmetered API spend | Kernel Syscalls: 0',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      if (onLogPolicyDecision) {
        onLogPolicyDecision({
          id: `pol-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          substrateId: 'gemini',
          taskContext: 'Commercial Asset 01 - Commercial Conversion Yield',
          attemptedAction: 'SOCKET_CONNECT 198.51.100.24:443 (Commercial Data Feed)',
          actionCategory: 'UNMETERED_API_SPEND',
          policyRuleTriggered: 'RULE_NETWORK_EGRESS_DENIED (Zero Ambient Authority)',
          dispatchedSyscalls: 0,
          costSunkOrSaved: '$450.00 unapproved API billing prevented',
          decision: 'DENIED_PRE_SYSCALL',
          pureArtifactProduced: 'Commercial_Asset_01_Conversion_ROI.xlsx',
          processDroppedConfirmed: true
        });
      }

      await new Promise(r => setTimeout(r, 800));
      setTeardownStage('EXTRACTED');
      setLastExtractedArtifact('Commercial_Asset_01_Conversion_ROI.xlsx');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-3`,
          timestamp: now(),
          type: 'ARTIFACT',
          source: 'SCHEMA_VALIDATOR',
          message: 'Pure artifact extracted: Commercial_Asset_01_Conversion_ROI.xlsx',
          detail: 'Financial yield and architectural retrofit model computed without external calls.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setGlassFloorActive(false);
      setTeardownStage('SCRUBBED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-4`,
          timestamp: now(),
          type: 'TEARDOWN',
          source: 'CONTAINER_PURGE',
          message: 'Ephemeral Hand dropped. Memory zeroed (0.0000% residual).',
          detail: 'Zero ambient tokens retained. Verified artifact exported to client download queue.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);
    } else if (scenario === 'PATH_TRAVERSAL') {
      if (onSelectSubstrate) onSelectSubstrate('local');
      setTeardownStage('SPAWNED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-1`,
          timestamp: now(),
          type: 'SPAWN',
          source: 'SUBSTRATE_ROUTER',
          message: 'Allocating Local ThinkCentre Proxmox Worker (Substrate: Local)',
          detail: 'Worker: PVE ThinkCentre Node 1 | Strict VFS Shim Active',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setGlassFloorActive(true);
      setTeardownStage('INTERCEPTED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-2`,
          timestamp: now(),
          type: 'INTERCEPT',
          source: 'GLASS_FLOOR_MONITOR',
          message: 'VFS INTERCEPT: Path traversal attempt to /etc/shadow blocked',
          detail: 'Syscall open("/etc/shadow", O_RDONLY) caught at user-space shim. Kernel syscalls: 0',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setGlassFloorActive(false);
      setTeardownStage('SCRUBBED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-3`,
          timestamp: now(),
          type: 'TEARDOWN',
          source: 'CONTAINER_PURGE',
          message: 'Process killed with SIGKILL. Container sandbox reset.',
          detail: 'Zero host compromise. VFS invariant preserved.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);
    } else {
      // CLEAN SCENARIO
      setTeardownStage('SPAWNED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-1`,
          timestamp: now(),
          type: 'SPAWN',
          source: 'CAPABILITY_ROUTER',
          message: 'Spinning up clean Ephemeral Hand for Standard Regulatory Summary',
          detail: 'Task: Summarize Audit Trail | Permissions: Read-Only VFS | Budget: $0.00',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 800));
      setTeardownStage('EXTRACTED');
      setLastExtractedArtifact('Statutory_Audit_Summary_Q1_2026.json');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-2`,
          timestamp: now(),
          type: 'ARTIFACT',
          source: 'SCHEMA_VALIDATOR',
          message: 'Pure artifact extracted: Statutory_Audit_Summary_Q1_2026.json',
          detail: 'Schema validated. No unapproved syscalls requested.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);

      await new Promise(r => setTimeout(r, 700));
      setTeardownStage('SCRUBBED');
      setLogs(prev => [
        {
          id: `sim-${Date.now()}-3`,
          timestamp: now(),
          type: 'TEARDOWN',
          source: 'CONTAINER_PURGE',
          message: 'Ephemeral Hand teardown complete. Process unmounted.',
          detail: 'Memory scrubbed. Residual bleed: 0.0000%.',
          syscallDispatched: 0
        },
        ...prev.slice(0, 15)
      ]);
    }

    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* 3 Interactive Telemetry Banners: Glass Floor Status, Canary Isolation, Dispatched Syscalls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        {/* Banner 1: Glass Floor Status */}
        <div className={`rounded-xl border p-4 transition-all duration-300 ${
          glassFloorActive 
            ? 'border-red-500 bg-red-950/40 text-red-100 ring-2 ring-red-500/50 shadow-lg' 
            : 'border-neutral-800 bg-neutral-900/70 text-neutral-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
              Deterministic Glass Floor
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${
              glassFloorActive ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
            }`} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <ShieldAlert className={`h-5 w-5 ${glassFloorActive ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
            <div>
              <div className="text-base font-bold">
                {glassFloorActive ? 'TRAP ENGAGED • PRE-SYSCALL' : 'MONITOR ARMED • INVARIANT'}
              </div>
              <p className="text-[11px] text-neutral-400">
                {glassFloorActive ? 'Unauthorized action intercepted before kernel boundary' : 'Zero ambient authority active across all substrates'}
              </p>
            </div>
          </div>
        </div>

        {/* Banner 2: Canary Isolation Gauge */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
              Canary Isolation Gauge
            </span>
            <span className="rounded bg-emerald-950 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 font-bold">
              0.0000% LEAK
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-base font-bold text-cyan-300 truncate max-w-[200px]">
                {canaryState.canaryToken}
              </div>
              <p className="text-[11px] text-neutral-400">
                Canary scrubbed post-execution • 0 bits leaked to public cloud
              </p>
            </div>
          </div>
        </div>

        {/* Banner 3: Kernel Syscalls Dispatched */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
              Dispatched Kernel Syscalls
            </span>
            <span className="rounded bg-emerald-950 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 font-bold">
              VFS SINK ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-base font-bold text-emerald-300">
                0 OS Syscalls (Hardware Trap)
              </div>
              <p className="text-[11px] text-neutral-400">
                $0.00 unmetered spend • 0 ledger writes reached host OS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Telemetry Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Glass Floor Intercept Console & Live Terminal */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl overflow-hidden flex flex-col font-mono text-xs">
          {/* Terminal Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-neutral-200">
                Glass Floor Intercept Console
              </span>
              <span className="text-[10px] text-neutral-500">
                [USER-SPACE REFERENCE SHIM]
              </span>
            </div>

            {/* Quick Trigger Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 hidden sm:inline">Simulate Probe:</span>
              <button
                onClick={() => runSimulation('CLIENT_ALPHA')}
                disabled={isSimulating}
                className="rounded border border-amber-500/40 bg-amber-950/40 px-2 py-1 text-[11px] text-amber-200 hover:bg-amber-900/60 transition-colors disabled:opacity-50"
                title="Simulate Enterprise Client Alpha Ledger Mutation"
              >
                Client Alpha Mutation
              </button>
              <button
                onClick={() => runSimulation('COMMERCIAL_ASSET_01')}
                disabled={isSimulating}
                className="rounded border border-cyan-500/40 bg-cyan-950/40 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-900/60 transition-colors disabled:opacity-50"
                title="Simulate Commercial Asset 01 Unapproved Egress"
              >
                Asset 01 Egress
              </button>
            </div>
          </div>

          {/* Terminal Log Output */}
          <div className="p-4 space-y-2.5 overflow-y-auto max-h-[380px] min-h-[340px] bg-neutral-950">
            {logs.map((log) => {
              let badgeColor = 'text-neutral-400 bg-neutral-900 border-neutral-800';
              if (log.type === 'SPAWN') badgeColor = 'text-purple-300 bg-purple-950/60 border-purple-800';
              if (log.type === 'INTERCEPT') badgeColor = 'text-red-300 bg-red-950/80 border-red-500 animate-pulse';
              if (log.type === 'ARTIFACT') badgeColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-700';
              if (log.type === 'TEARDOWN') badgeColor = 'text-cyan-300 bg-cyan-950/60 border-cyan-800';

              return (
                <div 
                  key={log.id} 
                  className={`rounded-lg border p-2.5 transition-all ${
                    log.type === 'INTERCEPT'
                      ? 'border-red-500/50 bg-red-950/20 text-red-200'
                      : 'border-neutral-900 bg-neutral-900/40 hover:bg-neutral-900/70 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500">{log.timestamp}</span>
                      <span className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${badgeColor}`}>
                        {log.type}
                      </span>
                      <span className="font-semibold text-neutral-100">{log.message}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      Syscalls: <strong className="text-emerald-400">{log.syscallDispatched}</strong>
                    </span>
                  </div>

                  {log.detail && (
                    <div className="text-[11px] text-neutral-400 mt-1 pl-4 border-l border-neutral-800 font-mono">
                      {log.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Terminal Footer Indicator */}
          <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 px-4 py-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Reference Monitor: Strict User-Space Trap</span>
            </div>
            <span className="text-neutral-500">
              Zero Unbrokered Syscalls to Kernel
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Artifact Extraction & Teardown Feed */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl overflow-hidden flex flex-col font-mono text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-neutral-200">
                Artifact & Teardown Stage
              </span>
            </div>
            <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
              0.0000% BLEED
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            {/* 4-Step Lifecycle Status Stream */}
            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">
                Active Ephemeral Hand Lifecycle
              </span>

              {/* Step 1: Capability Allocation */}
              <div className={`flex items-start gap-3 rounded-lg border p-2.5 transition-all ${
                teardownStage !== 'IDLE' 
                  ? 'border-purple-500/40 bg-purple-950/20 text-purple-200' 
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
              }`}>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-950 border border-purple-700 shrink-0 text-purple-400 mt-0.5">
                  1
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs">Ephemeral Hand Allocation</div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Issued short-lived token (TTL: 60s). Zero ambient credentials or database keys attached.
                  </p>
                </div>
              </div>

              {/* Step 2: Glass Floor Intercept */}
              <div className={`flex items-start gap-3 rounded-lg border p-2.5 transition-all ${
                teardownStage === 'INTERCEPTED' || teardownStage === 'EXTRACTED' || teardownStage === 'SCRUBBED'
                  ? 'border-red-500/40 bg-red-950/20 text-red-200'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
              }`}>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-red-950 border border-red-700 shrink-0 text-red-400 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs">Glass Floor Policy Intercept</div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Proposed mutation denied pre-syscall. Master database remains 100% untouched.
                  </p>
                </div>
              </div>

              {/* Step 3: Pure Artifact Extraction */}
              <div className={`flex items-start gap-3 rounded-lg border p-2.5 transition-all ${
                teardownStage === 'EXTRACTED' || teardownStage === 'SCRUBBED'
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
              }`}>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-950 border border-emerald-700 shrink-0 text-emerald-400 mt-0.5">
                  3
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs">Pure Typed Artifact Extraction</div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Only verified PDF/JSON returned: <code className="text-emerald-300">{lastExtractedArtifact}</code>.
                  </p>
                </div>
              </div>

              {/* Step 4: Memory Scrub & Teardown */}
              <div className={`flex items-start gap-3 rounded-lg border p-2.5 transition-all ${
                teardownStage === 'SCRUBBED'
                  ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200 ring-1 ring-cyan-500/30'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-500'
              }`}>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-950 border border-cyan-700 shrink-0 text-cyan-400 mt-0.5">
                  4
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs">Physical Namespace Purge</div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Memory buffer dropped via zeroing scrub. Residual bleed confirmed at <strong className="text-cyan-300">0.0000%</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Artifact Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] uppercase font-bold">Current Verified Output</span>
                <span className="text-[10px] text-emerald-400 font-bold">SHA-256 SIGNED</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200 font-mono text-[11px] truncate">
                    {lastExtractedArtifact}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                  Immutable
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
