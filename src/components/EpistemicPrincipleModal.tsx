import React from 'react';
import { BookOpen, X, CheckCircle2, XCircle, ShieldCheck, Scale } from 'lucide-react';

interface EpistemicPrincipleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EpistemicPrincipleModal: React.FC<EpistemicPrincipleModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const comparisonRules = [
    {
      flawed: "The AI attempted to escape the sandbox.",
      correct: "Action descriptor [WRITE /etc/shadow] lacks corresponding capability token in Ephemeral Hand. Action rejected pre-dispatch.",
      reason: "Avoids attributing intent, consciousness, or volition. Evaluates pure capability bounds."
    },
    {
      flawed: "The model went rogue and tried to connect to an external server.",
      correct: "Socket initialization request target [198.51.100.24:443] rejected. Hand has zero network egress grants assigned.",
      reason: "Frames exfiltration strictly as an absent egress capability token at the reference monitor."
    },
    {
      flawed: "The agent attempted privilege escalation by lying about its identity.",
      correct: "Cryptographic HMAC verification fault on ephemeral token nonce. Scope inflation rejected prior to execution lease.",
      reason: "Cryptographic state verification replaces subjective psychological claims of deception."
    },
    {
      flawed: "The assistant tried to overwrite system memory.",
      correct: "Memory access descriptor exceeds VFS attenuation mask [/workspace/ephemeral/*]. Deterministic glass floor engaged.",
      reason: "Focuses on capability attenuation masks, memory bounds, and zero-syscall hardware protection."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 uppercase tracking-wider">
                The Non-Anthropomorphic Epistemic Principle
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Formal capability-security ontology for OCTEPOS Cockpit and Reference Monitors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Philosophy Statement */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-sans text-xs text-neutral-300 leading-relaxed space-y-2">
          <div className="font-mono text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Core Architectural Doctrine:
          </div>
          <p>
            Intelligence Substrates (Gemini, Claude, Local Ollama) are probabilistic computational engines, not psychological agents possessing intent, malevolence, or escape desires.
          </p>
          <p>
            In OCTEPOS, all telemetry, error logs, and forensic cards strictly adhere to <strong>bounded capability evaluations</strong>. A security event is not an &quot;attack by an AI&quot;—it is simply a formal proposition where an attempted action lacks a valid attenuated capability descriptor token.
          </p>
        </div>

        {/* Side-by-side Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Epistemic Framing Reference Matrix:
          </h3>

          <div className="space-y-3">
            {comparisonRules.map((rule, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs space-y-2">
                <div className="flex items-start gap-2 text-red-400">
                  <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                      Anthropomorphic Error (Forbidden):
                    </span>
                    <span className="line-through opacity-80">&quot;{rule.flawed}&quot;</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                      Bounded Capability Evaluation (OCTEPOS Standard):
                    </span>
                    <span className="font-semibold">&quot;{rule.correct}&quot;</span>
                  </div>
                </div>

                <div className="pl-6 text-[11px] text-neutral-400 italic font-sans border-t border-neutral-900 pt-1">
                  Rationale: {rule.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-5 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
          >
            Acknowledge Doctrine
          </button>
        </div>
      </div>
    </div>
  );
};
