import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  ArrowRight, 
  Cpu, 
  Lock, 
  Sparkles,
  Search,
  Filter,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { EvidenceGateTriageEvent } from '../types/octepos';

interface EvidenceGateSectionProps {
  triageEvents: EvidenceGateTriageEvent[];
  onTriageCompleted?: (event: EvidenceGateTriageEvent) => void;
}

interface CandidatePreset {
  id: string;
  name: string;
  ruleId: string;
  sourceTool: 'SAST' | 'COROSYNC_MONITOR' | 'REFERENCE_MONITOR';
  sourcePath: string;
  codeSnippet: string;
  expectedOutcome: string;
  expectedVerdict: 'CONFIRMED_TRUE_POSITIVE' | 'FILTERED_FALSE_POSITIVE' | 'INSUFFICIENT_EVIDENCE';
}

const PRESET_CANDIDATES: CandidatePreset[] = [
  {
    id: 'ALERT-OWASP-BOPLA',
    name: 'OWASP API3: Mass Assignment (BOPLA)',
    ruleId: 'OWASP_API3_BOPLA',
    sourceTool: 'SAST',
    sourcePath: 'src/controllers/account.controller.ts',
    codeSnippet: 'const { role, balance, ...safe } = req.body;\nObject.assign(targetUser, req.body); // Unsanitized mass assignment',
    expectedOutcome: 'Triage gate validates missing whitelist, traces privilege escalation, and confirms True Positive with >= 2 CoT steps.',
    expectedVerdict: 'CONFIRMED_TRUE_POSITIVE'
  },
  {
    id: 'ALERT-CANARY-SECRET',
    name: 'Reference Monitor Canary Probe',
    ruleId: 'SYNTHETIC_CANARY_PROBE',
    sourceTool: 'REFERENCE_MONITOR',
    sourcePath: 'src/security/CanaryToken.ts',
    codeSnippet: 'const CANARY_TOKEN = "CANARY-FIN-8841-SECRET";\n// Injected canary to measure zero state leakage baseline',
    expectedOutcome: 'Triage gate identifies synthetic canary token; filters out false alarm to prevent developer alert fatigue.',
    expectedVerdict: 'FILTERED_FALSE_POSITIVE'
  },
  {
    id: 'ALERT-WEAK-CONTEXT',
    name: 'Ambiguous Fetch Sink (Low Confidence)',
    ruleId: 'POSSIBLE_SSRF',
    sourceTool: 'SAST',
    sourcePath: 'src/services/webhook.ts',
    codeSnippet: 'const res = await fetch(userProvidedUrl);\n// Perimeter egress filter not visible in localized AST snippet',
    expectedOutcome: 'Confidence drops below 0.65 threshold; penalty directive automatically down-ranks verdict to INSUFFICIENT_EVIDENCE.',
    expectedVerdict: 'INSUFFICIENT_EVIDENCE'
  }
];

