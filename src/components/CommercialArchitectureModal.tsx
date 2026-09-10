import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Server, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Building, 
  Lock,
  Globe,
  Share2,
  Database,
  DollarSign,
  Users,
  Rocket,
  Download,
  FileCheck,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Presentation,
  ShieldAlert
} from 'lucide-react';
import { PITCH_DECK_SLIDES, PitchSlide } from '../data/pitchDeckData';
import { FormalEngineeringSpecView } from './FormalEngineeringSpecView';

interface CommercialArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialArchitectureModal: React.FC<CommercialArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'THESIS' | 'LICENSING' | 'BUYERS' | 'GTM' | 'PITCH_DECK' | 'FORMAL_SPEC'>('THESIS');
  const [selectedArch, setSelectedArch] = useState<'SIDECAR' | 'TERMINAL' | 'HYBRID'>('HYBRID');
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string, type: string = 'text/markdown') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadNotice(`Downloaded: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleDownloadExecutiveSummary = () => {
    const markdown = `# OCTEPOS: Executive Briefing & Commercial Thesis
**Document Classification:** Confidential / Enterprise Partner & R&D Briefing  
**Platform:** OCTEPOS Fluid Intelligence Workspace  
**Founder / Contact:** Josh Geddes (joshsgeddes@gmail.com)  
**Date:** ${new Date().toISOString().split('T')[0]}  

---

## 1. Executive Summary
Frontier LLM inference is increasingly commoditized. Enterprise CISOs and Risk Committees routinely block production deployment because frontier models operate under **ambient authority**—exposing internal databases, APIs, and systems to prompt-injection exploits, hallucinations, and unconstrained mutations that violate SOC 2, ISO 27001, and statutory compliance.

OCTEPOS provides the **Zero-Ambient-Authority Control Plane** for high-assurance enterprise AI:
* **The Core Value Proposition:** "You aren't selling the intelligence; you are selling the isolation and compliance insurance."
* **Deterministic Glass Floor Interceptor:** Userspace reference monitor trapping unauthorized syscalls and network egress attempts before reaching the kernel (0 syscalls leaked).
* **AI Evidence Gate:** Untrusted LLMs produce structured Chain-of-Thought triage candidates. They never touch credentials or dispatch syscalls directly.
* **Instant GRC Evidence:** Automated RFC 8785 canonical JSON audit trails and one-click SOC 2 / ISO 27001 CSV workpapers for Vanta, Drata, and ServiceNow GRC.

---

## 2. The 3 Commercial Packaging & Licensing Tiers
1. **Tier A — Sovereign Enclave License ($35,000 – $75,000 / cluster / yr):**
   * Target: FinTech, Defense Contractors, Family Offices, Private Banking.
   * Deployment: On-premise Proxmox hardware, airgapped bare metal, client private VPC.
   * Inclusions: Unlimited local node clustering, hardware attestation, 24/7 Enterprise SLA.

2. **Tier B — Enterprise Sidecar Proxy ($150 – $300 / seat / mo or $0.02 – $0.05 / alert):**
   * Target: Enterprise IT & MLOps scaling AI across internal engineering teams.
   * Deployment: Inline reverse proxy / Cloud Run / Kubernetes Envoy sidecar.
   * Inclusions: Multi-model substrate routing, prompt-injection stripping, token metering.

3. **Tier C — Turnkey GRC Appliance ($18,000 upfront + $15,000 / yr):**
   * Target: Mid-market tech firms undergoing fast-track SOC 2 Type II or ISO 27001 audits.
   * Deployment: Pre-configured dual ThinkCentre / 1U rackmount cluster.
   * Inclusions: Plug-and-play local hardware, continuous GRC evidence collectors.

---

## 3. The Funding Strategy: Public R&D Bridge to Enterprise ARR
* **Phase 1 (Non-Dilutive R&D Co-Funding):** Secure government innovation grants (e.g. MBIE / Callaghan Innovation) to fund lab hardware, testbeds, and research talent addressing deterministic state transition overhead and zero-syscall interception.
* **Phase 2 (Paid Enterprise Pilots):** Run 60-day paid Proofs of Concept ($15,000 / pilot) with 3–5 enterprise design partners targeting high-risk, high-compliance workflows.
* **Phase 3 (Scale ARR):** Roll pilots into recurring annual software licenses while distributing via Vanta and Drata partner ecosystems.
`;
    downloadFile('OCTEPOS_Executive_Summary.md', markdown);
  };

  const handleDownloadPitchDeck = () => {
    let markdown = `# OCTEPOS: Pitch Deck & Investor Presentation (10 Slides)
**Platform:** OCTEPOS: Fluid Intelligence Workspace  
**Theme:** The Zero-Ambient-Authority Control Plane for Enterprise AI  
**Author:** Josh Geddes (joshsgeddes@gmail.com)  

================================================================================

`;
    PITCH_DECK_SLIDES.forEach(slide => {
      markdown += `## SLIDE ${slide.number}: ${slide.title}\n`;
      markdown += `*${slide.subtitle}*\n\n`;
      markdown += `**Category:** [${slide.category}] | **Badge:** [${slide.metricBadge || 'VERIFIED'}]\n\n`;
      markdown += `> **Core Takeaway:** "${slide.keyTakeaway}"\n\n`;
      markdown += `### Key Presentation Points:\n`;
      slide.bullets.forEach(b => {
        markdown += `* **${b.heading}:** ${b.detail}\n`;
      });
      markdown += `\n**Speaker Notes for Presenter / Assessor:**\n`;
      markdown += `> "${slide.speakerNotes}"\n\n`;
      markdown += `--------------------------------------------------------------------------------\n\n`;
    });
    downloadFile('OCTEPOS_10_Slide_Pitch_Deck.md', markdown);
  };

  const handleCopyToClipboard = () => {
    const summary = `OCTEPOS: The Zero-Ambient-Authority Control Plane for Enterprise AI
"You aren't selling the intelligence; you are selling the isolation and compliance insurance."

Key Innovations:
1. Deterministic Glass Floor Interceptor: Userspace reference monitor trapping unauthorized syscalls and network egress attempts (0 syscalls leaked).
2. AI Evidence Gate: Models generate structured evidence; deterministic CEL policy engines authorize execution.
3. Automated GRC Workpapers: Instant one-click SOC 2 Type II and ISO 27001 exports formatted for Vanta, Drata, and ServiceNow GRC.

Commercial Model:
- Tier A (Sovereign Enclave): $35k–$75k/cluster/yr for on-premise Proxmox airgap.
- Tier B (Sidecar Proxy): $150–$300/seat/mo or $0.02–$0.05/alert metered volume.
- Tier C (Turnkey Appliance): $18k upfront + $15k/yr GRC continuous updates.

Go-To-Market & Capital Strategy:
- R&D Co-funding grants (MBIE / Callaghan Innovation) fund hardware lab and research talent.
- 60-day paid Proof of Concept ($15,000/pilot) with 3-5 enterprise design partners.
Contact: Josh Geddes (joshsgeddes@gmail.com)`;

    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-sans animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-100">
                  OCTEPOS Commercialization Blueprint & Enterprise Thesis
                </h3>
                <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
                  ARR ROADMAP
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Packaging, pricing models, buyer personas, and go-to-market execution for the zero-ambient-authority control plane.
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-6 pt-3 pb-2 font-mono text-xs overflow-x-auto">
          {[
            { id: 'THESIS', label: '1. Core Value Proposition', icon: Layers },
            { id: 'LICENSING', label: '2. Packaging & Pricing Models', icon: DollarSign },
            { id: 'BUYERS', label: '3. Buyer Personas & Pitch', icon: Users },
            { id: 'GTM', label: '4. GTM & 60-Day PoC Playbook', icon: Rocket },
            { id: 'PITCH_DECK', label: '5. Executive Briefing & Pitch Deck', icon: FileCheck },
            { id: 'FORMAL_SPEC', label: '6. Formal Engineering Invariants', icon: ShieldAlert }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CORE VALUE PROPOSITION & ARCHITECTURE */}
          {activeTab === 'THESIS' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Executive Value Proposition */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>The Core Enterprise Value Proposition</span>
                </div>
                <blockquote className="text-sm font-semibold text-neutral-100 border-l-2 border-emerald-400 pl-3 italic">
                  "You aren't selling the intelligence; you are selling the isolation and compliance insurance."
                </blockquote>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Frontier LLM inference is increasingly commoditized. What Enterprise CISOs, FinTech CTOs, and Risk Committees actually lack is the <strong>containment infrastructure</strong> that lets those models interact with sensitive workflows without creating catastrophic liability.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3">
                    <span className="text-red-400 font-bold block mb-1">The Enterprise Problem:</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      CISOs veto autonomous generative agents because ambient credentials enable prompt-injection exploits, catastrophic hallucinations, and unconstrained database mutations.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
                    <span className="text-emerald-400 font-bold block mb-1">The OCTEPOS Solution:</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      A mathematically bounded control plane with deterministic evidence policy gates, an airgapped Proxmox substrate router, and automated SOC 2 / ISO 27001 GRC evidence exports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deployment Architecture Evaluation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-neutral-300">
                  Select Architectural Deployment Paradigm:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <button
                    onClick={() => setSelectedArch('SIDECAR')}
                    className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                      selectedArch === 'SIDECAR'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Share2 className="h-4 w-4 text-cyan-400" />
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Low Friction</span>
                    </div>
                    <h5 className="font-bold text-sm text-neutral-100">Invisible SaaS Sidecar Proxy</h5>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      Inline policy broker between enterprise apps (Slack, ERP, Core Banking) and model APIs.
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedArch('TERMINAL')}
                    className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                      selectedArch === 'TERMINAL'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Terminal className="h-4 w-4 text-amber-400" />
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Max Security</span>
                    </div>
                    <h5 className="font-bold text-sm text-neutral-100">Dedicated Sovereign Terminal</h5>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      Air-gapped Bloomberg-style workstation powered by localized Proxmox VE hardware clusters.
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedArch('HYBRID')}
                    className={`rounded-xl border p-4 text-left space-y-2 transition-all ${
                      selectedArch === 'HYBRID'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/40'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Layers className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] uppercase font-bold text-emerald-400 font-bold">Recommended</span>
                    </div>
                    <h5 className="font-bold text-sm text-neutral-100">Dual-Enclave Hybrid Architecture</h5>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      SaaS proxy for broad document parsing + air-gapped terminal for master financial risk & ledger authority.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGING & LICENSING MODELS */}
          {activeTab === 'LICENSING' && (
            <div className="space-y-6 animate-fadeIn font-mono text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                      The 3 Enterprise Packaging & Licensing Tiers
                    </h4>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Structured pricing tiers aligned with compliance risk, infrastructure scale, and deployment footprint.
                    </p>
                  </div>
                  <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 text-emerald-300 font-bold">
                    RECURRING ARR
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier A */}
                  <div className="rounded-xl border border-cyan-500/40 bg-neutral-950 p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-[10px] text-cyan-300 font-bold">
                          TIER A
                        </span>
                        <span className="text-neutral-500 text-[10px]">ON-PREM / AIRGAP</span>
                      </div>
                      <h5 className="text-sm font-bold text-neutral-100">Sovereign Enclave License</h5>
                      <div className="text-xl font-bold text-cyan-300 font-mono">
                        $35k – $75k <span className="text-xs text-neutral-500 font-normal">/ cluster / yr</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Annual software license + 24/7 Enterprise Support SLA for Proxmox clusters, bare-metal enclaves, or private client VPCs.
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-neutral-300 pt-2 border-t border-neutral-800">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                          <span>Unlimited local node clustering</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                          <span>Zero-egress hardware attestation</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                          <span>Dedicated security patch releases</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-3 text-[10px] text-neutral-500 border-t border-neutral-800/80">
                      <strong>Target:</strong> FinTech, Defense Contractors, Sovereign Wealth, Private Banking
                    </div>
                  </div>

                  {/* Tier B */}
                  <div className="rounded-xl border border-emerald-500/40 bg-neutral-950 p-5 space-y-4 flex flex-col justify-between ring-1 ring-emerald-500/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/40 text-[10px] text-emerald-300 font-bold">
                          TIER B • HIGH SCALE
                        </span>
                        <span className="text-neutral-500 text-[10px]">INLINE PROXY</span>
                      </div>
                      <h5 className="text-sm font-bold text-neutral-100">Enterprise Sidecar Proxy</h5>
                      <div className="text-xl font-bold text-emerald-300 font-mono">
                        $150 – $300 <span className="text-xs text-neutral-500 font-normal">/ seat / mo</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        or metered: <strong className="text-neutral-200">$0.02 – $0.05</strong> per alert
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Inline reverse proxy deployed on Cloud Run or Kubernetes Envoy sidecar to govern enterprise-wide model fleets.
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-neutral-300 pt-2 border-t border-neutral-800">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>Multi-model substrate routing</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>Prompt injection stripping</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>Automated usage & token metering</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-3 text-[10px] text-neutral-500 border-t border-neutral-800/80">
                      <strong>Target:</strong> Enterprise IT & MLOps scaling AI across cross-functional internal teams
                    </div>
                  </div>

                  {/* Tier C */}
                  <div className="rounded-xl border border-purple-500/40 bg-neutral-950 p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded border border-purple-500/30 bg-purple-950/40 text-[10px] text-purple-300 font-bold">
                          TIER C
                        </span>
                        <span className="text-neutral-500 text-[10px]">HARDWARE APPLIANCE</span>
                      </div>
                      <h5 className="text-sm font-bold text-neutral-100">Turnkey GRC Appliance</h5>
                      <div className="text-xl font-bold text-purple-300 font-mono">
                        $18,000 <span className="text-xs text-neutral-500 font-normal">upfront</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        + <strong className="text-neutral-200">$15,000 / yr</strong> attestation updates
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Pre-configured dual ThinkCentre or 1U rackmount cluster with pre-installed OCTEPOS stack and ready-to-run GRC collectors.
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-neutral-300 pt-2 border-t border-neutral-800">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-purple-400" />
                          <span>Plug-and-play local hardware</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-purple-400" />
                          <span>Continuous GRC evidence exports</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-purple-400" />
                          <span>Pre-audited SOC 2 baseline specs</span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-3 text-[10px] text-neutral-500 border-t border-neutral-800/80">
                      <strong>Target:</strong> Mid-market tech firms undergoing fast-track SOC 2 Type II or ISO 27001 audits
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUYER PERSONAS & PITCH */}
          {activeTab === 'BUYERS' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                <h4 className="text-sm font-bold text-neutral-100 uppercase tracking-wider border-b border-neutral-800 pb-3">
                  Enterprise Buyer Personas & Closing Arguments
                </h4>

                <div className="space-y-4">
                  {/* Persona 1: CISO */}
                  <div className="rounded-lg border border-emerald-500/30 bg-neutral-950 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        1. Chief Information Security Officer (CISO) & Head of Compliance
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[10px] text-emerald-300">
                        PRIMARY BUYER
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      <strong className="text-neutral-300">Their Pain Point:</strong> Heavy board pressure to adopt AI versus statutory risk of data leakage and compliance failure.
                    </div>
                    <div className="rounded bg-neutral-900/90 border border-neutral-800 p-3 text-[11px] text-neutral-200">
                      <strong className="text-emerald-400 block mb-1">The Pitch:</strong>
                      "OCTEPOS guarantees zero ambient credentials. The model only generates structured evidence; deterministic rules execute actions. Your SOC 2 CC6.1–CC8.1 and ISO 27001 A.5.15 audit trails are cryptographically signed (RFC 8785) and exportable to Vanta or Drata with one click."
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      Outcome: Transforms the CISO from an AI blocker into an enabler with zero audit friction.
                    </div>
                  </div>

                  {/* Persona 2: MLOps */}
                  <div className="rounded-lg border border-cyan-500/30 bg-neutral-950 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        2. Head of AI Infrastructure & MLOps
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[10px] text-cyan-300">
                        TECHNICAL CHAMPION
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      <strong className="text-neutral-300">Their Pain Point:</strong> 6- to 9-month InfoSec review bottlenecks before any new LLM workflow can reach production.
                    </div>
                    <div className="rounded bg-neutral-900/90 border border-neutral-800 p-3 text-[11px] text-neutral-200">
                      <strong className="text-cyan-400 block mb-1">The Pitch:</strong>
                      "Plug your models into our Substrate Router. We provide sub-2ms local routing, automated prompt-injection stripping, and a zero-syscall userspace glass floor that passes infosec audits on day one."
                    </div>
                    <div className="text-[10px] text-cyan-400 font-bold">
                      Outcome: Drastically shortens model-to-production deployment cycles from months to days.
                    </div>
                  </div>

                  {/* Persona 3: FinTech */}
                  <div className="rounded-lg border border-purple-500/30 bg-neutral-950 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-purple-400 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        3. FinTech & Core Banking Engineering Leads
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-[10px] text-purple-300">
                        HIGH-ASSURANCE USER
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      <strong className="text-neutral-300">Their Pain Point:</strong> Fear of non-deterministic state drift, duplicate ledger debits, or silent API failures.
                    </div>
                    <div className="rounded bg-neutral-900/90 border border-neutral-800 p-3 text-[11px] text-neutral-200">
                      <strong className="text-purple-400 block mb-1">The Pitch:</strong>
                      "Strict transaction idempotency backed by atomic SQLite WAL rollbacks and tamper-evident Merkle state roots. Resubmitted deliveries execute exactly once—mathematically guaranteed."
                    </div>
                    <div className="text-[10px] text-purple-400 font-bold">
                      Outcome: Eliminates financial mutation liability and reconciliation nightmares.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GTM & 60-DAY POC PLAYBOOK */}
          {activeTab === 'GTM' && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                <h4 className="text-sm font-bold text-neutral-100 uppercase tracking-wider border-b border-neutral-800 pb-3">
                  Immediate Go-To-Market Execution Steps
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px]">1</span>
                      <span>Design Partner Alpha</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Package the live Cloud Run prototype and Proxmox dual-node configuration into a 15-minute quickstart script or Docker/LXC container template.
                    </p>
                    <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                      Deliverable: 1-click self-contained installation bundle.
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                    <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px]">2</span>
                      <span>3–5 Pilot Engagements</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Offer a structured 60-day paid Proof of Concept (PoC) at $10k–$15k, focusing on replacing one high-risk workflow (e.g., code security triage or loan evaluation).
                    </p>
                    <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                      Deliverable: 60-day PoC with guaranteed conversion criteria.
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                    <div className="text-purple-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-950 border border-purple-500/40 text-[10px]">3</span>
                      <span>GRC Partner Listing</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Position the one-click CSV and JSON export engine as a verified collector/evidence generator for Vanta, Drata, and Tugboat Logic.
                    </p>
                    <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                      Deliverable: Inbound qualified lead pipeline from audit prep.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXECUTIVE BRIEFING & 10-SLIDE PITCH DECK */}
          {activeTab === 'PITCH_DECK' && (
            <div className="space-y-6 animate-fadeIn font-mono text-xs">
              {/* Header Action Bar */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                      Enterprise Pitch Deck & Executive Briefing
                    </h4>
                    <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                      10 SLIDES READY
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Tailored presentation material for Enterprise Design Partners, CISOs, and Government R&D Grant Evaluators.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Briefing!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadExecutiveSummary}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Download Summary (MD)</span>
                  </button>

                  <button
                    onClick={handleDownloadPitchDeck}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Export 10-Slide Deck (MD)</span>
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {downloadNotice && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                  <span>{downloadNotice}</span>
                  <span className="text-[10px] text-emerald-500">Ready to present or import into slides</span>
                </div>
              )}

              {/* Interactive Pitch Deck Stepper & Slide Viewer */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                {/* Slide Stepper Bar */}
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-2.5 overflow-x-auto gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveSlide(Math.max(1, activeSlide - 1))}
                      disabled={activeSlide === 1}
                      className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 disabled:opacity-30 hover:bg-neutral-800 hover:text-white"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-neutral-400 px-2 font-bold">
                      SLIDE {activeSlide} OF {PITCH_DECK_SLIDES.length}
                    </span>
                    <button
                      onClick={() => setActiveSlide(Math.min(PITCH_DECK_SLIDES.length, activeSlide + 1))}
                      disabled={activeSlide === PITCH_DECK_SLIDES.length}
                      className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 disabled:opacity-30 hover:bg-neutral-800 hover:text-white"
                      title="Next Slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Slide number buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {PITCH_DECK_SLIDES.map(slide => (
                      <button
                        key={slide.number}
                        onClick={() => setActiveSlide(slide.number)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          activeSlide === slide.number
                            ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-200 shadow-sm'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {slide.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Slide Canvas */}
                {(() => {
                  const currentSlide = PITCH_DECK_SLIDES.find(s => s.number === activeSlide) || PITCH_DECK_SLIDES[0];
                  return (
                    <div className="p-6 space-y-6">
                      {/* Slide Title Card */}
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-300 font-bold">
                            SLIDE {currentSlide.number} • [{currentSlide.category}]
                          </span>
                          {currentSlide.metricBadge && (
                            <span className="px-2.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-[10px] text-emerald-300 font-bold">
                              {currentSlide.metricBadge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base md:text-lg font-bold text-neutral-100 font-sans tracking-tight">
                            {currentSlide.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">
                            {currentSlide.subtitle}
                          </p>
                        </div>

                        <blockquote className="text-xs font-semibold text-emerald-300 border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-950/10 rounded-r">
                          "{currentSlide.keyTakeaway}"
                        </blockquote>
                      </div>

                      {/* Slide Core Points Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentSlide.bullets.map((bullet, idx) => (
                          <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                            <div className="flex items-center gap-2 text-neutral-200 font-bold text-xs">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-[9px] text-emerald-400">
                                {idx + 1}
                              </span>
                              <span>{bullet.heading}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                              {bullet.detail}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Speaker Notes & Pitch Strategy */}
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <Presentation className="h-4 w-4" />
                          <span>Speaker Notes & Pitch Delivery Strategy</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                          "{currentSlide.speakerNotes}"
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom 1-Page Summary Accordion / Section */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-200 font-bold text-xs uppercase">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span>Executive Briefing One-Pager (Printable Overview)</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">CONFIDENTIAL BRIEFING</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                    <span className="text-emerald-400 font-bold block">1. The Problem & Market Gap</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Frontier AI adoption in regulated enterprises is blocked by ambient authority vulnerabilities (prompt injection, data exfiltration, unconstrained mutations) and lack of verifiable audit trails.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                    <span className="text-emerald-400 font-bold block">2. The Technical Solution</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      OCTEPOS enforces a deterministic userspace Glass Floor (0 syscalls leaked), separates evidence generation from execution authorization, and automatically generates signed RFC 8785 SOC 2 / ISO 27001 GRC artifacts.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                    <span className="text-cyan-400 font-bold block">3. Commercial Pricing Model</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Three-tier model: Sovereign Enclave ($35k–$75k/yr), Enterprise Sidecar Proxy ($150–$300/seat/mo or $0.02–$0.05/alert), and Turnkey GRC Appliance ($18k + $15k/yr).
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                    <span className="text-purple-400 font-bold block">4. Capital & R&D Strategy</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Non-dilutive R&D co-funding (MBIE / Callaghan Innovation) builds the laboratory and offsets researcher costs, while 60-day paid Proofs of Concept ($15,000 / pilot) validate enterprise willingness to pay.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FORMAL ENGINEERING INVARIANTS & SPECIFICATION */}
          {activeTab === 'FORMAL_SPEC' && (
            <FormalEngineeringSpecView />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 px-6 py-4 font-mono text-xs">
          <div className="text-neutral-400">
            Current Focus: <strong className="text-emerald-400">{activeTab}</strong>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-neutral-200 transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
