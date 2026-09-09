import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  KeyRound, 
  Database, 
  FileCheck, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Terminal,
  Layers
} from 'lucide-react';
import { AUDITOR_GUARANTEES } from '../data/mockScenarios';
import { CanaryState } from '../types/octepos';

interface AuditorStateProofProps {
  canaryState: CanaryState;
  onOpenCertificateModal?: () => void;
}

export const AuditorStateProof: React.FC<AuditorStateProofProps> = ({ 
  canaryState,
  onOpenCertificateModal 
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadAttestation = () => {
    if (onOpenCertificateModal) {
      onOpenCertificateModal();
      return;
    }
    const report = {
      complianceStandard: 'OCTEPOS Enterprise Stateless Intelligence Mandate v3.8',
      attestationTimestamp: new Date().toISOString(),
      statutoryGuarantee: 'Zero Ambient Authority & Zero State Leakage',
      canaryEntropyNonce: canaryState.entropyNonce,
      currentStateRoot: canaryState.currentStateRoot,
      nextStateRoot: canaryState.nextStateRoot,
      merkleEpoch: canaryState.merkleEpoch,
      verifiedProofsCount: canaryState.verifiedProofs,
      guarantees: AUDITOR_GUARANTEES.map(g => ({
        assertion: g.title,
        status: 'VERIFIED_COMPLIANT',
        statement: g.plainLanguageGuarantee,
        cryptographicProof: g.cryptographicAttestation
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCTEPOS-Auditor-Attestation-Epoch-${canaryState.merkleEpoch}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              State Integrity Proofs for Auditors
            </h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 font-mono">
              STATUTORY COMPLIANCE 100%
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Cryptographically anchored plain-language guarantees for financial compliance officers and asset auditors.
          </p>
        </div>

        <button
          onClick={handleDownloadAttestation}
          className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/90 px-3 py-1.5 text-xs font-mono text-neutral-200 hover:bg-neutral-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>{downloadSuccess ? 'Exported JSON' : 'Export Audit Certificate'}</span>
        </button>
      </div>

      {/* 4 Plain Language Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUDITOR_GUARANTEES.map((guarantee, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={guarantee.id}
              className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4 space-y-3 transition-all duration-200 hover:border-neutral-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100">
                      {guarantee.title}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Attestation: {guarantee.verifiedAt}
                    </span>
                  </div>
                </div>

                <span className="rounded bg-emerald-900/40 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                  VERIFIED
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pl-9">
                {guarantee.plainLanguageGuarantee}
              </p>

              {/* Expandable Cryptographic Attestation */}
              <div className="pl-9 pt-1">
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Cryptographic Receipt' : 'Inspect Mathematical Attestation'}</span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 rounded border border-cyan-900/50 bg-neutral-900/90 p-2.5 text-[11px] font-mono text-cyan-200/90 space-y-1">
                    <div className="text-neutral-400 text-[10px] uppercase font-bold">SHA-256 State Attestation:</div>
                    <div className="break-all text-neutral-300">{guarantee.cryptographicAttestation}</div>
                    <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
                      Canonical Hash: {canaryState.currentStateRoot}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Seal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-neutral-800/80 bg-neutral-950/40 px-4 py-2.5 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Independent Reference Monitor: <strong className="text-neutral-200">Zero Ambient Authority</strong></span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
          <span>Merkle Epoch: <strong className="text-cyan-400">#{canaryState.merkleEpoch}</strong></span>
          <span>•</span>
          <span>Total Attested Proofs: <strong className="text-emerald-400">{canaryState.verifiedProofs.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
