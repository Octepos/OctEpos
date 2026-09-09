import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileCode2, 
  Code2, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sliders, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DYNAMIC_POLICY_RULES } from '../data/mockScenarios';
import { DynamicPolicyRule } from '../types/octepos';

interface DynamicPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules?: DynamicPolicyRule[];
  onUpdateRules?: (rules: DynamicPolicyRule[]) => void;
}

export const DynamicPolicyModal: React.FC<DynamicPolicyModalProps> = ({
  isOpen,
  onClose,
  rules = DYNAMIC_POLICY_RULES,
  onUpdateRules
}) => {
  const [currentRules, setCurrentRules] = useState<DynamicPolicyRule[]>(rules);
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleExpr, setNewRuleExpr] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const activeRule = currentRules.find(r => r.id === selectedRuleId) || currentRules[0];

  const handleToggleRule = (id: string) => {
    const updated = currentRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setCurrentRules(updated);
    if (onUpdateRules) onUpdateRules(updated);
  };

  const handleAddRule = () => {
    if (!newRuleName.trim() || !newRuleExpr.trim()) return;
    const created: DynamicPolicyRule = {
      id: `POL-CUSTOM-${Date.now().toString().slice(-4)}`,
      name: newRuleName.trim(),
      environment: 'GLOBAL',
      ruleExpression: newRuleExpr.trim(),
      description: 'Custom administrator-defined capability boundary evaluated by the Glass Floor pre-syscall.',
      enforcement: 'INTERCEPT_PRE_SYSCALL',
      enabled: true
    };
    const updated = [...currentRules, created];
    setCurrentRules(updated);
    if (onUpdateRules) onUpdateRules(updated);
    setNewRuleName('');
    setNewRuleExpr('');
    setSelectedRuleId(created.id);
  };

  const handleSave = () => {
    if (onUpdateRules) onUpdateRules(currentRules);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-sans animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-100">
                  Dynamic Policy Engine & Capability Bounds
                </h3>
                <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-bold">
                  CEL / CEDAR COMPLIANT
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Hybrid Architecture: Immutable Core Invariants paired with declarative, environment-specific capability boundaries.
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Architectural Synthesis Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs text-neutral-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Architectural Formalization: Hardcoded Core vs Dynamic Language</span>
            </div>
            <p className="leading-relaxed">
              OCTEPOS resolves the governance dilemma by establishing a <strong>Two-Layer Reference Monitor</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-neutral-300">
              <li>
                <strong className="text-emerald-400">The Invariant Root (Hardcoded):</strong> Zero Ambient Authority, physical memory space termination, and cryptographic SHA-256 state hashing are mathematically baked into the Minimal Enduring Core and cannot be altered by configuration.
              </li>
              <li>
                <strong className="text-cyan-400">The Dynamic Policy Service (Declarative):</strong> Administrators declare fine-grained business logic (e.g. corporate master ledger write locks, commercial API spend ceilings, domain whitelists) without recompiling the underlying kernel.
              </li>
            </ul>
          </div>

          {/* Policy Rules Manager */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rule List */}
            <div className="space-y-2 md:col-span-1 border-r border-neutral-800/80 pr-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                Active Policy Rules ({currentRules.length})
              </span>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {currentRules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`cursor-pointer rounded-lg border p-2.5 text-xs font-mono transition-colors ${
                      selectedRuleId === rule.id
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{rule.name}</span>
                      <span className={`h-2 w-2 rounded-full ${rule.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                    </div>
                    <div className="text-[10px] text-neutral-500 pt-1">
                      {rule.environment} • {rule.enforcement}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule Detail & Editor */}
            <div className="md:col-span-2 space-y-4">
              {activeRule ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-100">{activeRule.name}</h4>
                      <span className="text-[10px] text-neutral-400">Rule ID: {activeRule.id}</span>
                    </div>

                    <button
                      onClick={() => handleToggleRule(activeRule.id)}
                      className={`rounded px-2.5 py-1 text-xs font-bold uppercase transition-colors ${
                        activeRule.enabled
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                          : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {activeRule.enabled ? 'Rule Active' : 'Rule Disabled'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">
                      Policy Rule Expression (CEL / Common Expression Language)
                    </span>
                    <div className="rounded border border-neutral-800 bg-black/80 p-3 text-cyan-300 font-mono text-xs overflow-x-auto">
                      <code>{activeRule.ruleExpression}</code>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-300 font-sans leading-relaxed">
                    <strong className="font-mono text-[11px] text-neutral-400 block font-bold">Governance Purpose:</strong>
                    {activeRule.description}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-800">
                    <span>Target Scope: <strong className="text-neutral-200">{activeRule.environment}</strong></span>
                    <span>Enforcement: <strong className="text-amber-400">{activeRule.enforcement}</strong></span>
                  </div>
                </div>
              ) : null}

              {/* Add Custom Policy Expression Form */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3.5 space-y-3 font-mono text-xs">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-cyan-400" />
                  Declare Custom Policy Expression
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Rule Name (e.g. Cap Ex Max Limit)"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Expression (e.g. DENY IF spend > 100.0)"
                    value={newRuleExpr}
                    onChange={(e) => setNewRuleExpr(e.target.value)}
                    className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleAddRule}
                  disabled={!newRuleName.trim() || !newRuleExpr.trim()}
                  className="w-full rounded bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/40 py-1.5 text-xs font-bold text-cyan-200 transition-colors disabled:opacity-50"
                >
                  Compile & Register Policy Expression
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <div className="text-xs font-mono text-neutral-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Policies synchronized to Deterministic Glass Floor.
              </span>
            ) : (
              <span>Pre-syscall compilation active across all ephemeral execution contexts.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 font-mono text-xs text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 font-mono text-xs font-bold text-white transition-colors shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save & Enforce</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
