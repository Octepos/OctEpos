export interface PitchSlide {
  number: number;
  title: string;
  subtitle: string;
  category: 'VISION' | 'PROBLEM' | 'SOLUTION' | 'TECHNOLOGY' | 'COMPLIANCE' | 'MARKET' | 'BUSINESS_MODEL' | 'GTM' | 'R&D_GRANT' | 'ASK';
  keyTakeaway: string;
  bullets: {
    heading: string;
    detail: string;
  }[];
  speakerNotes: string;
  metricBadge?: string;
}

export const PITCH_DECK_SLIDES: PitchSlide[] = [
  {
    number: 1,
    title: 'OCTEPOS: The Zero-Ambient-Authority Control Plane',
    subtitle: 'Bridging Probabilistic Frontier AI and Statutory Enterprise Compliance',
    category: 'VISION',
    keyTakeaway: 'You aren’t selling the intelligence; you are selling the isolation and compliance insurance.',
    metricBadge: 'ZERO AMBIENT CREDENTIALS',
    bullets: [
      {
        heading: 'Foundational Invariant',
        detail: 'Frontier LLM inference is increasingly commoditized. Enterprise buyers lack the containment architecture to safely deploy autonomous models.'
      },
      {
        heading: 'Core Primitives',
        detail: 'Deterministic Glass Floor userspace interceptor (0 syscalls sink), multi-model substrate router, and RFC 8785 canonical audit proofs.'
      },
      {
        heading: 'Market Role',
        detail: 'The missing enterprise control plane between client applications, frontier AI providers, and core backends.'
      }
    ],
    speakerNotes: 'Start by reframing the conversation. Everyone is trying to sell faster or smarter models. We sell the security airlock and compliance guarantee that makes those models deployable in regulated environments.'
  },
  {
    number: 2,
    title: 'The Enterprise AI Impasse: High Demand, Zero Trust',
    subtitle: 'Why CISOs and Risk Committees Routinely Veto Autonomous Generative Workflows',
    category: 'PROBLEM',
    keyTakeaway: 'Ambient authority in LLM workflows creates unacceptable statutory and financial liability.',
    metricBadge: '6–9 MONTH DELAYS',
    bullets: [
      {
        heading: 'Ambient Authority Trap',
        detail: 'When an AI agent inherits broad employee credentials, a single prompt-injection or hallucination can drop tables or exfiltrate private data.'
      },
      {
        heading: 'Non-Deterministic Execution',
        detail: 'Probabilistic model outputs fail standard enterprise internal controls (SOX, SOC 2, ISO 27001) because execution paths cannot be verified.'
      },
      {
        heading: 'Audit Friction',
        detail: 'Security teams are forced to manually inspect screenshots and logs with zero cryptographic non-repudiation.'
      }
    ],
    speakerNotes: 'The pain point is tangible. CISOs want to say yes to the board, but their fiduciary duty forces them to say no because current AI tooling lacks formal boundaries.'
  },
  {
    number: 3,
    title: 'The Architectural Solution: Separating Evidence from Execution',
    subtitle: 'A Deterministic Policy Decision Point (PDP) Governing Probabilistic Model Outputs',
    category: 'SOLUTION',
    keyTakeaway: 'Models generate structured evidence; deterministic CEL policy engines authorize execution.',
    metricBadge: 'FORMAL PDP / PEP SPLIT',
    bullets: [
      {
        heading: 'AI Evidence Gate',
        detail: 'Untrusted LLMs produce structured Chain-of-Thought triage candidates. They never touch credentials or dispatch syscalls.'
      },
      {
        heading: 'Deterministic CEL Engine',
        detail: 'Mathematical invariant rules evaluate canonical payloads (RFC 8785) with sub-millisecond evaluation and 100% determinism.'
      },
      {
        heading: 'Deterministic Glass Floor',
        detail: 'Userspace reference monitor immediately traps unauthorized syscalls and network egress attempts before reaching the host kernel.'
      }
    ],
    speakerNotes: 'Show the architecture flow. Untrusted LLM output passes through our Evidence Gate, is evaluated by our deterministic CEL engine, and is physically constrained by the Glass Floor.'
  },
  {
    number: 4,
    title: 'The Competitive Moat: Mathematical Invariants vs. Text Filters',
    subtitle: 'Why Heuristic Text Guardrails Fail and Cryptographic Enclaves Prevail',
    category: 'TECHNOLOGY',
    keyTakeaway: 'Guardrails guess; OCTEPOS proves.',
    metricBadge: 'PROVABLE BOUNDARIES',
    bullets: [
      {
        heading: 'Traditional AI Guardrails',
        detail: 'Prompt-layer classifiers (e.g. LlamaGuard, NeMo) are probabilistic and easily bypassed by multi-turn semantic jailbreaks.'
      },
      {
        heading: 'Object-Capability Security',
        detail: 'OCTEPOS replaces ambient privileges with HMAC-SHA256 non-forgeable capability grants with monotonic attenuation and temporal TTLs.'
      },
      {
        heading: 'Cryptographic State Roots',
        detail: 'Binary Merkle tree (RFC 6962) with 0x00 leaf separation and dual-node Proxmox consensus guarantees tamper-evident provenance.'
      }
    ],
    speakerNotes: 'Enterprise buyers have already learned that prompt filters get jailbroken. Our moat is architectural: capability tokens, kernel-level traps, and Merkle tree roots.'
  },
  {
    number: 5,
    title: 'Turnkey Compliance: One-Click SOC 2 & ISO 27001 Evidence',
    subtitle: 'Translating Cryptographic Invariants Directly into External Auditor Workpapers',
    category: 'COMPLIANCE',
    keyTakeaway: 'Continuous compliance eliminates the annual audit scramble.',
    metricBadge: '100% AUDIT READY',
    bullets: [
      {
        heading: 'SOC 2 Type II Mapping',
        detail: 'Full coverage across CC6.1 (Logical Access), CC6.6 (Perimeter Defense), CC6.8 (Malware/AI Mitigation), CC7.2 (Audit Logs), and CC8.1 (Change Management).'
      },
      {
        heading: 'ISO/IEC 27001:2022',
        detail: 'Automated controls for A.5.15 (Access Control), A.8.20 (Network Security), A.8.24 (Cryptography), and A.8.28 (Secure Coding).'
      },
      {
        heading: 'Instant GRC Ingestion',
        detail: 'One-click exports to CSV (formatted for Vanta, Drata, ServiceNow GRC) and canonical RFC 8785 JSON signed audit certificates.'
      }
    ],
    speakerNotes: 'This is the killer feature for the CISO. We turn what used to take 200 hours of compliance screenshot gathering into a single automated export.'
  },
  {
    number: 6,
    title: 'Target Buyers & Tailored Value Propositions',
    subtitle: 'Addressing the Entire Enterprise Buying Committee',
    category: 'MARKET',
    keyTakeaway: 'Every stakeholder gets a quantifiable, risk-reducing outcome.',
    metricBadge: '3 BUYER PROFILES',
    bullets: [
      {
        heading: 'CISO / Head of Compliance (Economic Buyer)',
        detail: 'Pain: Board pressure vs. audit failure. Pitch: Zero ambient authority and RFC 8785 signed SOC 2/ISO 27001 workpapers.'
      },
      {
        heading: 'Head of AI Infrastructure / MLOps (Champion)',
        detail: 'Pain: 6-to-9 month infosec bottlenecks. Pitch: Sub-2ms local routing, automated prompt-injection stripping, and pre-cleared isolation.'
      },
      {
        heading: 'FinTech & Core Banking Leads (High-Assurance User)',
        detail: 'Pain: State drift and double-billing. Pitch: Strict transaction idempotency, atomic WAL rollback, and Merkle provenance.'
      }
    ],
    speakerNotes: 'We don’t just sell to one persona. We equip the MLOps champion with the exact arguments and compliance proof needed to pass the CISO review on day one.'
  },
  {
    number: 7,
    title: 'Packaging & Monetization: The 3 Commercial Licensing Tiers',
    subtitle: 'Predictable Enterprise ARR Structured for Scale and Security Posture',
    category: 'BUSINESS_MODEL',
    keyTakeaway: 'Flexible consumption: from airgapped bare metal to scalable sidecar proxies.',
    metricBadge: '$35K – $75K ARR / TIER',
    bullets: [
      {
        heading: 'Tier A: Sovereign Enclave License ($35k–$75k/yr)',
        detail: 'Annual software license + Enterprise Support SLA for on-premise Proxmox hardware, airgapped bare metal, or client VPCs.'
      },
      {
        heading: 'Tier B: Enterprise Sidecar Proxy ($150–$300/seat/mo or metered)',
        detail: 'Cloud Run / Envoy sidecar proxy governing multi-model enterprise fleets ($0.02 – $0.05 / alert volume).'
      },
      {
        heading: 'Tier C: Turnkey GRC Appliance ($18,000 upfront + $15k/yr)',
        detail: 'Pre-configured dual ThinkCentre / 1U rackmount cluster with pre-installed OCTEPOS stack and automated GRC collectors.'
      }
    ],
    speakerNotes: 'Notice the blended model. Regulated financial and defense clients take Tier A or C; high-growth SaaS and enterprise tech adopt Tier B.'
  },
  {
    number: 8,
    title: 'Go-To-Market Execution: The 60-Day Pilot Playbook',
    subtitle: 'From Design Partner Alpha to Repeatable Enterprise ARR',
    category: 'GTM',
    keyTakeaway: 'Paid pilots with clear conversion criteria de-risk customer acquisition.',
    metricBadge: '60-DAY PAID POC',
    bullets: [
      {
        heading: 'Phase 1: Design Partner Alpha (Month 1–2)',
        detail: 'Package reference prototype and Proxmox dual-node setup into a 15-minute quickstart installer and Docker/LXC templates.'
      },
      {
        heading: 'Phase 2: 3–5 Enterprise Pilots (Month 3–5)',
        detail: 'Structured 60-day paid Proof of Concept ($15,000 / pilot) targeting a single high-risk workflow (e.g. security triage or loan evaluation).'
      },
      {
        heading: 'Phase 3: GRC Ecosystem Distribution (Month 6+)',
        detail: 'List as verified automated evidence collector on Vanta and Drata partner directories for pre-qualified audit-readiness leads.'
      }
    ],
    speakerNotes: 'We do not offer free trials that linger. We offer a structured $15k paid PoC with clear SLA acceptance criteria that automatically rolls into an annual license.'
  },
  {
    number: 9,
    title: 'The Capital Bridge: Public R&D Co-Funding to Private ARR',
    subtitle: 'Leveraging Non-Dilutive Government Grants to De-Risk Core Innovation',
    category: 'R&D_GRANT',
    keyTakeaway: 'Grants build the lab and fund the researcher; product sales sustain the business.',
    metricBadge: 'NON-DILUTIVE LEVERAGE',
    bullets: [
      {
        heading: 'The Research Uncertainty',
        detail: 'Investigating deterministic state verification latency overhead under high throughput and userspace reference monitoring on heterogeneous microarchitectures.'
      },
      {
        heading: 'Grant Funding Utility',
        detail: 'Securing $150k–$250k in government innovation co-funding (e.g. MBIE / Callaghan Innovation) to offset lab hardware, cloud testbeds, and research contractor talent.'
      },
      {
        heading: 'Commercial Transition',
        detail: 'Public capital de-risks technical foundations while pilot revenue proves market willingness to pay, avoiding premature equity dilution.'
      }
    ],
    speakerNotes: 'This slide is essential for funding advisors. It shows that public grant money is being used strictly to de-risk high-barrier technological hurdles with a clear commercialization runway.'
  },
  {
    number: 10,
    title: 'Milestones, Status & The Next Horizon',
    subtitle: 'Current Operational Maturity and 6-Month Execution Roadmap',
    category: 'ASK',
    keyTakeaway: 'Core technology is built and compiling; ready for lab scale and pilot deployment.',
    metricBadge: 'V3.8 PLATFORM VERIFIED',
    bullets: [
      {
        heading: 'Current Status (V3.8)',
        detail: 'Full full-stack implementation running with live SSE telemetry, Proxmox quorum attestation, AI Evidence Gate, and GRC export engine.'
      },
      {
        heading: 'Immediate 6-Month Goals',
        detail: 'Formalize R&D co-funding grant application; deploy 3 paid enterprise design partner pilots ($45k initial revenue); certify Vanta/Drata integration.'
      },
      {
        heading: 'Engagement Contact',
        detail: 'Josh Geddes • joshsgeddes@gmail.com • OCTEPOS Fluid Intelligence Workspace'
      }
    ],
    speakerNotes: 'End on operational confidence. The software is not vaporware; it is working, compiled, and ready for immediate deployment and pilot validation.'
  }
];
