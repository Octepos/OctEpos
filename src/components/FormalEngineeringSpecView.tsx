import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileText, 
  Code2, 
  Lock, 
  Network, 
  Database,
  ArrowRight,
  Zap
} from 'lucide-react';

interface InvariantSpec {
  id: string;
  symbol: string;
  name: string;
  shortSummary: string;
  formalStatement: string;
  mathNotation: string;
  isolationMechanism: string[];
  falsificationCriteria: string;
  standardMapping: string;
  status: 'PROVEN' | 'ENFORCED';
}

export const FORMAL_INVARIANTS: InvariantSpec[] = [
  {
    id: 'I0',
    symbol: 'I₀',
    name: 'Isolation Boundary & Zero Syscall Egress',
    shortSummary: 'Userspace reference monitor aborts unauthorized intents prior to any host OS system call.',
    formalStatement: 'An unauthorized action intent A ∉ Caps(L) submitted to the Execution Gate shall trigger a userspace interception and abort prior to the invocation of any host operating system system call.',
    mathNotation: '∀ A ∈ Intents,  Authorized(A, L) = False ⟹ SyscallsDispatched(A) = 0',
    isolationMechanism: [
      'Target execution runs within a restricted seccomp-bpf filter and unprivileged user namespace (CLONE_NEWUSER | CLONE_NEWPID | CLONE_NEWNET).',
      'The Glass Floor Interceptor operates as a userspace reference monitor over an in-memory/UNIX domain socket protocol.',
      'Authorization validation executes entirely in memory. Malicious or un-leased intents raise a GLASS_FLOOR_VIOLATION trap, zeroing memory and returning immediately without invoking SYS_connect, SYS_sendto, SYS_write, or SYS_execve.'
    ],
    falsificationCriteria: 'Inject MUTATE_LEDGER or ../../etc/passwd intent; strace / seccomp tracer must log exactly 0 dispatched syscalls.',
    standardMapping: 'SOC 2 CC6.6 / CC6.8 • ISO 27001 A.8.20 / A.8.28 • NIST SP 800-207 Tenet 4',
    status: 'ENFORCED'
  },
  {
    id: 'I1',
    symbol: 'I₁',
    name: 'Airgap vs. Network Egress Mutual Exclusivity',
    shortSummary: 'Strict airgap mode physically isolates network namespaces; egress mode binds only to verified TLS endpoints.',
    formalStatement: 'An OCTEPOS instance operates in one of two mutually exclusive modes: M ∈ {AIRGAP_STRICT, HYBRID_SIDECAR}. An instance in AIRGAP_STRICT mode is physically incapable of dispatching outbound network traffic to external APIs.',
    mathNotation: 'M = AIRGAP_STRICT ⟺ (RoutingTable = {lo: 127.0.0.1/8} ∧ ExtPacketsSent ≡ 0)',
    isolationMechanism: [
      'In AIRGAP_STRICT: Container network namespace has eth0 stripped or DOWN with no default route; external cloud APIs (Gemini/OpenAI) are unresolvable and unroutable.',
      'Local inference runs over local UNIX domain socket (/var/run/octepos/vllm.sock) with raw socket creation disabled via seccomp-bpf.',
      'In HYBRID_SIDECAR: Outbound egress is pinned strictly to an explicit SNI/IP whitelist with mTLS, still governed by I₀ and I₂.'
    ],
    falsificationCriteria: 'Attempt HTTP socket creation in AIRGAP_STRICT mode; kernel socket creation must fail with ENETUNREACH or EPERM.',
    standardMapping: 'SOC 2 CC6.6 • ISO 27001 A.8.22 • NIST SP 800-207 Tenet 2',
    status: 'ENFORCED'
  },
  {
    id: 'I2',
    symbol: 'I₂',
    name: 'Evidence vs. Execution Separation (PDP/PEP)',
    shortSummary: 'Model outputs are strictly typed as untrusted Evidence with zero ambient authority.',
    formalStatement: 'Output emitted by any AI model is strictly typed as untrusted Evidence (E) and possesses zero ambient execution authority.',
    mathNotation: 'E = ⟨D_candidate, R_tokens, σ_model⟩  where  Authority(E) ≡ ∅',
    isolationMechanism: [
      'The Evidence Gate validates raw model responses against a strict JSON Schema/Zod definition.',
      'Valid payloads are canonicalized per RFC 8785 (JSON Canonicalization Scheme) to eliminate whitespace and dictionary key ordering variances.',
      'No model output is ever passed directly to an eval(), shell interpreter, or database client.'
    ],
    falsificationCriteria: 'Attempt to execute a raw model string as a shell script or SQL query; Evidence Gate rejects non-schema structures and returns 0 credentials.',
    standardMapping: 'SOC 2 CC6.1 / CC6.3 • ISO 27001 A.5.15 • NIST SP 800-207 Tenet 1',
    status: 'PROVEN'
  },
  {
    id: 'I3',
    symbol: 'I₃',
    name: 'Deterministic Policy Decision Point (PDP)',
    shortSummary: 'Policy evaluation is side-effect-free, budget-bounded, and mathematically invariant.',
    formalStatement: 'The Policy Decision Point (PDP) evaluation function f_eval is pure, side-effect free, and mathematically deterministic over identical canonical inputs.',
    mathNotation: '∀ t₁, t₂ ∈ Time,  f_eval(J_canonical, C, P)_{t₁} ≡ f_eval(J_canonical, C, P)_{t₂}',
    isolationMechanism: [
      'The policy engine uses Google Common Expression Language (CEL) with non-deterministic functions disabled (no random, no wall-clock drift, no I/O).',
      'Runtime is hard-capped at T_eval ≤ 2.0 ms with AST depth ≤ 10 to prevent ReDoS or infinite recursion.',
      'Policies are immutable, content-addressed files identified by SHA-256 cryptographic digests.'
    ],
    falsificationCriteria: 'Run 10,000 permutations of canonical payloads across different epochs; evaluation outcome must remain 100.00% identical.',
    standardMapping: 'SOC 2 CC8.1 • ISO 27001 A.8.31 • NIST SP 800-207 Tenet 5',
    status: 'PROVEN'
  },
  {
    id: 'I4',
    symbol: 'I₄',
    name: 'Zero Ambient Authority & Monotonic Attenuation',
    shortSummary: 'Execution requires explicit HMAC-SHA256 capability leases with non-increasing permissions.',
    formalStatement: 'No process or function executes with implicit privileges. All operations require an explicit, unforgeable capability token with monotonically non-increasing scope.',
    mathNotation: '∀ L_child, L_parent:  Scope(L_child) ⊆ Scope(L_parent) ∧ TTL(L_child) ≤ TTL(L_parent)',
    isolationMechanism: [
      'Tokens are HMAC-SHA256 capability grants signed with an isolated cluster secret (OCTEPOS_KEY_SALT).',
      'Ambient process tokens (environment variables, inherited IAM roles) are scrubbed at process boot.',
      'Delegation enforces monotonic attenuation: child tasks cannot exceed parent capability scope or lease expiration.'
    ],
    falsificationCriteria: 'Child process attempts to claim WRITE_STATE when parent holds only READ_STATE; PolicyLeaseManager rejects with ATTENUATION_VIOLATION.',
    standardMapping: 'SOC 2 CC6.2 • ISO 27001 A.9.4 • NIST SP 800-207 Tenet 6',
    status: 'ENFORCED'
  },
  {
    id: 'I5',
    symbol: 'I₅',
    name: 'Cryptographic State Provenance & Idempotency',
    shortSummary: 'Every state transition is bound to an RFC 6962 Merkle tree leaf and atomic SQLite WAL transaction.',
    formalStatement: 'Every committed action must be atomically paired with an RFC 6962 binary Merkle leaf and executed exactly once per idempotent key.',
    mathNotation: '∀ K_idempotency: Executions(K) ≤ 1 ∧ Root_N = MerkleUpdate(Root_{N-1}, SHA256(0x00 ∥ J_canonical))',
    isolationMechanism: [
      'Duplicate deliveries matching K_idempotency return cached signed receipts without invoking the downstream system.',
      'Local ledger uses SQLite in WAL (Write-Ahead Logging) mode with PRAGMA synchronous = NORMAL and BEGIN IMMEDIATE transactions.',
      'Merkle tree leaves strictly enforce RFC 6962 standard byte domain separation (0x00 for leaf nodes, 0x01 for internal nodes) to eliminate second-preimage attacks.'
    ],
    falsificationCriteria: 'Resubmit identical payload 500 times concurrently; exactly 1 record committed to SQLite WAL; exactly 1 leaf added to Merkle tree.',
    standardMapping: 'SOC 2 CC7.2 • ISO 27001 A.8.24 • NIST SP 800-207 Tenet 7',
    status: 'PROVEN'
  }
];

