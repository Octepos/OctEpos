import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  Briefcase, 
  Layers, 
  DollarSign, 
  Lock, 
  FileCheck, 
  CheckCircle2, 
  Terminal,
  Download,
  Code2,
  Github,
  LayoutGrid
} from 'lucide-react';
import { PolicyDecision, CanaryState, SubstrateId } from '../types/octepos';
import { SpatialAirlockDashboard } from './SpatialAirlockDashboard';
import { CommercialWorkflowsSection } from './CommercialWorkflowsSection';
import { PolicyDecisionLog } from './PolicyDecisionLog';
import { CapabilityAllocationMatrix } from './CapabilityAllocationMatrix';
import { AuditorStateProof } from './AuditorStateProof';
import { GlassFloorTelemetryFeed } from './GlassFloorTelemetryFeed';
import { EnterpriseComplianceDashboard } from './EnterpriseComplianceDashboard';

interface CommercialExecutiveViewProps {
  canaryState: CanaryState;
  policyDecisions: PolicyDecision[];
  onLogPolicyDecision: (decision: PolicyDecision) => void;
  onOpenPolicyManager: () => void;
  onOpenArchitectureExplorer: () => void;
  onOpenPublicRelease?: () => void;
  onOpenCertificateModal?: () => void;
  onOpenCloudRunPerimeter?: () => void;
  onSelectSubstrate?: (id: SubstrateId) => void;
}

export const CommercialExecutiveView: React.FC<CommercialExecutiveViewProps> = ({
  canaryState,
  policyDecisions,
  onLogPolicyDecision,
  onOpenPolicyManager,
  onOpenArchitectureExplorer,
  onOpenPublicRelease,
  onOpenCertificateModal,
  onOpenCloudRunPerimeter,
  onSelectSubstrate
}) => {
  const [activeTab, setActiveTab] = useState<'AIRLOCK' | 'COMPLIANCE' | 'TELEMETRY' | 'WORKFLOWS' | 'DECISIONS' | 'AUDITOR'>('AIRLOCK');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
          {[
            { id: 'AIRLOCK', label: 'Spatial Airlock Console' },
            { id: 'COMPLIANCE', label: 'SOC 2 & ISO 27001 Compliance Matrix' },
            { id: 'TELEMETRY', label: 'Glass Floor Syscall Logs' },
            { id: 'WORKFLOWS', label: 'Enterprise Case Studies' },
            { id: 'DECISIONS', label: `Policy Decisions (${policyDecisions.length})` },
            { id: 'AUDITOR', label: 'Auditor Proofs (RFC 8785)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-neutral-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROVABLE BOUNDARIES v3.8</span>
        </div>
      </div>

      {/* Primary Section: Spatial Containment Airlock (Top / Middle / Bottom) */}
      {activeTab === 'AIRLOCK' && (
        <section id="spatial-airlock-console">
          <SpatialAirlockDashboard
            canaryState={canaryState}
            policyDecisions={policyDecisions}
            onLogPolicyDecision={onLogPolicyDecision}
            onOpenCertificateModal={onOpenCertificateModal}
            onOpenPolicyManager={onOpenPolicyManager}
            onOpenArchitectureExplorer={onOpenArchitectureExplorer}
            onSelectSubstrate={onSelectSubstrate}
          />
        </section>
      )}

      {/* Section: Enterprise Compliance Mapping & Audit Trail Exports (SOC 2 & ISO 27001) */}
      {activeTab === 'COMPLIANCE' && (
        <section id="enterprise-compliance-matrix">
          <EnterpriseComplianceDashboard
            canaryState={canaryState}
            policyDecisions={policyDecisions}
            onOpenCertificateModal={onOpenCertificateModal}
            defaultRole="ENTERPRISE_ARCHITECT"
          />
        </section>
      )}

      {/* Section 1: Live Glass Floor Intercept & Teardown Feed */}
      {activeTab === 'TELEMETRY' && (
        <section id="glass-floor-telemetry">
          <GlassFloorTelemetryFeed
            canaryState={canaryState}
            onLogPolicyDecision={onLogPolicyDecision}
            onSelectSubstrate={onSelectSubstrate}
          />
        </section>
      )}

      {/* Section 2: Enterprise Case Studies Workflows */}
      {activeTab === 'WORKFLOWS' && (
        <section id="commercial-workflows">
          <CommercialWorkflowsSection
            onLogPolicyDecision={onLogPolicyDecision}
            onSelectSubstrate={onSelectSubstrate}
          />
        </section>
      )}

      {/* Section 3: Policy Decision Log (Administrative Denials) */}
      {activeTab === 'DECISIONS' && (
        <section id="policy-log">
          <PolicyDecisionLog
            decisions={policyDecisions}
          />
        </section>
      )}

      {/* Section 4: State Integrity Proofs for Auditors */}
      {activeTab === 'AUDITOR' && (
        <section id="auditor-proofs">
          <AuditorStateProof
            canaryState={canaryState}
            onOpenCertificateModal={onOpenCertificateModal}
          />
        </section>
      )}
    </div>
  );
};
