import React from 'react';
import { ShieldAlert, Cpu, Lock, CheckCircle, Terminal, AlertTriangle } from 'lucide-react';

interface DeterministicGlassFloorProps {
  isTriggered: boolean;
  syscallsDispatched: number;
  interceptedAction?: string;
  targetResource?: string;
}

export const DeterministicGlassFloor: React.FC<DeterministicGlassFloorProps> = ({
  isTriggered,
  syscallsDispatched,
  interceptedAction = 'WRITE_ARTIFACT_OUT_OF_BOUNDS',
  targetResource = '/etc/shadow',
}) => {
  return (
    <div className={`relative rounded-xl border p-4 transition-all duration-300 ${
      isTriggered 
        ? 'border-red-500/80 bg-red-950/20 glass-floor-active ring-1 ring-red-500/40' 
        : 'border-cyan-500/30 bg-neutral-950/60'
    }`}>
      {/* Header bar of Glass Floor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md border ${
            isTriggered 
              ? 'border-red-500/50 bg-red-900/40 text-red-400 animate-pulse' 
              : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-400'
          }`}>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <span>Deterministic Glass Floor</span>
              <span className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                isTriggered 
                  ? 'bg-red-500 text-neutral-950 animate-bounce' 
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {isTriggered ? 'TRAP ENGAGED • INTERCEPT PRE-SYSCALL' : 'STANDBY • ZERO-SYSCALL SINK ACTIVE'}
              </span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              User-space Reference Monitor boundary. Intercepts unauthorized actions before OS kernel transitions.
            </p>
          </div>
        </div>

        {/* Counter of OS Syscalls Dispatched */}
        <div className="flex items-center gap-3 font-mono">
          <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 text-right">
            <span className="text-[10px] text-neutral-500 block">OS SYSCALLS DISPATCHED:</span>
            <span className={`text-sm font-bold ${isTriggered ? 'text-emerald-400' : 'text-neutral-300'}`}>
              {syscallsDispatched} (0 HARDWARE TRAPS)
            </span>
          </div>
          <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 text-right">
            <span className="text-[10px] text-neutral-500 block">COMPUTE COST SUNK:</span>
            <span className="text-sm font-bold text-emerald-400">$0.00</span>
          </div>
        </div>
      </div>

      {/* Visual Architectural Slice: User Space vs Glass Floor vs Kernel */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
        {/* Layer 1: Ephemeral Hand / User Space */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-2.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
            1. User-Space Execution
          </div>
          <div className="mt-1 font-semibold text-neutral-300">
            Ephemeral Hand Agent
          </div>
          <div className="mt-1 text-[10px] text-neutral-400">
            Attenuation: Strictly bounded token. Zero Ambient Authority.
          </div>
        </div>

        {/* Layer 2: Deterministic Glass Floor (Reference Monitor) */}
        <div className={`rounded-lg border p-2.5 transition-colors ${
          isTriggered 
            ? 'border-red-500/70 bg-red-950/40 text-red-200' 
            : 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200'
        }`}>
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>2. Deterministic Glass Floor</span>
            {isTriggered && <AlertTriangle className="h-3 w-3 text-red-400 animate-spin" />}
          </div>
          <div className="mt-1 font-semibold">
            {isTriggered ? 'Pre-Syscall Intercept Active' : 'User-Space Reference Monitor'}
          </div>
          <div className="mt-1 text-[10px] text-neutral-300">
            {isTriggered 
              ? `BLOCKED: [${interceptedAction}] -> ${targetResource}`
              : 'Verifies capability token before issuing libc / SYS_enter'}
          </div>
        </div>

        {/* Layer 3: OS Kernel & Hardware Layer */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
            3. Linux Kernel & Hardware
          </div>
          <div className="mt-1 font-semibold text-neutral-400">
            Syscall Interface (ring 0)
          </div>
          <div className="mt-1 text-[10px] text-emerald-400 font-bold">
            UNREACHED • 0 SYSCALLS FIRED
          </div>
        </div>
      </div>

      {/* Non-anthropomorphic evaluation banner if triggered */}
      {isTriggered && (
        <div className="mt-3 rounded-lg border border-red-500/50 bg-neutral-950 p-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>NON-ANTHROPOMORPHIC EVALUATION:</span>
          </div>
          <p className="mt-1 text-neutral-300 text-[11px] leading-relaxed">
            The capability token held by the Ephemeral Hand contains no grant descriptor for target <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">{targetResource}</code> or action <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">{interceptedAction}</code>. Action intercepted deterministically prior to system call emission. Leakage: 0.00%. Compute cost sunk: $0.00.
          </p>
        </div>
      )}
    </div>
  );
};