export const FormalEngineeringSpecView: React.FC = () => {
  const [selectedInvariantId, setSelectedInvariantId] = useState<string>('I0');

  const selectedInvariant = FORMAL_INVARIANTS.find(inv => inv.id === selectedInvariantId) || FORMAL_INVARIANTS[0];

  const handleDownloadSpec = () => {
    const specUrl = '/ENGINEERING_SPEC.md';
    window.open(specUrl, '_blank');
  };

  return (
    <div className="space-y-6 font-mono text-xs animate-fadeIn">
      {/* Top Banner: Formal Engineering System Overview */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                Formal Engineering Specification: Invariant Control Plane
              </h4>
              <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                SPEC v4.0.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Formally stated mathematical invariants governing the boundary between probabilistic models and deterministic execution.
            </p>
          </div>

          <a
            href="/ENGINEERING_SPEC.md"
            download="OCTEPOS_ENGINEERING_SPEC.md"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Download Full Spec (MD)</span>
          </a>
        </div>

        {/* 5-Stage Execution Lifecycle Pipeline Diagram */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            Execution Lifecycle & Boundary Topology:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-[11px]">
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 space-y-1">
              <div className="text-neutral-500 text-[10px] font-bold">STAGE 1</div>
              <div className="font-bold text-neutral-200">Untrusted LLM</div>
              <div className="text-[10px] text-neutral-500">vLLM socket / TLS</div>
            </div>

            <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-2.5 space-y-1">
              <div className="text-cyan-400 text-[10px] font-bold">STAGE 2 • I₂</div>
              <div className="font-bold text-cyan-200">Evidence Gate</div>
              <div className="text-[10px] text-neutral-400">RFC 8785 Canonical JSON</div>
            </div>

            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-2.5 space-y-1">
              <div className="text-emerald-400 text-[10px] font-bold">STAGE 3 • I₃</div>
              <div className="font-bold text-emerald-200">CEL Policy (PDP)</div>
              <div className="text-[10px] text-neutral-400">Deterministic Invariants</div>
            </div>

            <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-2.5 space-y-1">
              <div className="text-amber-400 text-[10px] font-bold">STAGE 4 • I₀ / I₄</div>
              <div className="font-bold text-amber-200">Execution Gate (PEP)</div>
              <div className="text-[10px] text-neutral-400">Glass Floor Traps (0 syscall)</div>
            </div>

            <div className="rounded-lg border border-purple-500/40 bg-purple-950/20 p-2.5 space-y-1">
              <div className="text-purple-400 text-[10px] font-bold">STAGE 5 • I₅</div>
              <div className="font-bold text-purple-200">Merkle & WAL</div>
              <div className="text-[10px] text-neutral-400">Atomic SQLite Idempotency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invariant Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {FORMAL_INVARIANTS.map(inv => {
          const isSelected = inv.id === selectedInvariantId;
          return (
            <button
              key={inv.id}
              onClick={() => setSelectedInvariantId(inv.id)}
              className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between space-y-1.5 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/40 shadow-sm'
                  : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-sm text-emerald-400">{inv.symbol}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                  {inv.status}
                </span>
              </div>
              <div className="font-bold text-xs text-neutral-200 truncate">{inv.name.split('&')[0]}</div>
              <div className="text-[10px] text-neutral-500 line-clamp-1">{inv.shortSummary}</div>
            </button>
          );
        })}
      </div>

      {/* Detailed Invariant Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-emerald-400 font-mono">
                INVARIANT {selectedInvariant.symbol}:
              </span>
              <h3 className="text-sm font-bold text-neutral-100 font-sans">
                {selectedInvariant.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {selectedInvariant.shortSummary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold">
              VERIFIED INVARIANT
            </span>
          </div>
        </div>

        {/* Mathematical Expression Box */}
        <div className="rounded-xl border border-emerald-500/30 bg-neutral-950 p-4 space-y-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Mathematical Definition & Invariant Condition:
          </span>
          <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 text-emerald-300 font-mono text-xs overflow-x-auto">
            {selectedInvariant.mathNotation}
          </div>
          <p className="text-[11px] text-neutral-300 italic pt-1">
            "{selectedInvariant.formalStatement}"
          </p>
        </div>

        {/* Isolation Mechanics */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
            Concrete Isolation & Enforcement Mechanisms:
          </span>
          <div className="space-y-2">
            {selectedInvariant.isolationMechanism.map((mech, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-neutral-300 leading-relaxed">{mech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Falsification Criteria & GRC Mapping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-red-500/30 bg-red-950/10 p-4 space-y-2">
            <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Passing Falsification Criteria (Unit Test)</span>
            </span>
            <p className="text-[11px] text-neutral-300 leading-relaxed font-mono">
              {selectedInvariant.falsificationCriteria}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-4 space-y-2">
            <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Standard Compliance Traceability</span>
            </span>
            <p className="text-[11px] text-neutral-300 leading-relaxed font-mono">
              {selectedInvariant.standardMapping}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
