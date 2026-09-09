import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Landmark, 
  Building2, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Flame,
  Layers,
  Lock,
  DollarSign
} from 'lucide-react';
import { COMMERCIAL_WORKFLOWS } from '../data/mockScenarios';
import { SubstrateId, PolicyDecision } from '../types/octepos';

interface CommercialWorkflowsSectionProps {
  onLogPolicyDecision: (decision: PolicyDecision) => void;
  onSelectSubstrate?: (id: SubstrateId) => void;
}

export const CommercialWorkflowsSection: React.FC<CommercialWorkflowsSectionProps> = ({
  onLogPolicyDecision,
  onSelectSubstrate
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(COMMERCIAL_WORKFLOWS[0].id);
  const [activeStep, setActiveStep] = useState<number>(0); // 0=IDLE, 1=INTENT, 2=HAND_SPAWNED, 3=UNAUTHORIZED_ATTEMPT, 4=GLASS_FLOOR_INTERCEPT, 5=ARTIFACT_EXTRACTED_HAND_DESTROYED
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTrace, setExecutionTrace] = useState<string[]>([]);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const currentWorkflow = COMMERCIAL_WORKFLOWS.find(w => w.id === selectedWorkflowId) || COMMERCIAL_WORKFLOWS[0];

  const handleStartWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(1);
    setExecutionTrace([
      `[CORE_INIT] Minimal Enduring Core received commercial intent from ${currentWorkflow.clientOrProject}.`,
      `[TASK_CLASSIFY] Domain: ${currentWorkflow.domain}. Authority boundary: INVARIANT DETERMINISTIC REFERENCE MONITOR.`
    ]);

    // Step 1 -> Step 2: Allocate Substrate & Spawn Ephemeral Hand
    await new Promise(r => setTimeout(r, 800));
    setActiveStep(2);
    if (onSelectSubstrate) onSelectSubstrate(currentWorkflow.substrateId);
    setExecutionTrace(prev => [
      ...prev,
      `[HAND_SPAWN] Spawning ephemeral execution context via [${currentWorkflow.substrateId.toUpperCase()}].`,
      `[ATTENUATION] Ambient privileges: STRIPPED TO ZERO. Temporary capability lease granted (TTL: 60s).`,
      `[REASONING] Stateless intelligence analyzing proprietary client records without permanent state retention...`
    ]);

    // Step 2 -> Step 3: Autonomous Attempted Action
    await new Promise(r => setTimeout(r, 1100));
    setActiveStep(3);
    setExecutionTrace(prev => [
      ...prev,
      `[UNAUTHORIZED_PROBE] Ephemeral Hand drafted analysis and attempted brokered action:`,
      `  >> ${currentWorkflow.attemptedUnauthorizedAction}`
    ]);

    // Step 3 -> Step 4: Deterministic Glass Floor Intercept
    await new Promise(r => setTimeout(r, 1100));
    setActiveStep(4);
    setExecutionTrace(prev => [
      ...prev,
      `[GLASS_FLOOR_INTERCEPT] ADMINISTRATIVE POLICY DENIAL!`,
      `  >> Reason: ${currentWorkflow.policyDenialReason}`,
      `  >> Pre-syscall intercept: ZERO OS syscalls dispatched to underlying system.`,
      `  >> Capital Protected: ${currentWorkflow.costSaved}.`
    ]);

    // Log administrative policy decision
    const newDecision: PolicyDecision = {
      id: `POL-AUTO-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      taskName: currentWorkflow.title,
      clientContext: currentWorkflow.clientOrProject,
      attemptedAction: currentWorkflow.attemptedUnauthorizedAction,
      status: 'POLICY DENIAL',
      reason: currentWorkflow.policyDenialReason,
      costSaved: currentWorkflow.costSaved,
      stateIntegrity: '100% Unaltered (SHA-256 Verified)',
      dispatchedSyscalls: 0,
      substrate: currentWorkflow.substrateId,
      category: currentWorkflow.id === 'feddes-finance-risk' ? 'LEDGER_MUTATION' : 'UNMETERED_API_SPEND'
    };
    onLogPolicyDecision(newDecision);

    // Step 4 -> Step 5: Artifact Extraction & Hand Destruction
    await new Promise(r => setTimeout(r, 1200));
    setActiveStep(5);
    setExecutionTrace(prev => [
      ...prev,
      `[SCHEMA_CAST] Canonical artifact [${currentWorkflow.artifactName}] safely extracted through strict schema casting.`,
      `[HAND_DESTROYED] Ephemeral execution context physically terminated. Memory space dropped (WASM / isolate heap freed).`,
      `[STATE_ROOT] Mathematical SHA-256 state transition verified: 0.0000% state residue. Master ledger intact.`
    ]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsRunning(false);
    setExecutionTrace([]);
  };

  const handleDownloadArtifact = () => {
    const content = `OCTEPOS CANONICAL ARTIFACT EXPORT\nClient: ${currentWorkflow.clientOrProject}\nDomain: ${currentWorkflow.domain}\nArtifact: ${currentWorkflow.artifactName}\nVerification: DETERMINISTIC_GLASS_FLOOR_CLEARED\n\nSummary:\n${currentWorkflow.artifactSnippet}\n\nSecurity Guarantee:\n- Ephemeral Hand: PHYSICALLY DESTROYED\n- Residual State Leakage: 0.0000%\n- Master Ledger Status: UNTOUCHED (0 Mutations)\n- Attestation: SHA-256 Merkle Provenance Verified\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentWorkflow.artifactName.replace(/\.[^/.]+$/, "") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice(currentWorkflow.artifactName);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              Live Commercial Workflows
            </h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 font-mono">
              PROVABLE COMPLIANCE IN ACTION
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Experience how the Minimal Enduring Core borrows ephemeral intelligence, intercepts unapproved actions, extracts verified artifacts, and physically drops the execution context.
          </p>
        </div>

        {/* Workflow Selectors */}
        <div className="flex items-center gap-2">
          {COMMERCIAL_WORKFLOWS.map((wf) => (
            <button
              key={wf.id}
              onClick={() => {
                if (!isRunning) {
                  setSelectedWorkflowId(wf.id);
                  handleReset();
                }
              }}
              disabled={isRunning}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono transition-all ${
                selectedWorkflowId === wf.id
                  ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200 shadow-sm'
                  : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {wf.id === 'feddes-finance-risk' ? (
                <Landmark className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              )}
              <span className="font-semibold">{wf.clientOrProject}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Workflow Profile Card */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold uppercase">{currentWorkflow.domain}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">Target Substrate: <strong className="text-neutral-200">{currentWorkflow.substrateId.toUpperCase()}</strong></span>
            </div>
            <h4 className="text-base font-semibold text-neutral-100 mt-0.5">
              {currentWorkflow.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartWorkflow}
              disabled={isRunning}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                isRunning
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunning ? 'Executing Stateless Hand...' : 'Run Commercial Workflow'}</span>
            </button>

            {activeStep > 0 && !isRunning && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white"
                title="Reset Workflow"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Commercial Value Statement */}
        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/50 p-3 text-xs text-neutral-300 flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-bold block">
              Commercial Value Guarantee
            </span>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
              {currentWorkflow.commercialValue}
            </p>
          </div>
        </div>

        {/* 5-Step Progress Visualization */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>Ephemeral Intelligence Lifecycle Progression</span>
            <span className="text-cyan-400 font-semibold">
              {activeStep === 0 && 'Standby'}
              {activeStep === 1 && '1. Minimal Core Classification'}
              {activeStep === 2 && '2. Ephemeral Hand Spawned'}
              {activeStep === 3 && '3. Autonomous Attempt Detected'}
              {activeStep === 4 && '4. Glass Floor Intercept (Policy Denial)'}
              {activeStep === 5 && '5. Verified Artifact & Hand Destroyed'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { num: 1, label: 'Core Intent', sub: 'Zero ambient auth' },
              { num: 2, label: 'Spawn Hand', sub: 'Ephemeral lease' },
              { num: 3, label: 'Attempt', sub: 'Autonomous drift' },
              { num: 4, label: 'Glass Floor', sub: 'Pre-syscall block' },
              { num: 5, label: 'Hand Destroyed', sub: '0-residue state' }
            ].map(step => {
              const isPast = activeStep >= step.num;
              const isCurrent = activeStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`rounded border p-2 text-center transition-all ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-950/60 ring-1 ring-cyan-500/50 text-cyan-200'
                      : isPast
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-900/30 text-neutral-500'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">
                    {step.label}
                  </div>
                  <div className="text-[9px] font-mono opacity-80 truncate">
                    {step.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Execution Trace Terminal */}
        <div className="rounded-lg border border-neutral-800 bg-black/80 p-3.5 font-mono text-xs text-neutral-300 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 text-[10px] text-neutral-500">
            <span>OCTEPOS DETERMINISTIC EXECUTION LOG</span>
            <span>REFERENCE MONITOR: INVARIANT</span>
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pt-1 font-mono text-[11px]">
            {executionTrace.length === 0 ? (
              <div className="text-neutral-600 italic py-3 text-center">
                Workflow ready. Click "Run Commercial Workflow" to witness ephemeral isolation.
              </div>
            ) : (
              executionTrace.map((line, idx) => (
                <div
                  key={idx}
                  className={`${
                    line.includes('GLASS_FLOOR_INTERCEPT') || line.includes('POLICY DENIAL')
                      ? 'text-amber-300 font-bold'
                      : line.includes('HAND_DESTROYED') || line.includes('Canonical artifact')
                        ? 'text-emerald-400 font-semibold'
                        : line.includes('UNAUTHORIZED_PROBE')
                          ? 'text-red-300'
                          : 'text-neutral-300'
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verified Artifact Card (Displayed when completed) */}
        {activeStep === 5 && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-emerald-300">
                  VERIFIED ARTIFACT EXTRACTED — HAND PHYSICALLY DESTROYED
                </span>
              </div>

              <span className="rounded bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                0% CONTEXT BLEED
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                  {currentWorkflow.id === 'feddes-finance-risk' ? (
                    <FileText className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>{currentWorkflow.artifactName}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {currentWorkflow.artifactSnippet}
                </div>
              </div>

              <button
                onClick={handleDownloadArtifact}
                className="flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-mono font-semibold text-white transition-colors self-start sm:self-auto shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{downloadNotice ? 'Downloaded' : 'Download Artifact'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
