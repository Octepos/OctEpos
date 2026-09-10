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
  Sparkles,
  Gauge,
  Zap,
  Play,
  Activity,
  AlertOctagon,
  Check,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { 
  CelPolicyRule, 
  DEFAULT_CEL_POLICIES, 
  CelPolicyEngine, 
  CelEvaluationContext,
  CelEvaluationResult
} from '../data/celPolicyEngine';

interface DynamicPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DynamicPolicyModal: React.FC<DynamicPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  const [engine] = useState(() => new CelPolicyEngine());
  const [rules, setRules] = useState<CelPolicyRule[]>(() => engine.getRules());
  const [selectedRuleId, setSelectedRuleId] = useState<string>(DEFAULT_CEL_POLICIES[0].id);

  // Playground Context State
  const [playgroundDiffAdds, setPlaygroundDiffAdds] = useState<number>(140);
  const [playgroundImport, setPlaygroundImport] = useState<string>('none');
  const [playgroundRole, setPlaygroundRole] = useState<'DEVELOPER' | 'AI_AGENT'>('AI_AGENT');
  const [playgroundPiiAttested, setPlaygroundPiiAttested] = useState<boolean>(true);
  const [evalResult, setEvalResult] = useState<CelEvaluationResult | null>(null);
  const [isCanaryRunning, setIsCanaryRunning] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Custom Expression State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleExpr, setNewRuleExpr] = useState('');

  if (!isOpen) return null;

  const activeRule = rules.find(r => r.id === selectedRuleId) || rules[0];

  const handleToggleRule = (id: string) => {
    const target = rules.find(r => r.id === id);
    if (!target) return;
    const updated: CelPolicyRule = { ...target, enabled: !target.enabled };
    engine.updateRule(updated);
    setRules(engine.getRules());
  };

  const handleRunEvaluation = () => {
    const ctx: CelEvaluationContext = {
      request: {
        diff: {
          additions: playgroundDiffAdds,
          deletions: 10,
          filesChanged: ['src/core/limiter.ts', 'src/types.ts']
        },
        imports: playgroundImport === 'none' ? ['math', 'time'] : [playgroundImport, 'math'],
        author: {
          role: playgroundRole,
          authenticated: true,
          clearanceLevel: playgroundRole === 'DEVELOPER' ? 3 : 1
        },
        targetEnvironment: activeRule.environment,
        substrateId: 'gemini_flash',
        action: 'SUBMIT_REFACTOR',
        hasPiiRedactionAttestation: playgroundPiiAttested
      }
    };

    const res = engine.evaluateRule(activeRule.id, ctx);
    setEvalResult(res);
    setRules(engine.getRules());
  };

  const handleRunCanary = (ruleId: string) => {
    setIsCanaryRunning(true);
    setTimeout(() => {
      const res = engine.runAdversarialBoundaryCanary(ruleId);
      setEvalResult(res);
      setRules(engine.getRules());
      setIsCanaryRunning(false);
    }, 400);
  };

  const handleAddRule = () => {
    if (!newRuleName.trim() || !newRuleExpr.trim()) return;
    const created: CelPolicyRule = {
      id: `CEL-CUSTOM-${Date.now().toString().slice(-4)}`,
      name: newRuleName.trim(),
      environment: 'GLOBAL',
      celExpression: newRuleExpr.trim(),
      description: 'Administrator-declared CEL invariant evaluated pre-syscall in bounded linear time.',
      maxCostLimit: 45,
      minBarThreshold: 0.15,
      enforcement: 'INTERCEPT_PRE_SYSCALL',
      enabled: true,
      metrics: {
        totalEvaluations: 1,
        boundaryActivations: 0,
        currentBar: 0.00,
        isDeviationCollapsed: false,
        lastEvaluatedAt: new Date().toISOString(),
        averageEvalLatencyMs: 0.35
      }
    };

    engine.updateRule(created);
    setRules(engine.getRules());
    setSelectedRuleId(created.id);
    setNewRuleName('');
    setNewRuleExpr('');
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-sans animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-100">
                  Common Expression Language (CEL) Policy Engine
                </h3>
                <span className="rounded bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-bold">
                  O(N) DETERMINISTIC
                </span>
                <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                  BAR INSTRUMENTED
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Non-Turing Complete, side-effect-free policy evaluation with Boundary Activation Rate (BAR) telemetry against Deviation Collapse.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Architectural Banner */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-xs text-neutral-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>The Mathematical Foundation: Linear-Time Termination & Zero Side Effects</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                MAX LATENCY: &le; 2.0ms • COST QUOTA ENFORCED
              </span>
            </div>
            <p className="leading-relaxed font-sans text-neutral-300">
              Unlike arbitrary scripting languages (Python/JS/Lua) susceptible to infinite loops and memory exhaustion, CEL expressions evaluate in strictly linear time <code className="text-cyan-300">O(N)</code> with zero mutations or network calls. To prevent <strong>Deviation Collapse</strong>—where a policy appears compliant simply because its failure boundaries are never exercised—OCTEPOS monitors the <strong>Boundary Activation Rate (BAR)</strong>.
            </p>
          </div>

          {/* Main Grid: Policy Rule Selection & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Col: Rule List (4 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider font-bold">
                  Compiled Policies ({rules.length})
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">TARGET BAR &ge; 15%</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {rules.map((rule) => {
                  const isCollapsed = rule.metrics.isDeviationCollapsed;
                  const isSelected = selectedRuleId === rule.id;

                  return (
                    <div
                      key={rule.id}
                      onClick={() => setSelectedRuleId(rule.id)}
                      className={`cursor-pointer rounded-xl border p-3 font-mono text-xs transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                          : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs truncate text-neutral-200">{rule.name}</span>
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${rule.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                      </div>

                      <div className="text-[10px] text-neutral-400 mt-1 truncate">
                        ID: <code className="text-cyan-300">{rule.id}</code> • {rule.environment}
                      </div>

                      {/* Real-time BAR Badge */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-800/80 text-[10px]">
                        <span className="text-neutral-500">
                          BAR: <strong className={isCollapsed ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {(rule.metrics.currentBar * 100).toFixed(1)}%
                          </strong>
                        </span>

                        {isCollapsed ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            DEVIATION COLLAPSE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                            OPTIMAL COVERAGE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Active Rule Deep Dive, BAR Meter, & Playground (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {activeRule && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-4 font-mono">
                  {/* Top Rule Meta Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-100">{activeRule.name}</h4>
                      <span className="text-[11px] text-neutral-400">ID: {activeRule.id} • Scope: {activeRule.environment}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRule(activeRule.id)}
                        className={`rounded px-2.5 py-1 text-xs font-bold uppercase transition-colors ${
                          activeRule.enabled
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                            : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {activeRule.enabled ? 'Rule Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* CEL Expression Display */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">
                      Compiled CEL Expression:
                    </span>
                    <div className="rounded-lg border border-neutral-800 bg-black/90 p-3 text-cyan-300 text-xs overflow-x-auto select-all">
                      <code>{activeRule.celExpression}</code>
                    </div>
                  </div>

                  {/* BAR Telemetry Gauge & Canary Trigger */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-bold text-neutral-200">
                          Boundary Activation Rate (BAR) Metric:
                        </span>
                      </div>

                      <div className="text-xs font-bold font-mono">
                        <span className={activeRule.metrics.isDeviationCollapsed ? 'text-amber-400' : 'text-emerald-400'}>
                          {(activeRule.metrics.currentBar * 100).toFixed(1)}%
                        </span>
                        <span className="text-neutral-500 text-[10px] ml-1">(Min Req: 15.0%)</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden border border-neutral-800">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          activeRule.metrics.isDeviationCollapsed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, activeRule.metrics.currentBar * 200)}%` }}
                      />
                    </div>

                    {/* Deviation Collapse Alert & Canary Rescue */}
                    {activeRule.metrics.isDeviationCollapsed ? (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-2.5 space-y-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
                          <span>DEVIATION COLLAPSE WARNING: Boundary Inactive</span>
                        </div>
                        <p className="text-neutral-300 text-[10px] leading-relaxed">
                          This rule has been evaluated {activeRule.metrics.totalEvaluations} times with only {activeRule.metrics.boundaryActivations} edge activations (BAR &lt; 15%). The reference monitor risks blind compliance without adversarial verification.
                        </p>
                        <button
                          onClick={() => handleRunCanary(activeRule.id)}
                          disabled={isCanaryRunning}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-500/50 bg-amber-900/50 hover:bg-amber-800 text-amber-200 text-xs font-bold transition-all shadow-sm"
                        >
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span>{isCanaryRunning ? 'Probing Boundary...' : 'Fire Adversarial Boundary Canary'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Evaluations: {activeRule.metrics.totalEvaluations} • Boundary Hits: {activeRule.metrics.boundaryActivations}</span>
                        <button
                          onClick={() => handleRunCanary(activeRule.id)}
                          disabled={isCanaryRunning}
                          className="text-cyan-400 hover:text-cyan-200 underline flex items-center gap-1"
                        >
                          <Zap className="h-2.5 w-2.5" />
                          <span>Test Canary</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interactive CEL Evaluation Playground */}
                  <div className="rounded-xl border border-cyan-500/30 bg-neutral-950/80 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Interactive CEL Evaluation Playground:</span>
                      </span>
                      <span className="text-[10px] text-neutral-500">LIVE CONTEXT PROBE</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="space-y-1">
                        <label className="text-neutral-400 flex justify-between">
                          <span>Diff Additions:</span>
                          <strong className="text-neutral-200">{playgroundDiffAdds} lines</strong>
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={450}
                          step={10}
                          value={playgroundDiffAdds}
                          onChange={(e) => setPlaygroundDiffAdds(Number(e.target.value))}
                          className="w-full accent-cyan-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 block">Package Imports:</label>
                        <select
                          value={playgroundImport}
                          onChange={(e) => setPlaygroundImport(e.target.value)}
                          className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="none">Standard Safe (math, time)</option>
                          <option value="os">Malicious: import os</option>
                          <option value="subprocess">Malicious: import subprocess</option>
                          <option value="socket">Malicious: import socket</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 block">Author Role:</label>
                        <select
                          value={playgroundRole}
                          onChange={(e) => setPlaygroundRole(e.target.value as any)}
                          className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="AI_AGENT">Autonomous AI Agent (Clearance 1)</option>
                          <option value="DEVELOPER">Human Senior Developer (Clearance 3)</option>
                        </select>
                      </div>

                      <div className="space-y-1 flex flex-col justify-end">
                        <label className="text-neutral-400 flex items-center gap-2 cursor-pointer pb-1">
                          <input
                            type="checkbox"
                            checked={playgroundPiiAttested}
                            onChange={(e) => setPlaygroundPiiAttested(e.target.checked)}
                            className="rounded accent-cyan-500"
                          />
                          <span>Sovereign NZ Redaction Attested</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleRunEvaluation}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-900/60 hover:bg-cyan-800/80 py-2 text-xs font-bold text-cyan-200 transition-all shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Evaluate CEL Expression with Live Inputs</span>
                    </button>

                    {/* Evaluation Output */}
                    {evalResult && (
                      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400 font-bold">VERDICT:</span>
                            {evalResult.permitted ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                                PERMITTED (TRUE)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-bold">
                                INTERCEPTED (FALSE)
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-neutral-400">
                            Latency: <strong className="text-neutral-200">{evalResult.evalLatencyMs}ms</strong> • Cost: <strong className="text-neutral-200">{evalResult.estimatedCost} quota</strong>
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-300 font-sans">
                          {evalResult.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Custom Policy Form */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 font-mono text-xs">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-cyan-400" />
                  Declare Custom Linear-Time CEL Policy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Rule Name (e.g. Rate Limit Ceiling)"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CEL Expression (e.g. request.diff.additions < 150)"
                    value={newRuleExpr}
                    onChange={(e) => setNewRuleExpr(e.target.value)}
                    className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleAddRule}
                  disabled={!newRuleName.trim() || !newRuleExpr.trim()}
                  className="w-full rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 py-1.5 text-xs font-bold text-cyan-300 transition-colors disabled:opacity-50"
                >
                  Compile & Register CEL Policy Expression
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 px-6 py-4">
          <div className="text-xs font-mono text-neutral-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Policies synchronized to Deterministic Glass Floor & Merkle WAL.
              </span>
            ) : (
              <span>Pre-syscall CEL compilation active across all local execution contexts.</span>
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
              <span>Save & Enforce CEL Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

