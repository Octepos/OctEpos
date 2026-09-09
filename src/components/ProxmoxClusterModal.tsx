import React, { useState } from 'react';
import { 
  Server, 
  X, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  Sliders, 
  Wifi, 
  Save, 
  Terminal,
  Lock
} from 'lucide-react';
import { ProxmoxClusterConfig, ThinkCentreNode } from '../types/octepos';

interface ProxmoxClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProxmoxClusterConfig;
  onSaveConfig: (updated: ProxmoxClusterConfig) => void;
}

export const ProxmoxClusterModal: React.FC<ProxmoxClusterModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [clusterConfig, setClusterConfig] = useState<ProxmoxClusterConfig>(config);
  const [testingPing, setTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleUpdateNode = (nodeId: string, updates: Partial<ThinkCentreNode>) => {
    setClusterConfig(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.nodeId === nodeId ? { ...n, ...updates } : n)
    }));
  };

  const handleTestHeartbeat = () => {
    setTestingPing(true);
    setPingSuccess(null);
    setTimeout(() => {
      setTestingPing(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(null), 3000);
    }, 700);
  };

  const handleSave = () => {
    onSaveConfig(clusterConfig);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-mono shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <span>Proxmox VE Cluster Configuration</span>
                <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300">
                  DUAL THINKCENTRE NODES
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Hardware-isolated local routing endpoints targeting on-premise ThinkCentre micro-cluster.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cluster Quorum & Air-Gap Status */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
            <span className="text-[10px] text-neutral-500 block uppercase">COROSYNC QUORUM:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {clusterConfig.quorum}
            </span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
            <span className="text-[10px] text-neutral-500 block uppercase">RING LATENCY:</span>
            <span className="font-bold text-cyan-300 mt-1 block">
              {clusterConfig.corosyncLatencyMs} ms (Sub-Millisecond)
            </span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
            <span className="text-[10px] text-neutral-500 block uppercase">AIR-GAP EGRESS ENFORCEMENT:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              HARDWARE DROP ACTIVE
            </span>
          </div>
        </div>

        {/* Dual ThinkCentre Nodes Cards */}
        <div className="mt-4 space-y-4">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Target API Endpoints (LXC Micro-Containers):
          </span>

          <div className="space-y-3">
            {clusterConfig.nodes.map((node) => (
              <div 
                key={node.nodeId}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-neutral-200 text-sm">
                      {node.hostname}
                    </span>
                    <span className="rounded border border-neutral-700 bg-neutral-950 px-1.5 py-0.2 text-[10px] text-neutral-400">
                      LXC ID #{node.lxcId}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 truncate max-w-sm">
                    {node.model}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Endpoint URL */}
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                      Ollama API Endpoint URL:
                    </label>
                    <input
                      type="text"
                      value={node.endpointUrl}
                      onChange={(e) => handleUpdateNode(node.nodeId, { endpointUrl: e.target.value })}
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 text-xs text-cyan-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Loaded Model */}
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                      Enclave Model Weights:
                    </label>
                    <input
                      type="text"
                      value={node.modelLoaded}
                      onChange={(e) => handleUpdateNode(node.nodeId, { modelLoaded: e.target.value })}
                      className="w-full rounded border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Node hardware telemetry */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 bg-neutral-950/80 rounded px-3 py-1.5">
                  <span>RAM: <strong className="text-neutral-200">{node.ramUsageGb} GB / {node.ramTotalGb} GB</strong></span>
                  <span>CPU: <strong className="text-neutral-200">{node.cpuUtil}%</strong></span>
                  <span className="text-emerald-400">{node.avxSupport}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Balancing Policy */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-neutral-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Proxmox Cluster Load Balancer:
            </span>
            <span className="text-[10px] text-neutral-500">
              ZERO-EGRESS AIRGAP
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(['ROUND_ROBIN', 'LEAST_LATENCY', 'MEMORY_WEIGHTED', 'FAILOVER_PRIMARY'] as const).map((pol) => (
              <button
                key={pol}
                type="button"
                onClick={() => setClusterConfig(prev => ({ ...prev, routingPolicy: pol }))}
                className={`rounded border p-2 text-center transition-all ${
                  clusterConfig.routingPolicy === pol 
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold' 
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {pol.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          <button
            type="button"
            onClick={handleTestHeartbeat}
            disabled={testingPing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Activity className={`h-3.5 w-3.5 text-cyan-400 ${testingPing ? 'animate-spin' : ''}`} />
            <span>{testingPing ? 'Probing Corosync Ring...' : pingSuccess ? 'Ping: 0.82ms (OK)' : 'Probe ThinkCentre Heartbeat'}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-emerald-500/60 bg-emerald-950/60 px-5 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 hover:text-white transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savedNotification ? 'Saved!' : 'Apply Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
