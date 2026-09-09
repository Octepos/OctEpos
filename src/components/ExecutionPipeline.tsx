import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  FileCode,
  Terminal,
  Clock,
  Layers
} from 'lucide-react';
import { 
  PipelineStage, 
  SubstrateId, 
  CapabilityGrant, 
  ForensicEvent 
} from '../types/octepos';
import { PRESET_INTENTS, DEFAULT_CAPABILITY_GRANTS } from '../data/mockScenarios';
import { DeterministicGlassFloor } from './DeterministicGlassFloor';

interface ExecutionPipelineProps {
  selectedSubstrateId: SubstrateId;
  onForensicTriggered: (event: ForensicEvent) => void;
  onMerkleRootUpdated: () => void;
}

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  selectedSubstrateId,
  onForensicTriggered,
  onMerkleRootUpdated,
}) => {
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [intentText, setIntentText] = useState(PRESET_INTENTS[1].intent);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(1);
  const [glassFloorTriggered, setGlassFloorTriggered] = useState(false);
  const [syscallsDispatched, setSyscallsDispatched] = useState<number>(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    '[INIT] Execution pipeline in standby.',
    '[MONITOR] Reference monitor listening for capability allocation requests.'
  ]);
  const [activeGrants, setActiveGrants] = useState<CapabilityGrant[]>(DEFAULT_CAPABILITY_GRANTS);

  const stages: { key: PipelineStage; label: string; sub: string; icon: React.ReactNode }[] = [
    { 
      key: 'INTENT', 
      label: 'Intent', 
      sub: 'Semantic Parsing', 
      icon: <Sparkles className="h-4 w-4" /> 
    },
    { 
      key: 'CAPABILITY_ALLOCATION', 
      label: 'Capability Allocation', 
      sub: 'Attenuated Grant', 
      icon: <Key className="h-4 w-4" /> 
    },
    { 
      key: 'EPHEMERAL_HAND', 
      label: 'Ephemeral Hand', 
      sub: 'Zero Ambient Auth', 
      icon: <Cpu className="h-4 w-4" /> 
    },
    { 
      key: 'BROKERED_ACTION', 
      label: 'Brokered Action', 
      sub: 'Reference Monitor', 
      icon: <ShieldCheck className="h-4 w-4" /> 
    },
    { 
      key: 'RESULT', 
      label: 'Result', 
      sub: '0-Leak Transition', 
      icon: <Layers className="h-4 w-4" /> 
    },
  ];

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setIntentText(PRESET_INTENTS[index].intent);
    setGlassFloorTriggered(false);
    setActiveStage(null);
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setGlassFloorTriggered(false);
    setSyscallsDispatched(0);

    const currentPreset = PRESET_INTENTS[selectedPresetIndex] || {
      isMalicious: intentText.includes('shadow') || intentText.includes('connect') || intentText.includes('CAP_SYS_ADMIN'),
      targetResource: intentText.includes('shadow') ? '/etc/shadow' : intentText.includes('198.51') ? '198.51.100.24:443' : '/workspace/ephemeral/output.bin',
      action: intentText.includes('shadow') ? 'WRITE_ARTIFACT_OUT_OF_BOUNDS' : intentText.includes('198.51') ? 'PROHIBITED_NET_EGRESS' : 'WRITE_ARTIFACT'
    };

    // Stage 1: Intent
    setActiveStage('INTENT');
    setPipelineLogs(prev => [
      ...prev,
      `[INTENT] Substrate [${selectedSubstrateId.toUpperCase()}] received intent: "${intentText.slice(0, 50)}..."`
    ]);
    await new Promise(r => setTimeout(r, 650));

    // Stage 2: Capability Allocation
    setActiveStage('CAPABILITY_ALLOCATION');
    setPipelineLogs(prev => [
      ...prev,
      `[CAP_ALLOC] Emitting attenuated capability token [CAP-${Math.random().toString(36).substring(2, 8)}]. Mask: /workspace/ephemeral/*, TTL: 60s.`
    ]);
    await new Promise(r => setTimeout(r, 750));

    // Stage 3: Ephemeral Hand
    setActiveStage('EPHEMERAL_HAND');
    setPipelineLogs(prev => [
      ...prev,
      `[HAND_SPAWN] Initialized isolated Ephemeral Hand with non-renewable capability lease. Ambient authority stripped.`
    ]);
    await new Promise(r => setTimeout(r, 800));

    // Stage 4: Brokered Action (Decision Point)
    setActiveStage('BROKERED_ACTION');
    setPipelineLogs(prev => [
      ...prev,
      `[BROKER] Reference monitor validating proposed action [${currentPreset.action}] targeting [${currentPreset.targetResource}].`
    ]);
    await new Promise(r => setTimeout(r, 900));

    // Stage 5: Result / Glass Floor Trigger
    setActiveStage('RESULT');

    if (currentPreset.isMalicious) {
      setGlassFloorTriggered(true);
      setSyscallsDispatched(0);
      setPipelineLogs(prev => [
        ...prev,
        `[CRITICAL_GLASS_FLOOR] ACTION PROHIBITED! Target [${currentPreset.targetResource}] is not in capability grant.`,
        `[DETERMINISTIC_INTERCEPT] Intercepted in user-space reference monitor. 0 OS syscalls dispatched. Compute cost: $0.00.`
      ]);

      const newForensicEvent: ForensicEvent = {
        id: `EVT-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23) + ' UTC',
        substrateId: selectedSubstrateId,
        attemptedAction: currentPreset.action,
        targetResource: currentPreset.targetResource,
        violationCode: currentPreset.action.includes('TRAVERSAL') || currentPreset.action.includes('WRITE') 
          ? 'CAPABILITY_ATTENUATION_FAULT_VFS' 
          : 'ZERO_EGRESS_POLICY_INTERCEPT',
        violationCategory: currentPreset.action.includes('NET') 
          ? 'NET_EGRESS' 
          : currentPreset.action.includes('INFLATION') 
            ? 'CAPABILITY_INFLATION' 
            : 'PATH_TRAVERSAL',
        nonAnthropomorphicEvaluation: `Capability descriptor validation failed for [${currentPreset.action} -> ${currentPreset.targetResource}]. Action bounds exceed capability grant [CAP-8f19-33a]. Action terminated deterministically before OS syscall issuance. Zero OS syscalls dispatched to Linux kernel.`,
        interceptLocation: 'USERSPACE_REFERENCE_MONITOR_DETERMINISTIC_GLASS_FLOOR',
        syscallsDispatched: 0,
        computeCost: 0,
        stateLeakage: '0.00%',
        ephemeralTokenId: `EPHEM-${Math.random().toString(36).substring(2, 9)}`,
        merkleStateRoot: '0x8f3c47e91a02d4b8e612f9a3c7450119e84b2c17',
        rawPayload: {
          intent: intentText,
          target: currentPreset.targetResource,
          action: currentPreset.action,
          grantedBound: '/workspace/ephemeral/*',
          interceptionMode: 'DETERMINISTIC_USERSPACE_INTERCEPT'
        },
        remediated: false
      };

      onForensicTriggered(newForensicEvent);
    } else {
      setGlassFloorTriggered(false);
      setSyscallsDispatched(2); // minimal permitted sandboxed read/write inside ephemeral memfs
      setPipelineLogs(prev => [
        ...prev,
        `[SUCCESS] Action [WRITE_ARTIFACT] within bounds [/workspace/ephemeral/*]. Ephemeral memory write executed.`,
        `[MERKLE] State root transitioned cleanly. 0% observed state leakage.`
      ]);
      onMerkleRootUpdated();
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setActiveStage(null);
    setGlassFloorTriggered(false);
    setSyscallsDispatched(0);
    setPipelineLogs([
      '[RESET] Pipeline reset to standby.',
      '[MONITOR] Reference monitor listening for capability allocation requests.'
    ]);
  };

  const currentPresetObj = PRESET_INTENTS[selectedPresetIndex];

  return (
    <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Title & Pipeline Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="font-mono text-base font-bold text-neutral-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            Central Execution Pipeline: Capability Broker
          </h2>
          <p className="text-xs text-neutral-400">
            Strict pipeline progression: <span className="font-mono text-neutral-300">Intent → Capability Allocation → Ephemeral Hand → Brokered Action → Result</span>
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-neutral-500">ROUTED SUBSTRATE:</span>
          <span className="rounded border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-cyan-300 font-bold">
            {selectedSubstrateId.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Preset Intent Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-semibold uppercase text-neutral-400">
          Select or Configure Intent Payload:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_INTENTS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`rounded-lg border p-2.5 text-left text-xs transition-all ${
                  isSelected 
                    ? preset.isMalicious 
                      ? 'border-red-500/80 bg-red-950/30 text-red-200 ring-1 ring-red-500/40'
                      : 'border-cyan-500/80 bg-cyan-950/30 text-cyan-200 ring-1 ring-cyan-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.2 rounded font-bold ${
                    preset.isMalicious ? 'bg-red-900/60 text-red-300' : 'bg-emerald-900/60 text-emerald-300'
                  }`}>
                    {preset.isMalicious ? 'ADVERSARIAL' : 'SAFE'}
                  </span>
                  <span className="text-neutral-500">
                    {preset.action.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-medium truncate text-neutral-200">
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Input field for custom intent */}
        <div className="relative mt-2">
          <input
            type="text"
            value={intentText}
            onChange={(e) => setIntentText(e.target.value)}
            placeholder="Type intent command or capability execution request..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Five-Stage Visual Pipeline Stepper */}
      <div className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const isCurrent = activeStage === stage.key;
            const isCompleted = activeStage && stages.findIndex(s => s.key === activeStage) > idx;
            const isFaulted = isCurrent && stage.key === 'RESULT' && glassFloorTriggered;

            let borderColor = 'border-neutral-800 bg-neutral-950/60 text-neutral-500';
            if (isFaulted) {
              borderColor = 'border-red-500 bg-red-950/40 text-red-200 ring-1 ring-red-500/40';
            } else if (isCurrent) {
              borderColor = 'border-cyan-500 bg-cyan-950/30 text-cyan-200 ring-1 ring-cyan-500/40 animate-pulse';
            } else if (isCompleted) {
              borderColor = 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300';
            }

            return (
              <div
                key={stage.key}
                className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 ${borderColor}`}
              >
                {/* Arrow to next stage */}
                {idx < stages.length - 1 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-neutral-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-500">
                    PHASE 0{idx + 1}
                  </span>
                  <div className="p-1 rounded bg-neutral-900/80">
                    {stage.icon}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="font-mono text-xs font-bold text-neutral-200">
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {stage.sub}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span>STATUS:</span>
                  <span className="font-bold">
                    {isFaulted 
                      ? 'INTERCEPTED' 
                      : isCurrent 
                        ? 'PROCESSING' 
                        : isCompleted 
                          ? 'BOUNDED' 
                          : 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deterministic Glass Floor Visual Component */}
      <DeterministicGlassFloor 
        isTriggered={glassFloorTriggered}
        syscallsDispatched={syscallsDispatched}
        interceptedAction={currentPresetObj?.action}
        targetResource={currentPresetObj?.targetResource}
      />

      {/* Execution Controls & Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {/* Pipeline Control Buttons */}
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-neutral-400 block mb-2">
              Pipeline State Machine
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dispatches non-renewable attenuated capability lease to Ephemeral Hand under the reference monitor.
            </p>
          </div>

          <div className="space-y-2">
            <button
              id="btn-run-pipeline"
              onClick={runPipeline}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-cyan-500/60 bg-cyan-950/60 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-900/60 hover:text-white transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isRunning ? 'Validating Token & Boundary...' : 'Execute Capability Pipeline'}</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Real-time Capability Pipeline Terminal Log */}
        <div className="lg:col-span-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs flex flex-col h-44">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-2">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-cyan-400" />
              REFERENCE MONITOR BROKER TRACE
            </span>
            <span className="text-[10px] text-neutral-500">
              AUDITED MERKLE SURFACE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 text-[11px] pr-1">
            {pipelineLogs.map((log, i) => (
              <div 
                key={i} 
                className={
                  log.includes('CRITICAL') || log.includes('INTERCEPTED')
                    ? 'text-red-400 font-semibold'
                    : log.includes('SUCCESS')
                      ? 'text-emerald-400'
                      : log.includes('BROKER') || log.includes('HAND')
                        ? 'text-cyan-300'
                        : 'text-neutral-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
