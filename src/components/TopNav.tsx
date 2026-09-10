import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  Flame, 
  Terminal, 
  Server, 
  BookOpen, 
  CheckCircle2, 
  AlertOctagon,
  Briefcase,
  Code2,
  FileCheck,
  Lock,
  Github,
  Workflow
} from 'lucide-react';
import { AppMode } from '../types/octepos';

interface TopNavProps {
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  onRunAdversarialTest: () => void;
  onOpenProxmoxConfig: () => void;
  onOpenEpistemicGuide: () => void;
  onOpenPolicyManager: () => void;
  onOpenArchitectureExplorer: () => void;
  onOpenPublicRelease: () => void;
  onOpenCertificateModal?: () => void;
  onOpenCloudRunPerimeter?: () => void;
  onOpenWorkflowLens?: () => void;
  isSseConnected?: boolean;
  activeTestRunning: boolean;
  forensicCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  appMode,
  onToggleAppMode,
  onRunAdversarialTest,
  onOpenProxmoxConfig,
  onOpenEpistemicGuide,
  onOpenPolicyManager,
  onOpenArchitectureExplorer,
  onOpenPublicRelease,
  onOpenCertificateModal,
  onOpenCloudRunPerimeter,
  onOpenWorkflowLens,
  isSseConnected = true,
  activeTestRunning,
  forensicCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/40 bg-neutral-900 shadow-inner">
            <Layers className="h-5 w-5 text-cyan-400" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-wider text-neutral-100">
                OCTEPOS
              </span>
              <span className="rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                v3.8
              </span>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                REFERENCE MONITOR: INVARIANT
              </span>
            </div>
            <p className="text-xs text-neutral-400 tracking-tight">
              {appMode === 'EXECUTIVE_AUDIT' 
                ? 'Enterprise Executive & Statutory Audit Suite • Enterprise Client Alpha & Commercial Asset 01' 
                : 'Fluid Intelligence Workspace & Capability-Based Security Router'}
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="hidden md:flex items-center rounded-lg border border-neutral-800 bg-neutral-900/80 p-1 font-mono text-xs">
          <button
            onClick={() => onToggleAppMode('EXECUTIVE_AUDIT')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              appMode === 'EXECUTIVE_AUDIT'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Executive & Audit View</span>
          </button>

          <button
            onClick={() => onToggleAppMode('ENGINEERING_COCKPIT')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              appMode === 'ENGINEERING_COCKPIT'
                ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Engineering Cockpit</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Live SSE Stream Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 font-mono text-[10px] text-emerald-300 shadow-sm" title="Real-time Server-Sent Events (SSE) stream to Cloud Run backend">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSseConnected ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span>{isSseConnected ? 'SSE: ASIA-SE1 RUNNING' : 'SSE: RECONNECTING'}</span>
          </div>

          {/* Cryptographic Audit Certificate Modal Trigger */}
          {onOpenCertificateModal && (
            <button
              onClick={onOpenCertificateModal}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-mono text-emerald-200 hover:bg-emerald-900/60 hover:text-white transition-colors shadow-sm"
              title="Inspect & Verify Cryptographically Signed Audit Certificate (RFC 8785)"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Audit Certificate</span>
              <span className="sm:hidden">Cert</span>
            </button>
          )}

          {/* Cloud Run VPC Security Blueprint Modal Trigger */}
          {onOpenCloudRunPerimeter && (
            <button
              onClick={onOpenCloudRunPerimeter}
              className="hidden md:flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs font-mono text-cyan-200 hover:bg-cyan-900/50 hover:text-white transition-colors shadow-sm"
              title="Google Cloud Run & Zero-Egress VPC Firewall Blueprint"
            >
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cloud Run VPC</span>
            </button>
          )}

          {/* Public Release Hub Button - always accessible */}
          <button
            onClick={onOpenPublicRelease}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 text-xs font-mono text-cyan-200 hover:bg-cyan-900/60 hover:text-white transition-colors shadow-sm"
            title="Open Source Public Release Specification (README & SECURITY.md)"
          >
            <Github className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Public Release</span>
            <span className="xl:hidden">Docs</span>
          </button>

          {/* AI Studio Workflow Lens & Spec Compiler (Clipboard MVP) - always accessible */}
          {onOpenWorkflowLens && (
            <button
              id="btn-trigger-studio-lens"
              onClick={onOpenWorkflowLens}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-400/60 bg-gradient-to-r from-cyan-950/90 via-neutral-900 to-cyan-950/60 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-200 hover:border-cyan-300 hover:text-white shadow-md transition-all group"
              title="Open OCTEPOS Studio Lens & Spec Compiler (Clipboard MVP & Free Compute Harvester)"
            >
              <Workflow className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Studio Lens</span>
              <span className="hidden sm:inline rounded bg-cyan-950 border border-cyan-500/40 px-1 py-0.2 text-[9px] text-cyan-300">
                CLIPBOARD MVP
              </span>
            </button>
          )}

          {appMode === 'EXECUTIVE_AUDIT' ? (
            <>
              <button
                onClick={onOpenPolicyManager}
                className="hidden lg:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                title="Dynamic Policy Ruleset (CEL)"
              >
                <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Policy Rules</span>
              </button>

              <button
                onClick={onOpenArchitectureExplorer}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                title="Commercial Deployment Thesis"
              >
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                <span>Enterprise Thesis</span>
              </button>

              <button
                id="btn-trigger-compliance-ledger"
                onClick={() => {
                  const element = document.getElementById('policy-log');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/60 bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-emerald-950/40 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-200 hover:border-emerald-400 hover:text-white shadow-md transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <span>Live Compliance & Audit Ledger</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const el = document.getElementById('section-compliance-matrix');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-xs font-mono text-emerald-200 hover:bg-emerald-900/50 hover:text-white transition-colors"
                title="SOC 2 & ISO 27001 Compliance Matrix & Audit Exports"
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>SOC 2 & ISO Matrix</span>
              </button>

              <button
                onClick={onOpenEpistemicGuide}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                title="Non-Anthropomorphic Epistemic Principles"
              >
                <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                <span>Epistemic Doctrine</span>
              </button>

              <button
                onClick={onOpenProxmoxConfig}
                className="hidden lg:flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
                title="Configure Proxmox VE Dual ThinkCentre Cluster"
              >
                <Server className="h-3.5 w-3.5 text-amber-400" />
                <span>PVE 2/2 UP</span>
              </button>

              {/* 3-TIER ADVERSARIAL TEST TRIGGER BUTTON */}
              <button
                id="btn-trigger-adversarial-test"
                onClick={onRunAdversarialTest}
                disabled={activeTestRunning}
                className={`relative group flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md ${
                  activeTestRunning
                    ? 'border border-amber-500/50 bg-amber-950/40 text-amber-200 animate-pulse'
                    : 'border border-red-500/60 bg-gradient-to-r from-red-950/60 via-neutral-900 to-red-950/40 text-red-200 hover:border-red-400 hover:text-white hover:shadow-red-950/50'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <Flame className="h-4 w-4 text-red-400 group-hover:scale-110 transition-transform" />
                <span>3-Tier Adversarial Test</span>
                {activeTestRunning && (
                  <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[10px] text-amber-300">
                    RUNNING
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="flex md:hidden border-t border-neutral-800 bg-neutral-900/90 px-4 py-2 font-mono text-xs justify-around">
        <button
          onClick={() => onToggleAppMode('EXECUTIVE_AUDIT')}
          className={`px-3 py-1 rounded ${appMode === 'EXECUTIVE_AUDIT' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40' : 'text-neutral-400'}`}
        >
          Executive & Audit View
        </button>
        <button
          onClick={() => onToggleAppMode('ENGINEERING_COCKPIT')}
          className={`px-3 py-1 rounded ${appMode === 'ENGINEERING_COCKPIT' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-neutral-400'}`}
        >
          Engineering Cockpit
        </button>
      </div>
    </header>
  );
};
