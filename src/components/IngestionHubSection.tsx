import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  GitPullRequest, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Radio, 
  Terminal,
  FileCode,
  BellOff,
  BellRing,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Layers,
  Activity
} from 'lucide-react';
import { IngestedWebhookEvent, IngestionProvider } from '../security/IngestionAdapters';

interface IngestionHubSectionProps {
  onWebhookProcessed?: () => void;
}

export const IngestionHubSection: React.FC<IngestionHubSectionProps> = ({ onWebhookProcessed }) => {
  const [selectedProvider, setSelectedProvider] = useState<IngestionProvider>('GITHUB');
  const [recentWebhooks, setRecentWebhooks] = useState<IngestedWebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState<'EXPLOIT' | 'FALSE_POSITIVE'>('EXPLOIT');
  const [bloomStats, setBloomStats] = useState<{
    capacityBits: number;
    hashCount: number;
    entriesTracked: number;
    replaysBlocked: number;
    totalChecks: number;
    memoryBytes: number;
  } | null>(null);
  const [isSimulatingBurst, setIsSimulatingBurst] = useState<boolean>(false);
  const [burstReport, setBurstReport] = useState<{
    burstCount: number;
    blocked: number;
    totalElapsedMs: number;
    avgMicrosPerCheck: number;
  } | null>(null);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://octepos.internal';

  const providerConfigs = {
    GITHUB: {
      name: 'GitHub Actions / CodeQL',
      badge: 'CI/CD Ingress',
      endpoint: `${originUrl}/api/webhooks/github`,
      secretHeader: 'X-Hub-Signature-256',
      defaultSecret: 'octepos-devsecops-webhook-secret-994',
      description: 'Ingests CodeQL SARIF alerts, Dependabot updates, and PR security gates. Normalizes to user-space Evidence Gate.',
      sampleYaml: `# .github/workflows/octepos-gate.yml
name: OCTEPOS Security Gate
on: [pull_request]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Send CodeQL Alerts to OCTEPOS
        run: |
          curl -X POST "${originUrl}/api/webhooks/github" \\
            -H "Content-Type: application/json" \\
            -H "X-Hub-Signature-256: sha256=..." \\
            -d @codeql-results.json`
    },
    DATADOG: {
      name: 'Datadog Monitors & Security Signals',
      badge: 'SIEM Ingress',
      endpoint: `${originUrl}/api/webhooks/datadog`,
      secretHeader: 'X-Datadog-Webhook-Token',
      defaultSecret: 'dd-token-octepos-enclave-881',
      description: 'Ingests Corosync cluster anomalies, metric drift, and SIEM security signals to suppress false-positive alarms.',
      sampleYaml: `// Datadog Webhook Configuration:
// URL: ${originUrl}/api/webhooks/datadog
// Custom Headers:
// X-Datadog-Webhook-Token: dd-token-octepos-enclave-881
// Payload template:
{
  "id": "$ID",
  "title": "$EVENT_TITLE",
  "body": "$EVENT_MSG",
  "event_type": "security_monitor_alert",
  "hostname": "$HOSTNAME"
}`
    },
    SPLUNK: {
      name: 'Splunk Notable Events & SIEM',
      badge: 'Enterprise SIEM',
      endpoint: `${originUrl}/api/webhooks/siem`,
      secretHeader: 'Authorization: Bearer <token>',
      defaultSecret: 'dd-token-octepos-enclave-881',
      description: 'Receives CEF / JSON security alerts from enterprise SIEM engines, triaging root logins and firewall drops.',
      sampleYaml: `# Splunk Alert Action Webhook
curl -X POST "${originUrl}/api/webhooks/siem" \\
  -H "Authorization: Bearer dd-token-octepos-enclave-881" \\
  -H "Content-Type: application/json" \\
  -d '{
    "search_name": "Brute-Force-Privilege-Escalation",
    "sid": "1789400291.55",
    "app": "enterprise_security",
    "result": { "src_ip": "198.51.100.89", "action": "ESCALATED" }
  }'`
    },
    GENERIC: {
      name: 'Generic JSON Security Webhook',
      badge: 'Universal Ingress',
      endpoint: `${originUrl}/api/webhooks/generic`,
      secretHeader: 'None (Direct Ingress)',
      defaultSecret: 'N/A',
      description: 'Direct webhook for custom internal security scanners, GitLab CI, Jenkins, and Sentry triggers.',
      sampleYaml: `curl -X POST "${originUrl}/api/webhooks/generic" \\
  -H "Content-Type: application/json" \\
  -d '{
    "alertId": "CUSTOM-SEC-901",
    "ruleId": "arbitrary-code-execution",
    "sourcePath": "services/auth/session.ts",
    "codeSnippet": "eval(req.body.code);"
  }'`
    }
  };

  const fetchRecentWebhooks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/webhooks/recent');
      const data = await res.json();
      if (data.success && Array.isArray(data.webhooks)) {
        setRecentWebhooks(data.webhooks);
      }
    } catch (err) {
      console.error('Failed to load recent webhooks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBloomStats = async () => {
    try {
      const res = await fetch('/api/webhooks/replay-filter/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setBloomStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load bloom stats:', err);
    }
  };

  const handleSimulateBurst = async () => {
    try {
      setIsSimulatingBurst(true);
      const res = await fetch('/api/webhooks/replay-filter/simulate-burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ burstCount: 1000 })
      });
      const data = await res.json();
      if (data.success) {
        setBurstReport({
          burstCount: data.burstCount,
          blocked: data.blocked,
          totalElapsedMs: data.totalElapsedMs,
          avgMicrosPerCheck: data.avgMicrosPerCheck
        });
        if (data.stats) setBloomStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to simulate replay burst:', err);
    } finally {
      setIsSimulatingBurst(false);
    }
  };

  useEffect(() => {
    fetchRecentWebhooks();
    fetchBloomStats();

    // Listen for live SSE events
    const sse = new EventSource('/api/telemetry/stream');
    sse.addEventListener('webhook_ingested', () => {
      fetchRecentWebhooks();
      fetchBloomStats();
      if (onWebhookProcessed) onWebhookProcessed();
    });

    return () => {
      sse.close();
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateWebhook = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          scenario: scenarioMode
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRecentWebhooks();
        if (data.event?.webhookId) {
          setExpandedWebhookId(data.event.webhookId);
        }
        if (onWebhookProcessed) onWebhookProcessed();
      }
    } catch (err) {
      console.error('Failed to simulate webhook:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const currentCfg = providerConfigs[selectedProvider];

  return (
    <div id="ingestion-hub-section" className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Webhook className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">SIEM & CI/CD Ingestion Gateway</h2>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Plug-and-Play Ingress
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Pipe external noise directly into Pillar 3 (AI Evidence Gate) with zero cluster re-architecture.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="refresh-webhooks-btn"
            onClick={fetchRecentWebhooks}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Receipts</span>
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Ingress Port 3000 Active</span>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-6">
        {(['GITHUB', 'DATADOG', 'SPLUNK', 'GENERIC'] as IngestionProvider[]).map((prov) => {
          const cfg = providerConfigs[prov];
          const isSelected = selectedProvider === prov;
          return (
            <button
              key={prov}
              id={`provider-tab-${prov.toLowerCase()}`}
              onClick={() => setSelectedProvider(prov)}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {prov}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cfg.badge}
                </span>
              </div>
              <span className="text-xs font-medium truncate w-full text-slate-200">
                {cfg.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* L1 Edge Replay Defense: Sub-Microsecond Bloom Filter HUD */}
      <div className="mb-6 p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-100 text-sm">
                  Sub-Microsecond Replay Defense (L1 Bloom Filter)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px]">
                  &lt; 0.4µs Zero-DB Latency
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Absorbs webhook retries and duplicate bursts at the network edge before SQLite/WAL queries or accounting ledger locks occur.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateBurst}
            disabled={isSimulatingBurst}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulatingBurst ? 'animate-spin' : ''}`} />
            <span>{isSimulatingBurst ? 'Saturating Edge...' : 'Simulate Replay Burst (1,000)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Capacity &amp; Hashes</span>
            <span className="text-cyan-300 font-bold">{bloomStats ? `${bloomStats.capacityBits.toLocaleString()} bits (k=${bloomStats.hashCount})` : '65,536 bits (k=4)'}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Kirsch-Mitzenmacher Double Hash</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">RAM Footprint</span>
            <span className="text-emerald-300 font-bold">{bloomStats ? `${(bloomStats.memoryBytes / 1024).toFixed(1)} KB` : '8.2 KB'}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Zero Allocation Bit Array</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Replays Blocked</span>
            <span className="text-amber-300 font-bold">{bloomStats ? bloomStats.replaysBlocked.toLocaleString() : '0'}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">0 Credits Billed &bull; 0 DB Writes</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Edge Checks</span>
            <span className="text-slate-200 font-bold">{bloomStats ? bloomStats.totalChecks.toLocaleString() : '0'}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Sub-microsecond evaluation</span>
          </div>
        </div>

        {burstReport && (
          <div className="mt-3 p-2.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 text-cyan-200 text-[11px] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>
                Absorbed burst of <strong>{burstReport.burstCount}</strong> requests: <strong>{burstReport.blocked}</strong> duplicates dropped at edge in <strong>{burstReport.totalElapsedMs}ms</strong>.
              </span>
            </div>
            <span className="text-cyan-300 font-bold">{burstReport.avgMicrosPerCheck}µs / check</span>
          </div>
        )}
      </div>

      {/* Active Provider Configuration & Live Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Webhook Details & Copy Helpers */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Webhook Ingress Endpoint: {currentCfg.name}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">POST HTTP/1.1</span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {currentCfg.description}
            </p>

            {/* URL Input */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Ingress Webhook URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={currentCfg.endpoint}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                  <button
                    id="copy-webhook-url-btn"
                    onClick={() => handleCopy(currentCfg.endpoint, 'url')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                  >
                    {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Secret Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Signature / Token Header
                  </label>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 truncate">
                    {currentCfg.secretHeader}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Default Enclave Shared Secret
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      readOnly
                      value={currentCfg.defaultSecret}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 truncate focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(currentCfg.defaultSecret, 'secret')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Copy Secret"
                    >
                      {copiedField === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Integration Snippet */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Integration Snippet</span>
              </span>
              <button
                onClick={() => handleCopy(currentCfg.sampleYaml, 'snippet')}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition"
              >
                {copiedField === 'snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'snippet' ? 'Copied' : 'Copy snippet'}</span>
              </button>
            </div>
            <pre className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-32">
              {currentCfg.sampleYaml}
            </pre>
          </div>
        </div>

        {/* Right Column: 1-Click Simulated Ingestion Bench */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950/80 to-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Interactive Webhook Test Bench</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Simulate an inbound webhook payload from {currentCfg.name} directly into the local normalizer and AI Evidence Gate.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-[11px] font-mono uppercase text-slate-400 block">
                Select Simulation Scenario:
              </label>
              
              <button
                id="scenario-exploit-btn"
                onClick={() => setScenarioMode('EXPLOIT')}
                className={`w-full p-3 rounded-lg border text-left flex items-start space-x-3 transition ${
                  scenarioMode === 'EXPLOIT'
                    ? 'bg-rose-950/30 border-rose-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="p-1.5 rounded bg-rose-500/20 text-rose-400 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-rose-300">
                    Exploit Scenario (True Positive)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Simulates unvalidated input flowing into file reads. Expected: <strong className="text-rose-400">CONFIRMED_TRUE_POSITIVE</strong> &amp; PR annotation.
                  </div>
                </div>
              </button>

              <button
                id="scenario-canary-btn"
                onClick={() => setScenarioMode('FALSE_POSITIVE')}
                className={`w-full p-3 rounded-lg border text-left flex items-start space-x-3 transition ${
                  scenarioMode === 'FALSE_POSITIVE'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <BellOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-300">
                    Noise Suppression (False Positive)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Simulates benign test canary or dropped scan. Expected: <strong className="text-emerald-400">FILTERED_FALSE_POSITIVE</strong> (0 On-Call Pages).
                  </div>
                </div>
              </button>
            </div>
          </div>

          <button
            id="dispatch-simulation-webhook-btn"
            onClick={handleSimulateWebhook}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Normalizing &amp; Triaging Inbound Webhook...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Simulate Inbound {selectedProvider} Webhook</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inbound Webhook Receipts Stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-200">Recent Inbound Webhook Receipts</h3>
            <span className="text-xs text-slate-400 font-mono">({recentWebhooks.length} events logged)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Real-time audit receipts with cryptographic provenance
          </span>
        </div>

        {recentWebhooks.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-8 text-center">
            <Webhook className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-300">No Webhooks Received Yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Simulate Inbound Webhook&quot; above or point your GitHub/Datadog alerts to the webhook endpoint.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recentWebhooks.map((wh) => {
              const isExpanded = expandedWebhookId === wh.webhookId;
              const isTruePositive = wh.triageResult?.verdict === 'CONFIRMED_TRUE_POSITIVE';
              const isFalsePositive = wh.triageResult?.verdict === 'FILTERED_FALSE_POSITIVE';

              return (
                <div
                  key={wh.webhookId}
                  id={`webhook-receipt-${wh.webhookId}`}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded uppercase ${
                        wh.provider === 'GITHUB'
                          ? 'bg-purple-950/50 text-purple-300 border border-purple-800/50'
                          : wh.provider === 'DATADOG'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-800/50'
                          : wh.provider === 'SPLUNK'
                          ? 'bg-blue-950/50 text-blue-300 border border-blue-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {wh.provider}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {wh.normalizedAlert.alertId}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {wh.normalizedAlert.ruleId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                          {wh.normalizedAlert.sourcePath}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      {/* Signature status */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 ${
                        wh.signatureVerified
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{wh.signatureVerified ? 'HMAC/Token OK' : 'Unsigned'}</span>
                      </span>

                      {/* Verdict badge */}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 ${
                        isTruePositive
                          ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                          : isFalsePositive
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                          : 'bg-amber-950/50 text-amber-300 border border-amber-800/50'
                      }`}>
                        {isTruePositive ? <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> : isFalsePositive ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Radio className="w-3.5 h-3.5 text-amber-400" />}
                        <span>
                          {wh.triageResult?.verdict || 'PENDING'}
                        </span>
                      </span>

                      {/* Outbound Dispatch Pill */}
                      {wh.outboundDispatch && (
                        <span className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 ${
                          wh.outboundDispatch.status === 'SUPPRESSED'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                        }`}>
                          {wh.outboundDispatch.status === 'SUPPRESSED' ? <BellOff className="w-3 h-3 text-slate-400" /> : <BellRing className="w-3 h-3 text-indigo-400" />}
                          <span className="truncate max-w-[130px]">{wh.outboundDispatch.action}</span>
                        </span>
                      )}

                      {/* Expand / Collapse */}
                      <button
                        onClick={() => setExpandedWebhookId(isExpanded ? null : wh.webhookId)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                      {/* Summary callout */}
                      {wh.outboundDispatch?.summary && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-center space-x-2">
                          <span className="font-semibold text-emerald-400">Automated Dispatch Outcome:</span>
                          <span>{wh.outboundDispatch.summary}</span>
                        </div>
                      )}

                      {/* Chain of Thought Reasoning */}
                      {wh.triageResult && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                          <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
                            <span>Chain-of-Thought (CoT) Evidence:</span>
                            <span className="font-mono text-emerald-400 text-[11px]">
                              Confidence: {(wh.triageResult.confidenceScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400">
                            {wh.triageResult.reasoningSteps.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                            <span>RFC 8785 Digest: {wh.triageResult.provenanceDigest}</span>
                            <span>Syscalls: 0</span>
                          </div>
                        </div>
                      )}

                      {/* Side-by-Side: Raw Inbound vs Canonical Normalized Alert */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <div className="text-slate-400 text-[11px] uppercase mb-1">
                            Raw Inbound Webhook Payload ({wh.provider})
                          </div>
                          <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 overflow-x-auto max-h-48">
                            {JSON.stringify(wh.rawPayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[11px] uppercase mb-1">
                            Normalized Canonical Alert (Evidence Gate)
                          </div>
                          <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] text-emerald-300 overflow-x-auto max-h-48">
                            {JSON.stringify(wh.normalizedAlert, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