export const EvidenceGateSection: React.FC<EvidenceGateSectionProps> = ({
  triageEvents,
  onTriageCompleted
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePreset>(PRESET_CANDIDATES[0]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTriageResult, setActiveTriageResult] = useState<EvidenceGateTriageEvent | null>(null);
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [customSnippet, setCustomSnippet] = useState(PRESET_CANDIDATES[0].codeSnippet);

  const handleSelectPreset = (candidate: CandidatePreset) => {
    setSelectedCandidate(candidate);
    setCustomSnippet(candidate.codeSnippet);
    setActiveTriageResult(null);
  };

  const handleExecuteTriage = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setActiveTriageResult(null);

    try {
      const res = await fetch('/api/evidence-gate/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selectedCandidate.id,
          sourceTool: selectedCandidate.sourceTool,
          ruleId: selectedCandidate.ruleId,
          sourcePath: selectedCandidate.sourcePath,
          codeSnippet: customSnippet
        })
      });

      const data = await res.json();
      if (data.success && data.triage) {
        const triageEvt: EvidenceGateTriageEvent = {
          id: `EVG-${Date.now()}`,
          alertId: selectedCandidate.id,
          verdict: data.triage.verdict,
          confidenceScore: data.triage.confidenceScore,
          vulnerabilityType: data.triage.vulnerabilityType,
          reasoningSteps: data.triage.reasoningSteps,
          attackScenario: data.triage.attackScenario,
          sanitizationEvidence: data.triage.sanitizationEvidence,
          riskLevel: data.triage.riskLevel,
          provenanceDigest: data.triage.provenanceDigest,
          merkleEpoch: data.merkleEpoch,
          timestamp: new Date().toLocaleTimeString()
        };
        setActiveTriageResult(triageEvt);
        if (onTriageCompleted) {
          onTriageCompleted(triageEvt);
        }
      }
    } catch (err) {
      console.error('Evidence Gate Triage error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const copyDigestToClipboard = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <span>AI "Evidence Gate" & Structured Invariant Triage</span>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-800 font-semibold">
                PILLAR 3 ENFORCEMENT
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            Filters high-speed deterministic alerts through structured JSON schemas, minimum 2-step Chain-of-Thought (CoT) mandates, and RFC 8785 canonical hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-right">
            <span className="text-[10px] text-neutral-500 block">FALSE-POSITIVE SUPPRESSION:</span>
            <span className="text-sm font-bold text-emerald-400">93.7%</span>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-right">
            <span className="text-[10px] text-neutral-500 block">MIN CoT MANDATE:</span>
            <span className="text-sm font-bold text-cyan-300">&ge; 2 Steps</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Candidate Alert Presets & Inspection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-cyan-400" /> Select Candidate Alert
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">
              3 Representative Invariant Vectors
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {PRESET_CANDIDATES.map((c) => {
              const isSelected = selectedCandidate.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectPreset(c)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 text-neutral-100 shadow-md ring-1 ring-cyan-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-neutral-200">{c.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      c.expectedVerdict === 'CONFIRMED_TRUE_POSITIVE'
                        ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                        : c.expectedVerdict === 'FILTERED_FALSE_POSITIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}>
                      {c.expectedVerdict}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-2 mb-1">
                    <span>{c.sourceTool}</span>
                    <span>&bull;</span>
                    <span className="text-neutral-500">{c.sourcePath}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans">
                    {c.expectedOutcome}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Snippet Editor / Viewer */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-1.5 font-bold text-neutral-300">
                <FileCode className="h-3.5 w-3.5 text-cyan-400" /> Target Source Code Snippet
              </span>
              <span className="text-[10px] text-neutral-500">Source: {selectedCandidate.sourcePath}</span>
            </div>
            <textarea
              value={customSnippet}
              onChange={(e) => setCustomSnippet(e.target.value)}
              rows={4}
              className="w-full rounded bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"
            />

            <button
              onClick={handleExecuteTriage}
              disabled={isEvaluating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold py-2.5 px-4 transition-colors disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Programmatic Validation Loop Active...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Execute Evidence Gate Triage ({selectedCandidate.ruleId})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Triage Verdict & RFC 8785 Attestation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Evidence Gate Structured Output
            </span>
            {activeTriageResult && (
              <span className="text-neutral-500 text-[10px]">
                Attested at {activeTriageResult.timestamp}
              </span>
            )}
          </div>

          {activeTriageResult ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 animate-fadeIn">
              {/* Verdict Banner */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-neutral-900">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">TRIAGE VERDICT:</span>
                  <span className={`text-base font-black ${
                    activeTriageResult.verdict === 'CONFIRMED_TRUE_POSITIVE'
                      ? 'text-red-400'
                      : activeTriageResult.verdict === 'FILTERED_FALSE_POSITIVE'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {activeTriageResult.verdict}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block uppercase">CONFIDENCE:</span>
                  <span className="text-base font-black text-cyan-300">
                    {(activeTriageResult.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Chain of Thought Mandate Steps */}
              <div className="space-y-1.5">
                <span className="text-neutral-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3 text-cyan-400" /> Enforced Chain-of-Thought (CoT) Steps ({activeTriageResult.reasoningSteps.length}):
                </span>
                <div className="space-y-1.5">
                  {activeTriageResult.reasoningSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2"
                    >
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 shrink-0">
                        STEP {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attack Scenario or Sanitization Evidence */}
              {activeTriageResult.attackScenario && (
                <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 text-[11px] text-red-200">
                  <strong className="text-red-400 block text-[10px] uppercase mb-0.5">Simulated Attack Scenario:</strong>
                  {activeTriageResult.attackScenario}
                </div>
              )}

              {activeTriageResult.sanitizationEvidence && (
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-200">
                  <strong className="text-emerald-400 block text-[10px] uppercase mb-0.5">Sanitization Trace:</strong>
                  {activeTriageResult.sanitizationEvidence}
                </div>
              )}

              {/* RFC 8785 Canonical Provenance Digest */}
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>RFC 8785 MERKLE PROVENANCE DIGEST (SHA-256)</span>
                  <button
                    onClick={() => copyDigestToClipboard(activeTriageResult.provenanceDigest)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[10px]"
                  >
                    {copiedDigest ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedDigest ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-400 break-all bg-neutral-950 p-1.5 rounded border border-neutral-800">
                  {activeTriageResult.provenanceDigest}
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>Committed to Merkle Epoch: #{activeTriageResult.merkleEpoch}</span>
                  <span className="text-emerald-400 font-semibold">0 Syscalls &bull; 0 Compute Sunk</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-lg border border-dashed border-neutral-800 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
              <ShieldCheck className="h-8 w-8 text-neutral-600 mb-2" />
              <p className="font-semibold text-neutral-400">Ready to Triage Candidate Alert</p>
              <p className="text-[11px] max-w-sm mt-1 text-neutral-500">
                Select an invariant vector from the left and click "Execute Evidence Gate Triage" to stream validated findings through the programmatic loop.
              </p>
            </div>
          )}

          {/* Recent Live SSE Stream Log */}
          {triageEvents.length > 0 && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="font-bold text-neutral-300 text-[11px] uppercase tracking-wider">
                  Live SSE Invariant Audit Log ({triageEvents.length})
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> REAL-TIME STREAM
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {triageEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        evt.verdict === 'CONFIRMED_TRUE_POSITIVE'
                          ? 'bg-red-400'
                          : evt.verdict === 'FILTERED_FALSE_POSITIVE'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`} />
                      <span className="font-semibold text-neutral-200">{evt.alertId}</span>
                      <span className="text-neutral-500">{evt.vulnerabilityType}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cyan-300">{(evt.confidenceScore * 100).toFixed(0)}%</span>
                      <span className="text-neutral-500">{evt.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
