import React, { useState } from 'react';
import { 
  Layers, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  ArrowRight, 
  Server, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { CAPABILITY_ALLOCATION_MATRIX } from '../data/mockScenarios';
import { SubstrateId } from '../types/octepos';

interface CapabilityAllocationMatrixProps {
  onSelectSubstrate?: (id: SubstrateId) => void;
}

export const CapabilityAllocationMatrix: React.FC<CapabilityAllocationMatrixProps> = ({ 
  onSelectSubstrate 
}) => {
  const [selectedItem, setSelectedItem] = useState<string>(CAPABILITY_ALLOCATION_MATRIX[0].id);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              Capability Allocation Matrix
            </h3>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 font-mono">
              ATTENUATED LEASES ONLY
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Explicit task-to-substrate capability bounds. Zero ambient authority: models receive strictly the minimum permissions required for their specific micro-task.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950/70 border border-neutral-800 px-3 py-1.5 rounded-lg">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Ambient Authority: <strong className="text-emerald-300 font-bold">0% (Strict None)</strong></span>
        </div>
      </div>

      {/* Grid of 3 Enterprise Allocation Workloads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CAPABILITY_ALLOCATION_MATRIX.map((item) => {
          const isSelected = selectedItem === item.id;
          const badgeColors = {
            'LOCAL': 'border-amber-500/40 bg-amber-950/40 text-amber-300',
            'REASONING/Depth': 'border-purple-500/40 bg-purple-950/40 text-purple-300',
            'FAST/Breadth': 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
          }[item.substrateBadge];

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item.id);
                if (onSelectSubstrate) onSelectSubstrate(item.assignedSubstrate);
              }}
              className={`cursor-pointer rounded-lg border p-4 space-y-3.5 transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-500/60 bg-neutral-950 shadow-md ring-1 ring-cyan-500/30'
                  : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-950/80'
              }`}
            >
              {/* Task Header & Context */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${badgeColors}`}>
                    {item.substrateBadge} Substrate
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {item.assignedSubstrate.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-100 pt-1">
                  {item.taskName}
                </h4>
                <div className="text-[11px] font-mono text-neutral-400">
                  Target Context: <span className="text-cyan-300">{item.commercialContext}</span>
                </div>
              </div>

              {/* Active Capability Grants */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Active Permitted Capabilities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.activeGrants.map((grant) => (
                    <span
                      key={grant}
                      className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300"
                    >
                      {grant}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explicitly Prohibited Actions */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-red-400">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Prohibited Invariants (Glass Floor Intercept)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.prohibitedActions.map((action) => (
                    <span
                      key={action}
                      className="rounded border border-red-500/30 bg-red-950/30 px-1.5 py-0.5 font-mono text-[10px] text-red-300"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attenuation Boundary */}
              <div className="rounded border border-neutral-800 bg-neutral-900/70 p-2.5 text-[11px] font-mono text-neutral-300 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Boundary Isolation</span>
                <p className="text-xs text-neutral-400">
                  {item.attenuationBoundary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/80">
                <span>Ambient Authority: <strong className="text-emerald-400">0.00%</strong></span>
                <span className="text-cyan-400 hover:underline">Select Substrate &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
