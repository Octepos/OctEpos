import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  Briefcase, 
  Layers, 
  DollarSign, 
  Lock, 
  FileCheck, 
  CheckCircle2, 
  Terminal,
  Download,
  Code2,
  Github
} from 'lucide-react';
import { PolicyDecision, CanaryState, SubstrateId } from '../types/octepos';
import { CommercialWorkflowsSection } from './CommercialWorkflowsSection';
import { PolicyDecisionLog } from './PolicyDecisionLog';
import { CapabilityAllocationMatrix } from './CapabilityAllocationMatrix';
import { AuditorStateProof } from './AuditorStateProof';

interface CommercialExecutiveViewProps {
  canaryState: CanaryState;
  policyDecisions: PolicyDecision[];
  onLogPolicyDecision: (decision: PolicyDecision) => void;
  onOpenPolicyManager: () => void;
  onOpenArchitectureExplorer: () => void;
  onOpenPublicRelease?: () => void;
  onSelectSubstrate?: (id: SubstrateId) => void;
}

export const CommercialExecutiveView: React.FC<CommercialExecutiveViewProps> = ({
  canaryState,
  policyDecisions,
  onLogPolicyDecision,
  onOpenPolicyManager,
  onOpenArchitectureExplorer,
  onOpenPublicRelease,
  onSelectSubstrate
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'WORKFLOWS' | 'MATRIX' | 'DECISIONS' | 'AUDITOR'>('ALL');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Executive Commercial Header Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                OCTEPOS Enterprise Governance Cockpit
              </span>
              <span className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                EXECUTIVE & AUDITOR SUITE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
              Stateless Intelligence with Invariant Authority
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Borrow just enough frontier intelligence to draft critical reports, extract verified canonical artifacts, and physically drop the execution space. Your master financial ledgers and proprietary asset records remain 100% untouched.
            </p>
          </div>

          {/* Quick Access Commercial Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenPublicRelease && (
              <button
                onClick={onOpenPublicRelease}
                className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-mono text-cyan-200 hover:bg-cyan-900/60 transition-colors shadow-sm"
              >
                <Github className="h-4 w-4 text-cyan-400" />
                <span>Public Release (README & SECURITY.md)</span>
              </button>
            )}

            <button
              onClick={onOpenPolicyManager}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/90 px-3.5 py-2 text-xs font-mono text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors shadow-sm"
            >
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>Dynamic Policy Language</span>
            </button>

            <button
              onClick={onOpenArchitectureExplorer}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-mono text-emerald-200 hover:bg-emerald-900/60 transition-colors shadow-sm"
            >
              <Briefcase className="h-4 w-4 text-emerald-400" />
              <span>Commercial Deployment Thesis</span>
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80 font-mono">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Master Ledger Mutations</span>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>0 (Locked)</span>
            </div>
            <span className="text-[10px] text-neutral-400">Zero ambient authority</span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Unmetered Spend Incurred</span>
            <div className="text-lg font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <DollarSign className="h-4 w-4 text-cyan-400" />
              <span>$0.00 Sunk</span>
            </div>
            <span className="text-[10px] text-neutral-400">Pre-syscall billing intercept</span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Context Residual Bleed</span>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>0.0000%</span>
            </div>
            <span className="text-[10px] text-neutral-400">Physical process dropped</span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Statutory Audit Status</span>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Compliant</span>
            </div>
            <span className="text-[10px] text-neutral-400">SHA-256 Merkle Provenance</span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Executive Modules' },
            { id: 'WORKFLOWS', label: 'Live Commercial Workflows' },
            { id: 'DECISIONS', label: `Policy Decision Log (${policyDecisions.length})` },
            { id: 'MATRIX', label: 'Capability Allocation Matrix' },
            { id: 'AUDITOR', label: 'State Proofs for Auditors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="hidden sm:inline-block font-mono text-xs text-neutral-500">
          PROVABLE BOUNDARIES v3.8
        </span>
      </div>

      {/* Section 1: Live Commercial Workflows (Feddes Finance & 307 New Brighton Road) */}
      {(activeTab === 'ALL' || activeTab === 'WORKFLOWS') && (
        <section id="commercial-workflows">
          <CommercialWorkflowsSection
            onLogPolicyDecision={onLogPolicyDecision}
            onSelectSubstrate={onSelectSubstrate}
          />
        </section>
      )}

      {/* Section 2: Capability Allocation Matrix */}
      {(activeTab === 'ALL' || activeTab === 'MATRIX') && (
        <section id="capability-matrix">
          <CapabilityAllocationMatrix
            onSelectSubstrate={onSelectSubstrate}
          />
        </section>
      )}

      {/* Section 3: Policy Decision Log (Administrative Denials) */}
      {(activeTab === 'ALL' || activeTab === 'DECISIONS') && (
        <section id="policy-log">
          <PolicyDecisionLog
            decisions={policyDecisions}
          />
        </section>
      )}

      {/* Section 4: State Integrity Proofs for Auditors */}
      {(activeTab === 'ALL' || activeTab === 'AUDITOR') && (
        <section id="auditor-proofs">
          <AuditorStateProof
            canaryState={canaryState}
          />
        </section>
      )}
    </div>
  );
};
