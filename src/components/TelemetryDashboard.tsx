import React from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Cpu, 
  Activity, 
  Layers, 
  Lock, 
  Flame, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { CanaryGauge } from './CanaryGauge';
import { CanaryState } from '../types/octepos';

interface TelemetryDashboardProps {
  canaryState: CanaryState;
  onRefreshCanary: () => void;
  interceptCount: number;
}

const TELEMETRY_TIME_SERIES = [
  { time: '16:40', intercepted: 3, authorized: 24, leakage: 0, syscallsDispatched: 0 },
  { time: '16:45', intercepted: 5, authorized: 38, leakage: 0, syscallsDispatched: 0 },
  { time: '16:50', intercepted: 2, authorized: 31, leakage: 0, syscallsDispatched: 0 },
  { time: '16:55', intercepted: 7, authorized: 45, leakage: 0, syscallsDispatched: 0 },
  { time: '17:00', intercepted: 4, authorized: 40, leakage: 0, syscallsDispatched: 0 },
  { time: '17:05', intercepted: 6, authorized: 52, leakage: 0, syscallsDispatched: 0 },
];

const SUBSTRATE_ROUTER_METRICS = [
  { name: 'Gemini 3.7', tokensSec: 218, latency: 132, egressBlocked: 14 },
  { name: 'Claude 3.7', tokensSec: 74, latency: 460, egressBlocked: 9 },
  { name: 'Local PVE', tokensSec: 58, latency: 88, egressBlocked: 22 },
];

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  canaryState,
  onRefreshCanary,
  interceptCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Core Telemetry Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Metric 1: Observed Leakage */}
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950 to-emerald-950/20 p-4 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-wider">STATE SURFACE LEAKAGE</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-400">
            0%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-sans">
            0% observed leakage across the audited state surface
          </div>
        </div>

        {/* Metric 2: Intercepted Compute Cost */}
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950 to-cyan-950/20 p-4 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-wider">INTERCEPTED ACTIONS COST</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-cyan-300">
            $0.00
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-sans">
            $0.00 compute cost for intercepted actions (zero cycle burn)
          </div>
        </div>

        {/* Metric 3: Syscalls Dispatched */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-wider">PROHIBITED OS SYSCALLS</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-neutral-100">
            0
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-sans">
            Deterministic Glass Floor stopped all unauthorized kernel transitions
          </div>
        </div>

        {/* Metric 4: Total Intercepts */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-wider">ATTENUATED INTERCEPTS</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-300">
            {27 + interceptCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-sans">
            Reference Monitor pre-syscall boundary drops
          </div>
        </div>
      </div>

      {/* Recharts Grid & Canary Isolation Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capability Attenuation & Syscall Boundary Stream */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-3">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Capability Attenuation & Boundary Verification
              </h3>
              <p className="text-[11px] text-neutral-400">
                Authorized VFS Sandboxed Actions vs Reference Monitor Intercepts (0 OS Syscalls)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Authorized VFS
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Glass Floor Intercept
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TELEMETRY_TIME_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIntercept" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="time" stroke="#737373" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#737373" fontSize={10} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    borderColor: '#404040',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="authorized" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAuth)" 
                  name="Authorized Actions"
                />
                <Area 
                  type="monotone" 
                  dataKey="intercepted" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIntercept)" 
                  name="Glass Floor Intercepts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cryptographic Canary Isolation Gauge */}
        <div className="lg:col-span-1">
          <CanaryGauge 
            canaryState={canaryState}
            onRefreshCanary={onRefreshCanary}
          />
        </div>
      </div>
    </div>
  );
};
