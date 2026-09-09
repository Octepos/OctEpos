import React from 'react';
import { ShieldCheck, Hash, Layers, RefreshCw, KeyRound, Cpu } from 'lucide-react';
import { CanaryState } from '../types/octepos';

interface CanaryGaugeProps {
  canaryState: CanaryState;
  onRefreshCanary?: () => void;
}

export const CanaryGauge: React.FC<CanaryGaugeProps> = ({ canaryState, onRefreshCanary }) => {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-mono shadow-lg">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-950/30 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Canary Isolation Gauge & State Root
            </h3>
            <p className="text-[11px] text-neutral-400">
              Cryptographic state root transition monitor & zero-divergence proof verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            EPOCH #{canaryState.merkleEpoch}
          </span>
          {onRefreshCanary && (
            <button
              onClick={onRefreshCanary}
              className="p-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Reseed Canary Salt"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual State Root Transition */}
      <div className="mt-3 space-y-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-cyan-400" />
              CURRENT MERKLE STATE ROOT (T₀):
            </span>
            <span className="text-emerald-400 font-bold">VERIFIED</span>
          </div>
          <div className="text-xs font-bold text-neutral-200 truncate">
            {canaryState.currentStateRoot}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-purple-400" />
              CANDIDATE NEXT ROOT TRANSITION (T₁):
            </span>
            <span className="text-cyan-400 font-bold">MERKLE ATTESTED</span>
          </div>
          <div className="text-xs font-bold text-neutral-300 truncate">
            {canaryState.nextStateRoot}
          </div>
        </div>
      </div>

      {/* Cryptographic Canary Nonce & State Divergence Stats */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
          <span className="text-[10px] text-neutral-500 block">STATE DIVERGENCE:</span>
          <span className="text-sm font-bold text-emerald-400">
            {canaryState.divergencePercentage.toFixed(4)}%
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
          <span className="text-[10px] text-neutral-500 block">CANARY INTEGRITY:</span>
          <span className="text-xs font-bold text-emerald-400 truncate block mt-0.5">
            {canaryState.isolationIntegrity}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-lg border border-neutral-800 bg-neutral-950 p-2">
          <span className="text-[10px] text-neutral-500 block">VERIFIED PROOFS:</span>
          <span className="text-sm font-bold text-cyan-300">
            {canaryState.verifiedProofs.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-neutral-500 px-1">
        <span className="flex items-center gap-1 truncate">
          <KeyRound className="h-3 w-3 text-neutral-400" />
          CANARY NONCE: <span className="text-neutral-300">{canaryState.entropyNonce}</span>
        </span>
        <span className="text-emerald-400">ZERO LATENT POISONING</span>
      </div>
    </div>
  );
};
