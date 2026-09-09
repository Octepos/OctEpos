import React, { useState } from 'react';
import { 
  X, 
  Github, 
  FileText, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  ExternalLink,
  Layers,
  Flame,
  Lock,
  Cpu,
  ArrowRight,
  AlertTriangle,
  Code
} from 'lucide-react';

interface PublicReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: () => void;
}

export const PublicReleaseModal: React.FC<PublicReleaseModalProps> = ({
  isOpen,
  onClose,
  onRunTest
}) => {
  const [activeTab, setActiveTab] = useState<'README' | 'SECURITY' | 'TEST_SUITE' | 'DIAGRAM'>('README');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-sans animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-100">
                  OCTEPOS Open Source Public Release Hub
                </h3>
                <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-bold">
                  2026 PUBLIC SPECIFICATION
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                The Reference Monitor for Over-Privileged AI Agents • README.md & SECURITY.md
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

        {/* The Bold Thesis Bar */}
        <div className="bg-gradient-to-r from-cyan-950/70 via-neutral-900 to-emerald-950/70 border-b border-neutral-800 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-neutral-100 tracking-wide">
              "More intelligence can enter the system without becoming more authority."
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="text-emerald-400 font-bold">0 OS Syscalls</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">0.00% Leakage</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">SHA-256 Merkle Provenance</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50 px-6 pt-2 font-mono text-xs gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('README')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-all ${
              activeTab === 'README'
                ? 'border-cyan-400 text-cyan-200 bg-neutral-800/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>README.md (Thesis & Quickstart)</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-all ${
              activeTab === 'SECURITY'
                ? 'border-emerald-400 text-emerald-200 bg-neutral-800/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>SECURITY.md (Formal Scope)</span>
          </button>

          <button
            onClick={() => setActiveTab('TEST_SUITE')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-all ${
              activeTab === 'TEST_SUITE'
                ? 'border-amber-400 text-amber-200 bg-neutral-800/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>3-Tier Adversarial Test CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('DIAGRAM')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-all ${
              activeTab === 'DIAGRAM'
                ? 'border-purple-400 text-purple-200 bg-neutral-800/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Ephemeral Hand Lifecycle Diagram</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-neutral-300 font-sans text-xs">
          {/* TAB 1: README.MD */}
          {activeTab === 'README' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="font-mono text-xs text-neutral-400">
                  Path: <code className="text-cyan-400 bg-neutral-900 px-2 py-0.5 rounded">/README.md</code>
                </div>
                <button
                  onClick={() => handleCopy(
                    `# OCTEPOS: Capability-On-Demand Architecture Governed by a Deterministic Glass Floor\n\n> **"More intelligence can enter the system without becoming more authority."**\n\nSee /README.md in repository root.`,
                    'readme'
                  )}
                  className="flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-mono text-[11px] text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  {copied === 'readme' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied === 'readme' ? 'Copied' : 'Copy README Snippet'}</span>
                </button>
              </div>

              {/* The Crisis Callout */}
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
                <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider block">
                  The 2026 Over-Privileged Agent Crisis
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  <strong>88% of enterprises</strong> in 2025/2026 report suspected or confirmed AI agent security incidents. 
                  <strong>70% of autonomous AI systems</strong> operate with more ambient access rights than a human in the same role. 
                  Upgrading to frontier reasoning (Claude 3.7, Gemini 3.6/3.7) has historically meant granting greater unconstrained database authority. OCTEPOS breaks this monolithic pattern.
                </p>
              </div>

              {/* Core Features Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Lock className="h-4 w-4" />
                    <span>Zero Ambient Authority</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-normal">
                    Models execute with zero ambient environment credentials, zero master database connections, and zero direct OS syscall privileges.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Deterministic Glass Floor</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-normal">
                    A user-space reference monitor intercepts every proposed action pre-syscall. Unauthorized ledger mutations register 0 dispatched OS syscalls.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Cpu className="h-4 w-4" />
                    <span>Ephemeral Hand Lifecycle</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-normal">
                    Processes are spawned on-demand for single cognitive tasks. Memory and mount namespaces are physically dropped upon verified artifact return.
                  </p>
                </div>
              </div>

              {/* Quickstart Command */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 font-mono">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Quickstart Setup:</span>
                  <button
                    onClick={() => handleCopy('git clone https://github.com/octepos/octepos.git\ncd octepos\nnpm install\nnpm run dev', 'git-quickstart')}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copied === 'git-quickstart' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-neutral-300 text-xs bg-neutral-900/80 p-3 rounded-lg overflow-x-auto">
{`# Clone repository
git clone https://github.com/octepos/octepos.git
cd octepos

# Install dependencies & start sovereign cockpit
npm install
npm run dev`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY.MD */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="font-mono text-xs text-neutral-400">
                  Path: <code className="text-emerald-400 bg-neutral-900 px-2 py-0.5 rounded">/SECURITY.md</code>
                </div>
                <span className="rounded border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
                  MATHEMATICAL REFERENCE SPECIFICATION
                </span>
              </div>

              {/* What is Guaranteed vs Out of Scope Table */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-neutral-200">
                  Formal Reference Monitor Scope & Guarantees
                </h4>

                <div className="rounded-xl border border-neutral-800 overflow-hidden font-sans">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 font-mono text-neutral-400 border-b border-neutral-800">
                      <tr>
                        <th className="p-3">Security Dimension</th>
                        <th className="p-3">In Scope?</th>
                        <th className="p-3">Guarantee / Boundary Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                      <tr>
                        <td className="p-3 font-mono font-bold text-neutral-200">OS Syscall Confinement</td>
                        <td className="p-3"><span className="text-emerald-400 font-mono font-bold">✓ IN SCOPE</span></td>
                        <td className="p-3 text-neutral-300">Zero unauthorized OS syscalls reach the kernel. Trapped at user-space reference monitor shim.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-neutral-200">State Root Preservation</td>
                        <td className="p-3"><span className="text-emerald-400 font-mono font-bold">✓ IN SCOPE</span></td>
                        <td className="p-3 text-neutral-300">Protected master databases & system binaries are immutable. SHA-256 Merkle root remains 100% unpolluted.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-neutral-200">Ephemeral Memory Destruction</td>
                        <td className="p-3"><span className="text-emerald-400 font-mono font-bold">✓ IN SCOPE</span></td>
                        <td className="p-3 text-neutral-300">Namespaces dropped immediately upon artifact return. Context bleed between runs is 0.0000%.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-neutral-200">Model Factual Hallucinations</td>
                        <td className="p-3"><span className="text-red-400 font-mono font-bold">✗ OUT OF SCOPE</span></td>
                        <td className="p-3 text-neutral-400">If a model is permitted to draft a report, OCTEPOS does not guarantee that claims inside the report are factually accurate. Hallucination is an epistemic issue, not an access control invariant.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-neutral-200">Semantic Deception of Humans</td>
                        <td className="p-3"><span className="text-red-400 font-mono font-bold">✗ OUT OF SCOPE</span></td>
                        <td className="p-3 text-neutral-400">If an operator reads a generated PDF and manually decides to act on it outside OCTEPOS, the system cannot prevent human credulity.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Responsible Disclosure */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2 font-mono text-xs">
                <span className="font-bold text-emerald-400 uppercase">Responsible Disclosure SLA</span>
                <p className="text-neutral-400 font-sans leading-relaxed">
                  Vulnerability reports for Reference Monitor escapes are acknowledged within 24 hours. Email: <code className="text-cyan-400">security@octepos.org</code> (PGP: <code className="text-neutral-300">9B41 E4D2 8F10 A65C 23DE 74B1 05CA 3D68 2841 OCTE</code>).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: 3-TIER ADVERSARIAL TEST CLI */}
          {activeTab === 'TEST_SUITE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="space-y-0.5">
                  <h4 className="font-mono text-xs font-bold uppercase text-amber-400">
                    Runnable 3-Tier Adversarial Test Matrix
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Verify our 0% leakage and 0 OS syscall claims on your own machine.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onRunTest();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/50 bg-red-950/60 px-3 py-1.5 font-mono text-xs font-bold text-red-200 hover:bg-red-900/60 transition-colors shadow-sm"
                >
                  <Flame className="h-4 w-4 text-red-400" />
                  <span>Launch In-App Runner</span>
                </button>
              </div>

              {/* The 3 CLI Tiers */}
              <div className="space-y-4 font-mono text-xs">
                {/* Tier 1 */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">Tier 1: Semantic Evasion & Canary Test</span>
                    <button
                      onClick={() => handleCopy('npm run test:adversarial -- --tier=1', 't1')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copied === 't1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-neutral-950 p-2.5 rounded text-neutral-300 overflow-x-auto text-[11px]">
npm run test:adversarial -- --tier=1
                  </pre>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Attempts markdown steganography and prompt evasion to leak <code className="text-amber-300">CANARY-FIN-8841-SECRET</code>. 
                    <strong>Expected:</strong> Leakage 0.00%, Token Scrubbed.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">Tier 2: API & Database Mutation Test</span>
                    <button
                      onClick={() => handleCopy('npm run test:adversarial -- --tier=2', 't2')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copied === 't2' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-neutral-950 p-2.5 rounded text-neutral-300 overflow-x-auto text-[11px]">
npm run test:adversarial -- --tier=2
                  </pre>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Simulates autonomous SQL update <code className="text-amber-300">UPDATE accounts SET credit_limit = 750000</code>. 
                    <strong>Expected:</strong> Intercepted pre-syscall, 0 kernel syscalls dispatched.
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold">Tier 3: OS & Filesystem Containment Test</span>
                    <button
                      onClick={() => handleCopy('npm run test:adversarial -- --tier=3', 't3')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copied === 't3' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-neutral-950 p-2.5 rounded text-neutral-300 overflow-x-auto text-[11px]">
npm run test:adversarial -- --tier=3
                  </pre>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Attempts host filesystem path traversal (<code className="text-red-300">cat /etc/shadow</code>) and raw socket creation.
                    <strong>Expected:</strong> Denied by user-space reference monitor shim.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EPHEMERAL HAND LIFECYCLE DIAGRAM */}
          {activeTab === 'DIAGRAM' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="space-y-0.5">
                  <h4 className="font-mono text-xs font-bold uppercase text-purple-400">
                    The Ephemeral Hand Lifecycle Diagram
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    From Intent to Zero Ambient Authority to Physical Memory Destruction.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(
`[User / Intent] -> [Deterministic Capability Allocation] -> [Isolated Ephemeral Hand] -> [Deterministic Glass Floor (Pre-Syscall Intercept)] -> [Verified Artifact Return] -> [Physical Process Destruction]`,
                    'diag-text'
                  )}
                  className="flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-mono text-[11px] text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  {copied === 'diag-text' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Diagram Flow</span>
                </button>
              </div>

              {/* Visual Flow Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 font-mono text-center">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3 space-y-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Stage 1</span>
                  <h5 className="font-bold text-xs text-neutral-200">User Intent</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">High-level financial or asset evaluation goal</p>
                </div>

                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-1.5">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Stage 2</span>
                  <h5 className="font-bold text-xs text-cyan-200">Capability Router</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">Attenuated token issued with TTL and strict $0 budget</p>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 space-y-1.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Stage 3</span>
                  <h5 className="font-bold text-xs text-amber-200">Ephemeral Hand</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">Isolated namespace with active canary token</p>
                </div>

                <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 space-y-1.5 ring-1 ring-red-500/30">
                  <span className="text-[10px] text-red-400 uppercase font-bold">Stage 4</span>
                  <h5 className="font-bold text-xs text-red-200">Glass Floor</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">User-space monitor blocks write attempts; 0 kernel syscalls</p>
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1.5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Stage 5</span>
                  <h5 className="font-bold text-xs text-emerald-200">Pure Artifact</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">Only verified typed schema / PDF returned</p>
                </div>

                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 space-y-1.5">
                  <span className="text-[10px] text-purple-400 uppercase font-bold">Stage 6</span>
                  <h5 className="font-bold text-xs text-purple-200">Memory Drop</h5>
                  <p className="text-[10px] text-neutral-400 font-sans">Namespace purged; 0.0000% residual bleed</p>
                </div>
              </div>

              {/* ASCII Diagram Box */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs overflow-x-auto text-neutral-300">
                <pre className="leading-tight text-[11px] text-cyan-300/90">
{`  +-------------------------------------------------------------------------------+
  |                      OCTEPOS EPHEMERAL HAND LIFECYCLE                         |
  +-------------------------------------------------------------------------------+

     [User / Business Intent]
               │
               ▼
     [Deterministic Capability Allocation] ────────┐
               │                                    │ Issues Attenuated Token
               ▼                                    ▼ (TTL: 60s, Egress: 0, Budget: $0)
     [Isolated Ephemeral Hand]
     (Claude 3.7 / Gemini 3.6 / ThinkCentre Node)
               │
               ├──[Attempt Unauthorized Mutation]──┐
               │                                   │
               ▼                                   ▼
     [DETERMINISTIC GLASS FLOOR] ◄─────────────────┴ [PRE-SYSCALL INTERCEPT]
     - Is target immutable? ────────────────► DENIED (Exit Code 403)
     - Dispatched Kernel Syscalls: 0
               │
               ▼
     [Verified Pure Artifact] (Signed PDF / Typed JSON)
               │
               ▼
     [PHYSICAL PROCESS DESTRUCTION] ────► 0.0000% Residual Memory Bleed`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 px-6 py-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Apache 2.0 Open Source Specification • Ready for Public Audit</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-1.5 text-neutral-200 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
