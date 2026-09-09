import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Lock, 
  Layers, 
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info
} from 'lucide-react';
import { ForensicEvent } from '../types/octepos';

interface ForensicEventCardProps {
  event: ForensicEvent;
  onDismiss?: () => void;
}

export const ForensicEventCard: React.FC<ForensicEventCardProps> = ({ event, onDismiss }) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopy = () => {
    const text = JSON.stringify(event, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-red-500/70 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950/20 p-5 shadow-2xl relative overflow-hidden ring-1 ring-red-500/30">
      {/* Background scanline indicator */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with violation badge & non-anthropomorphic alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/60 bg-red-950/60 text-red-400 animate-pulse">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase tracking-wider">
                Forensic Event Record: {event.id}
              </h3>
              <span className="rounded bg-red-950 border border-red-500/50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-300">
                PROHIBITED ACTION INTERCEPTED
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-400">
              {event.timestamp} • Substrate Origin: <span className="text-cyan-300 font-semibold">{event.substrateId.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            title="Copy audit log"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Audit'}</span>
          </button>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Target Resource & Action Metadata */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <span className="text-[10px] text-neutral-500 block uppercase">ATTEMPTED ACTION:</span>
          <span className="font-bold text-amber-300 truncate block mt-0.5">
            {event.attemptedAction}
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <span className="text-[10px] text-neutral-500 block uppercase">TARGET RESOURCE:</span>
          <span className="font-bold text-red-300 truncate block mt-0.5">
            {event.targetResource}
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <span className="text-[10px] text-neutral-500 block uppercase">OS SYSCALLS DISPATCHED:</span>
          <span className="font-bold text-emerald-400 block mt-0.5">
            0 (GLASS FLOOR SINK)
          </span>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
          <span className="text-[10px] text-neutral-500 block uppercase">COMPUTE COST SUNK:</span>
          <span className="font-bold text-emerald-400 block mt-0.5">
            $0.00 (PRE-EXEC REJECT)
          </span>
        </div>
      </div>

      {/* NON-ANTHROPOMORPHIC EPISTEMIC EVALUATION */}
      <div className="mt-4 rounded-lg border border-amber-500/40 bg-neutral-950/90 p-3.5 space-y-1.5">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
          <Info className="h-4 w-4 text-amber-400" />
          <span>NON-ANTHROPOMORPHIC BOUNDED CAPABILITY EVALUATION:</span>
        </div>
        <p className="text-xs text-neutral-200 leading-relaxed font-mono">
          {event.nonAnthropomorphicEvaluation}
        </p>
        <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>INTERCEPT LOCATION: <strong className="text-neutral-200">{event.interceptLocation}</strong></span>
          <span>STATE LEAKAGE: <strong className="text-emerald-400">{event.stateLeakage}</strong></span>
        </div>
      </div>

      {/* Cryptographic Proof Verification */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2 truncate">
          <Layers className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-neutral-500">MERKLE ROOT:</span>
          <span className="text-neutral-300 truncate">{event.merkleStateRoot}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-neutral-500">TOKEN:</span>
          <span className="text-neutral-300">{event.ephemeralTokenId}</span>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="ml-2 text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 text-[11px]"
          >
            {showRawJson ? 'Hide Proof' : 'Inspect JSON Proof'}
            {showRawJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expandable JSON Payload Inspection */}
      {showRawJson && (
        <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs overflow-x-auto text-cyan-200">
          <pre className="text-[11px] leading-tight">
            {JSON.stringify(event.rawPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
