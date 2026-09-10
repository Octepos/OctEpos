import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Key,
  Shield,
  Zap,
  PlusCircle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Building,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Cpu
} from 'lucide-react';
import {
  SubscriptionTier,
  TenantCapability,
  TenantIdentity,
  TenantUsageState
} from '../types/octepos';

interface TenantRecord {
  identity: TenantIdentity;
  usage: TenantUsageState;
  demoApiKey?: string;
}

export const TenantMeteringSection: React.FC = () => {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New tenant issuance state
  const [newOrgName, setNewOrgName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTier, setNewTier] = useState<SubscriptionTier>('GROWTH_METERED');
  const [newCredits, setNewCredits] = useState<number>(2500);
  const [newUnitCost, setNewUnitCost] = useState<number>(0.025);
  const [createdKeyReceipt, setCreatedKeyReceipt] = useState<{ rawApiKey: string; orgName: string } | null>(null);

  // Last live burn event
  const [lastBurnEvent, setLastBurnEvent] = useState<{
    tenantId: string;
    tier: string;
    remainingCredits: number;
    costNzd: number;
    alertId?: string;
    timestamp: string;
  } | null>(null);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tenants');
      const data = await res.json();
      if (data.success && Array.isArray(data.tenants)) {
        setTenants(data.tenants);
        if (!selectedTenantId && data.tenants.length > 0) {
          setSelectedTenantId(data.tenants[0].identity.tenantId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();

    // Listen to SSE live telemetry stream for real-time quota burn & top-up
    const eventSource = new EventSource('/api/telemetry/stream');

    eventSource.addEventListener('quota_burned', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setLastBurnEvent(payload);
        setTenants(prev =>
          prev.map(t => {
            if (t.identity.tenantId === payload.tenantId) {
              return {
                ...t,
                usage: {
                  ...t.usage,
                  availableCredits: payload.remainingCredits,
                  totalTriagedCount: t.usage.totalTriagedCount + 1,
                  unbilledAccrualNzd: Number((t.usage.unbilledAccrualNzd + payload.costNzd).toFixed(4)),
                  lastActiveTimestamp: Date.now()
                }
              };
            }
            return t;
          })
        );
      } catch (err) {
        console.error('Failed parsing quota_burned SSE:', err);
      }
    });

    eventSource.addEventListener('quota_topup', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setTenants(prev =>
          prev.map(t => {
            if (t.identity.tenantId === payload.tenantId) {
              return {
                ...t,
                usage: {
                  ...t.usage,
                  availableCredits: payload.newBalance
                }
              };
            }
            return t;
          })
        );
      } catch (err) {
        console.error('Failed parsing quota_topup SSE:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [selectedTenantId]);

  const activeTenant = tenants.find(t => t.identity.tenantId === selectedTenantId) || tenants[0];

  const handleCopy = (text: string, isHash = false) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleTopUp = async (amount: number) => {
    if (!activeTenant) return;
    setIsTopUpLoading(true);
    try {
      const res = await fetch(`/api/tenants/${activeTenant.identity.tenantId}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: amount })
      });
      const data = await res.json();
      if (data.success) {
        setTenants(prev =>
          prev.map(t =>
            t.identity.tenantId === activeTenant.identity.tenantId
              ? { ...t, usage: { ...t.usage, availableCredits: data.newBalance } }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Top-up error:', err);
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!activeTenant) return;
    const newStatus = !activeTenant.identity.isSuspended;
    try {
      const res = await fetch(`/api/tenants/${activeTenant.identity.tenantId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTenants(prev =>
          prev.map(t =>
            t.identity.tenantId === activeTenant.identity.tenantId
              ? { ...t, identity: { ...t.identity, isSuspended: newStatus } }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Suspension toggle failed:', err);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newTenantSlug) return;
    try {
      const res = await fetch('/api/tenants/issue-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: newOrgName,
          tenantSlug: newTenantSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          tier: newTier,
          initialCredits: newCredits,
          unitCostPerAlertNzd: newUnitCost
        })
      });
      const data = await res.json();
      if (data.success && data.issuance) {
        setCreatedKeyReceipt({
          rawApiKey: data.issuance.rawApiKey,
          orgName: data.issuance.tenant.orgName
        });
        await fetchTenants();
        setSelectedTenantId(data.issuance.tenant.tenantId);
      }
    } catch (err) {
      console.error('Failed to issue tenant key:', err);
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'SOVEREIGN_ENTERPRISE':
        return 'border-purple-500/50 bg-purple-950/20 text-purple-300';
      case 'GROWTH_METERED':
        return 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300';
      case 'COMMUNITY_FREE':
      default:
        return 'border-slate-500/50 bg-slate-900/40 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tenant Identity & Capital Share Metering API
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Pillar 4 Monetization
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sub-millisecond API key authentication, capability bitmasking, and atomic credit quota burn ($0.015 – $0.040 NZD/alert).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenants}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Tenant Ledgers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-900/20"
          >
            <PlusCircle className="w-4 h-4" />
            Issue New Tenant Key
          </button>
        </div>
      </div>

      {/* Tenant Selector Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tenants.map(t => {
          const isSelected = t.identity.tenantId === activeTenant?.identity.tenantId;
          return (
            <button
              key={t.identity.tenantId}
              onClick={() => setSelectedTenantId(t.identity.tenantId)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500/60 text-white shadow-md shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <Building className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{t.identity.orgName}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getTierColor(t.identity.tier)}`}>
                {t.identity.tier === 'SOVEREIGN_ENTERPRISE' ? 'SOVEREIGN' : t.identity.tier === 'GROWTH_METERED' ? 'METERED' : 'FREE'}
              </span>
              {t.identity.isSuspended && (
                <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                  SUSPENDED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tenant Details & Metrics Panel */}
      {activeTenant && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Account Metrics & Balance Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Real-Time Credit Balance
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${getTierColor(activeTenant.identity.tier)}`}>
                  {activeTenant.identity.tier}
                </span>
              </div>

              {/* Large Balance Display */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {activeTenant.identity.tier === 'SOVEREIGN_ENTERPRISE'
                      ? 'UNLIMITED'
                      : activeTenant.usage.availableCredits.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeTenant.identity.tier === 'SOVEREIGN_ENTERPRISE'
                      ? 'Enterprise Airgap SLA Agreement'
                      : 'Remaining Prepaid Alert Credits'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Unit Consumption Rate</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {activeTenant.identity.tier === 'SOVEREIGN_ENTERPRISE'
                      ? '$0.00 NZD (Flat)'
                      : `$${activeTenant.identity.unitCostPerAlertNzd.toFixed(3)} NZD / Alert`}
                  </div>
                </div>
              </div>

              {/* Balance Burn Progress Bar */}
              {activeTenant.identity.tier !== 'SOVEREIGN_ENTERPRISE' && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Credit Depletion Status</span>
                    <span>
                      {Math.max(
                        0,
                        Math.min(
                          100,
                          Math.round((activeTenant.usage.availableCredits / (activeTenant.usage.availableCredits + activeTenant.usage.totalTriagedCount || 1)) * 100)
                        )
                      )}
                      % Remaining
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeTenant.usage.availableCredits < 100
                          ? 'bg-rose-500'
                          : activeTenant.usage.availableCredits < 500
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.max(
                          2,
                          Math.min(
                            100,
                            (activeTenant.usage.availableCredits /
                              (activeTenant.usage.availableCredits + activeTenant.usage.totalTriagedCount || 1)) *
                              100
                          )
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Accrual and Triaged Totals */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Total Alerts Triaged</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeTenant.usage.totalTriagedCount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Unbilled Accrual (NZD)</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                    ${activeTenant.usage.unbilledAccrualNzd.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 1-Click Top-Up & Controls */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleTopUp(1000)}
                  disabled={isTopUpLoading || activeTenant.identity.tier === 'SOVEREIGN_ENTERPRISE'}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  +1,000 Credits ($25)
                </button>
                <button
                  onClick={() => handleTopUp(5000)}
                  disabled={isTopUpLoading || activeTenant.identity.tier === 'SOVEREIGN_ENTERPRISE'}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  +5,000 Credits ($125)
                </button>
                <button
                  onClick={handleToggleSuspend}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    activeTenant.identity.isSuspended
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                  }`}
                  title={activeTenant.identity.isSuspended ? 'Lift Suspension' : 'Administratively Suspend Tenant'}
                >
                  {activeTenant.identity.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </div>
            </div>

            {/* Live Burn Feed Pulse */}
            {lastBurnEvent && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-400">Live Quota Burn:</span>
                  <span className="font-mono text-white">{lastBurnEvent.tenantId}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-emerald-400">-${lastBurnEvent.costNzd.toFixed(3)} NZD</span>
                  <span className="text-slate-500">({lastBurnEvent.remainingCredits} left)</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Cryptographic Identity & Capability Bitmask (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* API Key Credential Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Client Ingestion API Key
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Header: <code className="text-cyan-300">Authorization: Bearer &lt;key&gt;</code>
                </span>
              </div>

              {/* Raw Key Display */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                <code className="text-xs font-mono text-slate-200 flex-1 truncate">
                  {activeTenant.demoApiKey
                    ? showApiKey
                      ? activeTenant.demoApiKey
                      : `${activeTenant.demoApiKey.substring(0, 14)}••••••••••••••••••••••••••••••••••••••••••••••••`
                    : 'oct_live_••••••••••••••••••••••••••••••••••••••••••••••••'}
                </code>

                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {activeTenant.demoApiKey && (
                  <button
                    onClick={() => handleCopy(activeTenant.demoApiKey!)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Salted SHA-256 Hash Display (Proof of Zero Plaintext Storage) */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    Salted SHA-256 Storage Digest (Zero Plaintext Stored):
                  </span>
                  <button
                    onClick={() => handleCopy(activeTenant.identity.keyHash, true)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Hash
                  </button>
                </div>
                <div className="bg-slate-900/60 p-2 rounded font-mono text-[11px] text-slate-400 break-all border border-slate-800">
                  {activeTenant.identity.keyHash}
                </div>
              </div>
            </div>

            {/* Zero-Ambient Authority Capability Bitmask */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Zero-Ambient Capability Grants
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeTenant.identity.capabilities.length} Grants Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    cap: 'CAP_INGEST_WEBHOOKS',
                    label: 'Webhook Telemetry Ingress',
                    desc: 'Submit raw GitHub / Datadog / SIEM events'
                  },
                  {
                    cap: 'CAP_EVIDENCE_GATE_TRIAGE',
                    label: 'AI Evidence Gate Triage',
                    desc: 'Run sub-second Chain-of-Thought validation'
                  },
                  {
                    cap: 'CAP_MERKLE_STATE_ATTESTATION',
                    label: 'Merkle Epoch Attestation',
                    desc: 'Sign and verify cryptographic epoch roots'
                  },
                  {
                    cap: 'CAP_PROXMOX_CLUSTER_DISPATCH',
                    label: 'Proxmox Hardware Dispatch',
                    desc: 'Execute isolated compute on bare-metal PVE'
                  },
                  {
                    cap: 'CAP_AIRGAP_ENCLAVE_CONTROL',
                    label: 'Airgap Dynamic Policy Lease',
                    desc: 'Issue ephemeral leases with zero network egress'
                  }
                ].map(item => {
                  const hasCap = activeTenant.identity.capabilities.includes(item.cap as TenantCapability);
                  return (
                    <div
                      key={item.cap}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        hasCap
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {hasCap ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-5">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue New Tenant Key */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-emerald-400" />
              Issue High-Entropy Tenant API Key
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Generates a 256-bit cryptographically random API key. Stored exclusively as a salted SHA-256 hash.
            </p>

            {createdKeyReceipt ? (
              <div className="space-y-4">
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Successfully Generated for {createdKeyReceipt.orgName}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Copy this key now. It will never be displayed again in plaintext.
                  </p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs text-emerald-400 break-all">
                    <span>{createdKeyReceipt.rawApiKey}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdKeyReceipt.rawApiKey);
                      setCreatedKeyReceipt(null);
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Copy & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Security Solutions Ltd"
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tenant Slug (Identifier)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-sec"
                    value={newTenantSlug}
                    onChange={e => setNewTenantSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subscription Tier</label>
                    <select
                      value={newTier}
                      onChange={e => {
                        const t = e.target.value as SubscriptionTier;
                        setNewTier(t);
                        if (t === 'GROWTH_METERED') {
                          setNewCredits(2500);
                          setNewUnitCost(0.025);
                        } else if (t === 'SOVEREIGN_ENTERPRISE') {
                          setNewCredits(1000000);
                          setNewUnitCost(0.0);
                        } else {
                          setNewCredits(100);
                          setNewUnitCost(0.0);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="COMMUNITY_FREE">Community Free (100 free alerts)</option>
                      <option value="GROWTH_METERED">Growth Metered ($0.025 / alert)</option>
                      <option value="SOVEREIGN_ENTERPRISE">Sovereign Enterprise (Flat Contract)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Initial Credit Balance</label>
                    <input
                      type="number"
                      value={newCredits}
                      onChange={e => setNewCredits(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
