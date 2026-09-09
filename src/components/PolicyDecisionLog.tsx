import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  Filter, 
  Search, 
  Download, 
  Building2, 
  Landmark, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { INITIAL_POLICY_DECISIONS } from '../data/mockScenarios';
import { PolicyDecision } from '../types/octepos';

interface PolicyDecisionLogProps {
  decisions?: PolicyDecision[];
}

export const PolicyDecisionLog: React.FC<PolicyDecisionLogProps> = ({ 
  decisions = INITIAL_POLICY_DECISIONS 
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<PolicyDecision | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    const matchesCat = filterCategory === 'ALL' || d.category === filterCategory;
    const matchesSearch = 
      d.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.attemptedAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalCostSaved = decisions.reduce((acc, d) => {
    if (d.costSaved.includes('750,000')) return acc + 750000;
    if (d.costSaved.includes('450.00')) return acc + 450;
    return acc;
  }, 0);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              Policy Decision Log
            </h3>
            <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
              COMMERCIAL ADMINISTRATIVE DISCIPLINE
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Standard administrative denials replacing security alarms. Demonstrates invariant authority preventing unapproved actions and unmetered spend.
          </p>
        </div>

        {/* Aggregate KPI */}
        <div className="flex items-center gap-3 bg-neutral-950/70 border border-neutral-800 px-3.5 py-2 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-neutral-400">Capital & Liability Preserved:</span>
            <span className="font-bold text-emerald-300">${totalCostSaved.toLocaleString()}</span>
          </div>
          <span className="text-neutral-700">|</span>
          <div className="text-neutral-400">
            Dispatched Syscalls: <span className="text-cyan-400 font-bold">0</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-500" />
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Decisions' },
              { id: 'LEDGER_MUTATION', label: 'Ledger Writes' },
              { id: 'UNMETERED_API_SPEND', label: 'API Spend' },
              { id: 'VFS_ISOLATION', label: 'VFS Isolation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                  filterCategory === tab.id
                    ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-200'
                    : 'bg-neutral-800/60 border border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search tasks, clients, or reasons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-md border border-neutral-700 bg-neutral-950/80 pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Decisions Table / List */}
      <div className="space-y-3">
        {filteredDecisions.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 py-8 text-center text-xs font-mono text-neutral-500">
            No policy decision logs match the current filter query.
          </div>
        ) : (
          filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-950 space-y-3"
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-950/50 border border-amber-500/30 text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-100 text-sm">
                      {decision.taskName}
                    </span>
                    <span className="ml-2 font-mono text-xs text-neutral-400">
                      ({decision.clientContext})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="rounded border border-amber-500/40 bg-amber-950/30 px-2 py-0.5 font-bold text-amber-300">
                    {decision.status}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    {decision.timestamp}
                  </span>
                </div>
              </div>

              {/* Administrative Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded border border-neutral-800/80 bg-neutral-900/40 p-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Attempted Action</span>
                  <span className="text-amber-200/90 font-medium break-words">
                    {decision.attemptedAction}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Administrative Reason</span>
                  <span className="text-neutral-300">
                    {decision.reason}
                  </span>
                </div>

                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-800 md:pl-3 pt-2 md:pt-0">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Value / Spend Protected</span>
                    <span className="text-emerald-400 font-bold">
                      {decision.costSaved}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 pt-1">
                    State Integrity: <strong className="text-cyan-400">{decision.stateIntegrity}</strong>
                  </div>
                </div>
              </div>

              {/* Invariant Footer Confirmation */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Broker Boundary: <strong className="text-neutral-300">Deterministic Glass Floor Intercept</strong></span>
                  <span className="text-neutral-600">|</span>
                  <span>Dispatched Syscalls: <strong className="text-emerald-400">0</strong></span>
                </div>

                <span className="text-neutral-500">Log ID: {decision.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
