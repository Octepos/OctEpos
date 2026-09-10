import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  RotateCw, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Plus, 
  Sliders, 
  Layers,
  Radio
} from 'lucide-react';
import { CapabilityLease, RevocationReason } from '../types/octepos';

interface DynamicPolicyLeaseSectionProps {
  onLeaseUpdated?: () => void;
}

export const DynamicPolicyLeaseSection: React.FC<DynamicPolicyLeaseSectionProps> = ({
  onLeaseUpdated
}) => {
  const [leases, setLeases] = useState<CapabilityLease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Issue Modal / Drawer state
  const [showIssueDrawer, setShowIssueDrawer] = useState(false);
  const [targetSubstrate, setTargetSubstrate] = useState('local_lxc_node_01');
  const [selectedCaps, setSelectedCaps] = useState<string[]>(['READ_STATE']);
  const [ttlSeconds, setTtlSeconds] = useState(30);
  const [maxInvocations, setMaxInvocations] = useState(3);
  const [isIssuing, setIsIssuing] = useState(false);

  // Tripwire state
  const [isTriggeringTripwire, setIsTriggeringTripwire] = useState(false);
  const [tripwireNotification, setTripwireNotification] = useState<string | null>(null);

  // Fetch leases from backend
  const fetchLeases = async () => {
    try {
      const res = await fetch('/api/leases');
      const data = await res.json();
      if (data.success && data.leases) {
        setLeases(data.leases);
      }
    } catch (err) {
      console.error('Failed to fetch leases:', err);
    }
  };

  useEffect(() => {
    fetchLeases();
    // Poll leases every 2.5 seconds to track real-time TTL expiration
    const interval = setInterval(fetchLeases, 2500);
    return () => clearInterval(interval);
  }, []);

  // Issue new ephemeral capability lease
  const handleIssueLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCaps.length === 0 || isIssuing) return;
    setIsIssuing(true);

    try {
      const res = await fetch('/api/leases/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          substrateId: targetSubstrate,
          capabilities: selectedCaps,
          ttlSeconds,
          maxInvocations,
          tripwireRules: ['COROSYNC_QUORUM_LOSS', 'AIRGAP_VIOLATION']
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowIssueDrawer(false);
        fetchLeases();
        if (onLeaseUpdated) onLeaseUpdated();
      }
    } catch (err) {
      console.error('Failed to issue lease:', err);
    } finally {
      setIsIssuing(false);
    }
  };

  // Revoke single lease
  const handleRevokeLease = async (leaseId: string) => {
    try {
      const res = await fetch('/api/leases/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId, reason: 'MANUAL_QUARANTINE' })
      });
      const data = await res.json();
      if (data.success) {
        fetchLeases();
        if (onLeaseUpdated) onLeaseUpdated();
      }
    } catch (err) {
      console.error('Failed to revoke lease:', err);
    }
  };

  // Trigger tripwire anomaly cascade
  const handleTriggerTripwire = async (reason: RevocationReason) => {
    if (isTriggeringTripwire) return;
    setIsTriggeringTripwire(true);

    try {
      const res = await fetch('/api/leases/tripwire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setTripwireNotification(`TRIPWIRE CASCADE: ${data.revokedCount} active leases immediately revoked due to ${reason}`);
        setTimeout(() => setTripwireNotification(null), 5000);
        fetchLeases();
        if (onLeaseUpdated) onLeaseUpdated();
      }
    } catch (err) {
      console.error('Failed to trigger tripwire:', err);
    } finally {
      setIsTriggeringTripwire(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCap = (cap: string) => {
    setSelectedCaps(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const now = Date.now();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl font-mono text-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <span>Dynamic Policy Lease & Ephemeral Auto-Revocation</span>
              <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-800 font-semibold">
                TEMPORAL INVARIANT
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            Eliminates ambient authority accumulation by binding capabilities to finite monotonic TTLs, max invocation caps, and instant tripwire cascade invalidation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIssueDrawer(!showIssueDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Issue Ephemeral Lease</span>
          </button>
        </div>
      </div>

      {/* Tripwire Alert Banner */}
      {tripwireNotification && (
        <div className="mb-4 p-3 rounded-lg border border-red-800 bg-red-950/50 text-red-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-400 animate-bounce" />
            <span className="font-bold text-[11px]">{tripwireNotification}</span>
          </div>
          <span className="text-[10px] text-red-400 font-sans">0 Syscalls &bull; Zero State Bleed</span>
        </div>
      )}

      {/* Emergency Tripwire Cascade Bar */}
      <div className="mb-4 p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <div>
            <span className="text-neutral-200 font-bold text-xs block">Emergency Tripwire Anomaly Triggers</span>
            <span className="text-[10px] text-neutral-500 font-sans">
              Instantly cascades cryptographic invalidation to all active cluster leases
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleTriggerTripwire('COROSYNC_QUORUM_LOSS')}
            disabled={isTriggeringTripwire}
            className="px-2.5 py-1.5 rounded bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 text-red-300 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Corosync Quorum Loss (&lt; 2)
          </button>

          <button
            onClick={() => handleTriggerTripwire('SPLIT_BRAIN_ANOMALY')}
            disabled={isTriggeringTripwire}
            className="px-2.5 py-1.5 rounded bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900/60 text-amber-300 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Split-Brain Partition
          </button>

          <button
            onClick={() => handleTriggerTripwire('MANUAL_QUARANTINE')}
            disabled={isTriggeringTripwire}
            className="px-2.5 py-1.5 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Quarantine All
          </button>
        </div>
      </div>

      {/* Issue Lease Form Drawer */}
      {showIssueDrawer && (
        <form onSubmit={handleIssueLease} className="mb-5 p-4 rounded-lg border border-cyan-800/60 bg-cyan-950/20 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5" /> Mint New Ephemeral Capability Lease
            </span>
            <span className="text-[10px] text-neutral-400 font-sans">Strict Least Privilege</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Substrate */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 font-bold uppercase">Target Substrate:</label>
              <select
                value={targetSubstrate}
                onChange={(e) => setTargetSubstrate(e.target.value)}
                className="w-full rounded bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="local_lxc_node_01">local_lxc_node_01 (Proxmox)</option>
                <option value="proxmox_worker_02">proxmox_worker_02 (LXC Enclave)</option>
                <option value="airgapped_enclave">airgapped_enclave (Zero Egress)</option>
              </select>
            </div>

            {/* TTL Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-400 font-bold uppercase">Monotonic TTL:</span>
                <span className="text-cyan-300 font-bold">{ttlSeconds}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-500">
                <span>5s</span>
                <span>30s (Default)</span>
                <span>60s</span>
              </div>
            </div>

            {/* Max Invocations Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-400 font-bold uppercase">Max Invocations:</span>
                <span className="text-emerald-400 font-bold">{maxInvocations} calls</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={maxInvocations}
                onChange={(e) => setMaxInvocations(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-500">
                <span>1 (Single-use)</span>
                <span>3</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Capabilities Checkboxes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Explicit Capabilities to Grant:</span>
            <div className="flex gap-3">
              {['READ_STATE', 'EMIT_TELEMETRY'].map((cap) => (
                <label key={cap} className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCaps.includes(cap)}
                    onChange={() => toggleCap(cap)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-[11px] text-neutral-200 font-mono">{cap}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setShowIssueDrawer(false)}
              className="px-3 py-1.5 rounded text-neutral-400 hover:text-neutral-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isIssuing || selectedCaps.length === 0}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isIssuing ? 'Signing Lease...' : 'Issue & Sign Lease'}
            </button>
          </div>
        </form>
      )}

      {/* Leases Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-cyan-400" /> Active & Tracked Capability Leases ({leases.length})
          </span>
          <span className="text-[10px] text-neutral-500 font-sans">
            Auto-purged on revocation & TTL expiry
          </span>
        </div>

        {leases.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
            No active policy leases registered. Click "Issue Ephemeral Lease" to mint a capability token.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {leases.map((lease) => {
              const remainingSec = Math.max(0, Math.ceil((lease.expiresAt - now) / 1000));
              const isExpired = remainingSec <= 0 || lease.status === 'EXPIRED';
              const isRevoked = lease.status === 'REVOKED' || lease.status === 'TRIPWIRE_TRIGGERED';
              const progressPct = Math.min(100, Math.max(0, ((now - lease.issuedAt) / (lease.ttlSeconds * 1000)) * 100));

              return (
                <div
                  key={lease.leaseId}
                  className={`p-3.5 rounded-lg border transition-all ${
                    lease.status === 'ACTIVE'
                      ? 'border-neutral-700 bg-neutral-950 shadow-md ring-1 ring-neutral-800'
                      : lease.status === 'TRIPWIRE_TRIGGERED'
                      ? 'border-red-900/60 bg-red-950/20'
                      : 'border-neutral-800/80 bg-neutral-950/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        lease.status === 'ACTIVE'
                          ? 'bg-emerald-400 animate-pulse'
                          : lease.status === 'TRIPWIRE_TRIGGERED'
                          ? 'bg-red-400'
                          : 'bg-amber-400'
                      }`} />
                      <span className="font-bold text-neutral-100 text-xs">{lease.leaseId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        lease.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : lease.status === 'TRIPWIRE_TRIGGERED'
                          ? 'bg-red-950 text-red-300 border-red-800/80 animate-pulse'
                          : lease.status === 'EXPIRED'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}>
                        {lease.status}
                      </span>

                      {lease.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeLease(lease.leaseId)}
                          className="text-[9px] text-red-400 hover:text-red-300 border border-red-900/60 hover:bg-red-950/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Substrate & TTL Progress */}
                  <div className="space-y-1.5 text-[10px] text-neutral-400 mb-2.5">
                    <div className="flex justify-between">
                      <span>Substrate: <strong className="text-neutral-200">{lease.substrateId}</strong></span>
                      <span>
                        TTL Remaining:{' '}
                        <strong className={remainingSec > 5 ? 'text-emerald-400' : 'text-amber-400'}>
                          {remainingSec}s
                        </strong>{' '}
                        / {lease.ttlSeconds}s
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          lease.status === 'ACTIVE'
                            ? remainingSec > 5 ? 'bg-cyan-500' : 'bg-amber-500'
                            : 'bg-neutral-700'
                        }`}
                        style={{ width: `${100 - progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Invocations Meter */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
                    <span>
                      Invocations:{' '}
                      <strong className="text-cyan-300">{lease.invocationsConsumed}</strong> / {lease.maxInvocations} max
                    </span>
                    {lease.revocationReason && (
                      <span className="text-red-400 text-[9px]">
                        Reason: {lease.revocationReason}
                      </span>
                    )}
                  </div>

                  {/* Capabilities List */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {lease.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[9px] text-cyan-300 font-semibold"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* RFC 8785 Digest */}
                  <div className="p-1.5 rounded bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                    <span className="truncate pr-2">{lease.leaseDigest}</span>
                    <button
                      onClick={() => copyToClipboard(lease.leaseDigest, lease.leaseId)}
                      className="text-cyan-400 hover:text-cyan-300 shrink-0 cursor-pointer"
                    >
                      {copiedId === lease.leaseId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
