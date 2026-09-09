import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Server, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Building, 
  Lock,
  Globe,
  Share2,
  Database
} from 'lucide-react';

interface CommercialArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialArchitectureModal: React.FC<CommercialArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedArch, setSelectedArch] = useState<'SIDECAR' | 'TERMINAL' | 'HYBRID'>('HYBRID');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-sans animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-100">
                  OCTEPOS Commercial Deployment Architecture
                </h3>
                <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                  ENTERPRISE THESIS
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Evaluation: Dedicated Sovereign Commercial Terminal vs. Invisible SaaS Integration Layer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Value Proposition */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400">
              The Enterprise Sales Pitch: "Selling the Isolation, Not Just the Intelligence"
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed">
              "Deploy the world's most capable frontier models against your most sensitive commercial data, mathematically guaranteed by a Deterministic Glass Floor." 
              Enterprise buyers refuse unconstrained autonomous agents that mutate databases or leak proprietary context. OCTEPOS delivers raw intelligence with zero ambient authority.
            </p>
          </div>

          {/* Architecture Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <button
              onClick={() => setSelectedArch('SIDECAR')}
              className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                selectedArch === 'SIDECAR'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500/40'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <Share2 className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-400">Low Friction</span>
              </div>
              <h4 className="font-bold text-sm text-neutral-100">Invisible SaaS Integration Layer</h4>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Sidecar proxy sitting between existing ERP, Salesforce, Core Banking, and frontier AI models.
              </p>
            </button>

            <button
              onClick={() => setSelectedArch('TERMINAL')}
              className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                selectedArch === 'TERMINAL'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/40'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-400">Max Security</span>
              </div>
              <h4 className="font-bold text-sm text-neutral-100">Dedicated Sovereign Terminal</h4>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Air-gapped Bloomberg-style workstation environment powered by localized Proxmox VE hardware nodes.
              </p>
            </button>

            <button
              onClick={() => setSelectedArch('HYBRID')}
              className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                selectedArch === 'HYBRID'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/40'
                  : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-bold">Recommended</span>
              </div>
              <h4 className="font-bold text-sm text-neutral-100">Dual-Enclave Hybrid Architecture</h4>
              <p className="text-[11px] text-neutral-400 leading-snug">
                SaaS proxy for broad document parsing + air-gapped terminal for master financial risk & ledger authority.
              </p>
            </button>
          </div>

          {/* Detailed Breakdown for Selected Architecture */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4">
            {selectedArch === 'SIDECAR' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
                  <Share2 className="h-4 w-4" />
                  <span>Deployment Model A: Invisible SaaS Integration Layer (API Proxy / Middleware Gateway)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  OCTEPOS acts as an inline policy broker. Existing corporate applications (Slack, Salesforce, SAP, Procore) submit user prompts directly to the OCTEPOS Gateway. The gateway:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-cyan-400 font-bold">1. Strips Context</span>
                    <p className="text-neutral-400 text-[11px]">Injects ephemeral canary tokens and redacts ambient corporate credentials.</p>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-cyan-400 font-bold">2. Traps Egress</span>
                    <p className="text-neutral-400 text-[11px]">Intercepts outbound attempts to call unauthorized third-party endpoints or mutate core databases.</p>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-cyan-400 font-bold">3. Returns Schema</span>
                    <p className="text-neutral-400 text-[11px]">Only passes back verified JSON / Markdown artifacts and physically terminates the session.</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                  <strong>Commercial Advantage:</strong> Zero changes to employee workflow. Can be adopted across an enterprise in under 15 minutes via a Cloudflare Worker or Envoy proxy.
                </div>
              </div>
            )}

            {selectedArch === 'TERMINAL' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
                  <Terminal className="h-4 w-4" />
                  <span>Deployment Model B: Dedicated Sovereign Commercial Terminal (The "OCTEPOS Workstation")</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Positioned for defense agencies, hedge funds, family offices, and regulated banks (e.g., Enterprise Client Alpha).
                  Runs as a hardened, air-gapped terminal where analysts evaluate deals and loan portfolios in an isolated bubble:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-amber-400 font-bold">Hardware Isolation</span>
                    <p className="text-neutral-400 text-[11px]">Direct integration with local sovereign clusters (e.g., dual Proxmox ThinkCentre nodes).</p>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-amber-400 font-bold">Immutable Ledgers</span>
                    <p className="text-neutral-400 text-[11px]">Hardened physical reference monitor preventing any write operations to master ledger databases.</p>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <span className="text-amber-400 font-bold">Zero Network Reach</span>
                    <p className="text-neutral-400 text-[11px]">Strict zero-egress hardware switches preventing data exfiltration to public clouds.</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                  <strong>Commercial Advantage:</strong> High-ticket enterprise subscription ($5k–$25k/seat/month) commanding premium compliance budgets.
                </div>
              </div>
            )}

            {selectedArch === 'HYBRID' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                  <Layers className="h-4 w-4" />
                  <span>The Recommended Enterprise Architecture: Two-Tier Sovereign Engine</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  OCTEPOS functions as an <strong>Invisible Integration Layer for SaaS inputs</strong>, coupled with an <strong>Executive Cockpit for Auditors & Compliance Officers</strong>:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2 text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Employees Use SaaS:</strong> Daily team members use existing web interfaces and Slack bots without changing habits.</span>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>OCTEPOS Sits in Middle:</strong> Intercepts every LLM prompt, strips ambient permissions, evaluates Glass Floor invariants pre-syscall, and verifies zero leakage.</span>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Auditors Use Executive Cockpit:</strong> Compliance officers inspect the Live Policy Decision Log, verify zero ledger mutations, and download cryptographic Merkle attestations for regulatory filings.</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                  <strong>Enterprise Readiness:</strong> Delivers instant operational speed to employees while giving general counsel and CFOs airtight mathematical auditability.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <div className="text-xs font-mono text-neutral-400">
            Current Architecture Mode: <strong className="text-emerald-400">{selectedArch}</strong>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 font-mono text-xs text-neutral-200 transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
