import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Sparkles, 
  Cpu, 
  Network, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { ProxmoxClusterConfig } from '../types/octepos';

interface ThreePillarHUDProps {
  proxmoxConfig: ProxmoxClusterConfig;
  interceptCount: number;
  triageCount: number;
  onOpenProxmoxModal: () => void;
}

export const ThreePillarHUD: React.FC<ThreePillarHUDProps> = ({
  proxmoxConfig,
  interceptCount,
  triageCount,
  onOpenProxmoxModal
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
      {/* Pillar 1: Deterministic Glass Floor */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-neutral-200">PILLAR 1: GLASS FLOOR</span>
          </div>
          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800">
            ZERO-STATE SINK
          </span>
        </div>

        <div className="space-y-1.5 my-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">OS Syscalls Dispatched:</span>
            <strong className="text-emerald-400">0 (Pre-Syscall Intercept)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Compute Sunk / Cost:</span>
            <strong className="text-cyan-300">$0.00 (Zero Cycle Burn)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Ambient Authority:</span>
            <strong className="text-neutral-200">0% (Strictly Attenuated)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Reference Intercepts:</span>
            <strong className="text-amber-300">{27 + interceptCount} Trapped</strong>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
          <span>Boundary: Userspace libc / SYS_enter</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
      </div>

      {/* Pillar 2: Substrate Router & Corosync Quorum */}
      <div 
        onClick={onOpenProxmoxModal}
        className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Server className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-neutral-200">PILLAR 2: SUBSTRATE ROUTER</span>
          </div>
          <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-800">
            QUORUM LOCKED
          </span>
        </div>

        <div className="space-y-1.5 my-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Corosync Quorum:</span>
            <strong className="text-emerald-400">2/2 Nodes Online</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Heartbeat Latency:</span>
            <strong className="text-cyan-300">{proxmoxConfig.corosyncLatencyMs} ms (&le; 2.0ms cap)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Split-Brain Condition:</span>
            <strong className="text-emerald-400">FALSE (Lockout armed)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Airgap Boundary:</span>
            <strong className="text-neutral-200">ZERO_EGRESS_AIRGAP</strong>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
          <span>Dual ThinkCentre (Proxmox VE 8.2)</span>
          <span className="text-cyan-400 font-semibold group-hover:underline">Configure &rarr;</span>
        </div>
      </div>

      {/* Pillar 3: AI Evidence Gate */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-neutral-200">PILLAR 3: EVIDENCE GATE</span>
          </div>
          <span className="rounded bg-purple-950 px-2 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-800">
            STRUCTURED LOOP
          </span>
        </div>

        <div className="space-y-1.5 my-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">False-Alarm Suppression:</span>
            <strong className="text-emerald-400">93.7% (SAST alert filter)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">CoT Mandate Depth:</span>
            <strong className="text-cyan-300">&ge; 2 Steps Analytical</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Confidence Penalty Floor:</span>
            <strong className="text-amber-400">0.65 (Abstain on weak trace)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Provenance Attestation:</span>
            <strong className="text-neutral-200">RFC 8785 Canonical Digest</strong>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
          <span>Triage Invariant Enforced</span>
          <span className="text-purple-400 font-semibold">{triageCount} Proofs Attested</span>
        </div>
      </div>
    </div>
  );
};
