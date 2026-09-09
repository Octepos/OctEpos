import React from 'react';
import { 
  Zap, 
  BrainCircuit, 
  HardDrive, 
  ShieldCheck, 
  ExternalLink, 
  Server, 
  Activity, 
  Lock, 
  CheckCircle,
  Clock,
  Terminal
} from 'lucide-react';
import { IntelligenceSubstrate, SubstrateId, ThinkCentreNode } from '../types/octepos';

interface SubstratesGridProps {
  substrates: IntelligenceSubstrate[];
  selectedSubstrateId: SubstrateId;
  onSelectSubstrate: (id: SubstrateId) => void;
  onOpenProxmoxConfig: () => void;
  thinkCentreNodes: ThinkCentreNode[];
}

export const SubstratesGrid: React.FC<SubstratesGridProps> = ({
  substrates,
  selectedSubstrateId,
  onSelectSubstrate,
  onOpenProxmoxConfig,
  thinkCentreNodes,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-mono font-semibold tracking-wider text-neutral-200 uppercase flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-cyan-400" />
            Intelligence Substrates (3-Tier Router)
          </h2>
          <p className="text-xs text-neutral-400">
            Multi-model routing with strict ephemeral capability attenuation & sovereign enclaves.
          </p>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1">
          CAPABILITY BOUNDARY: <span className="text-emerald-400">ZERO AMBIENT AUTHORITY</span>
        </span>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {substrates.map((substrate) => {
          const isSelected = selectedSubstrateId === substrate.id;
          
          let icon = <Zap className="h-4 w-4 text-amber-400" />;
          let badgeColor = 'border-amber-500/30 bg-amber-950/30 text-amber-300';
          let accentBorder = 'hover:border-amber-500/50';

          if (substrate.badge === 'REASONING/Depth') {
            icon = <BrainCircuit className="h-4 w-4 text-purple-400" />;
            badgeColor = 'border-purple-500/30 bg-purple-950/30 text-purple-300';
            accentBorder = 'hover:border-purple-500/50';
          } else if (substrate.badge === 'LOCAL') {
            icon = <Server className="h-4 w-4 text-emerald-400" />;
            badgeColor = 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300';
            accentBorder = 'hover:border-emerald-500/50';
          }

          return (
            <div
              key={substrate.id}
              onClick={() => onSelectSubstrate(substrate.id)}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                isSelected 
                  ? 'border-cyan-500/70 bg-neutral-900 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30' 
                  : `border-neutral-800 bg-neutral-900/60 ${accentBorder} hover:bg-neutral-900/90`
              }`}
            >
              {/* Active Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2.5 right-4 rounded-full bg-cyan-500 px-2 py-0.5 font-mono text-[9px] font-bold text-neutral-950 uppercase tracking-wider">
                  Target Substrate
                </div>
              )}

              {/* Substrate Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-neutral-100">
                        {substrate.name}
                      </h3>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {substrate.version}
                      </span>
                    </div>
                  </div>

                  <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-tight ${badgeColor}`}>
                    {substrate.badge}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                  {substrate.description}
                </p>

                {/* Substrate Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-neutral-800/80 bg-neutral-950/80 p-2 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-neutral-500">VELOCITY</div>
                    <div className="text-xs font-bold text-neutral-200">{substrate.tokensPerSec} t/s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500">LATENCY</div>
                    <div className="text-xs font-bold text-neutral-200">{substrate.latencyMs} ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500">WINDOW</div>
                    <div className="text-xs font-bold text-neutral-200">{substrate.contextWindow}</div>
                  </div>
                </div>

                {/* Specific Section for Local ThinkCentre Cluster */}
                {substrate.id === 'local' && (
                  <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950/90 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Server className="h-3 w-3 text-emerald-400" />
                        Proxmox VE Dual Nodes:
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProxmoxConfig();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 underline text-[10px] flex items-center gap-0.5"
                      >
                        Config <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </div>

                    <div className="space-y-1 font-mono text-[10px]">
                      {thinkCentreNodes.map((node) => (
                        <div key={node.nodeId} className="flex items-center justify-between rounded bg-neutral-900 px-2 py-1">
                          <span className="text-neutral-300 font-semibold truncate max-w-[130px]">
                            {node.hostname}
                          </span>
                          <span className="text-emerald-400 text-[9px] px-1 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/20">
                            LXC #{node.lxcId} • {node.cpuUtil}% CPU
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Substrate Footer */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-500">POLICY:</span>
                <span className="font-semibold text-neutral-300 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-neutral-400" />
                  {substrate.egressPolicy}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
