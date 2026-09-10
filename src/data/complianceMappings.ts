export interface ComplianceControlMapping {
  id: string;
  framework: 'SOC2_TYPE2' | 'ISO_27001' | 'NIST_800_207' | 'FINTECH_HIGH_ASSURANCE';
  frameworkName: string;
  controlCode: string;
  controlTitle: string;
  domain: string;
  formalRequirement: string;
  octeposImplementation: string;
  technicalMechanism: string;
  verificationMethod: string;
  status: 'VERIFIED_COMPLIANT' | 'CONTINUOUS_ENFORCEMENT' | 'MATHEMATICAL_INVARIANT';
  auditArtifact: string;
}

export const COMPLIANCE_MAPPINGS: ComplianceControlMapping[] = [
  // SOC 2 TYPE II CONTROLS
  {
    id: 'CTRL-SOC2-CC6.1',
    framework: 'SOC2_TYPE2',
    frameworkName: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    controlCode: 'CC6.1',
    controlTitle: 'Logical Access & Non-Ambient Authorization',
    domain: 'Logical and Physical Access Controls',
    formalRequirement: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from unauthorized access.',
    octeposImplementation: 'Capability-Based Token Matrix (Non-Ambient Authority). Workloads hold zero ambient credentials and can only invoke operations with cryptographically signed, unforgeable capability tokens.',
    technicalMechanism: 'HMAC-SHA256 Capability Grants with strict resource masks, monotonic attenuation, and temporal TTLs.',
    verificationMethod: 'Automated test harness verifying zero ambient permissions and rejection of unsigned requests.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'RFC 8785 Canonical Lease Digest'
  },
  {
    id: 'CTRL-SOC2-CC6.6',
    framework: 'SOC2_TYPE2',
    frameworkName: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    controlCode: 'CC6.6',
    controlTitle: 'Boundary Protection & Network Perimeter Defense',
    domain: 'Logical and Physical Access Controls',
    formalRequirement: 'The entity implements logical boundaries to protect against unauthorized data egress, network penetration, or perimeter bypass.',
    octeposImplementation: 'Deterministic Glass Floor Interceptor: Userspace reference monitor trapping unauthorized syscalls and network egress attempts before reaching the host kernel.',
    technicalMechanism: 'Userspace seccomp/ptrace-equivalent reference monitor trapping egress sockets with 0 syscalls dispatched.',
    verificationMethod: 'Continuous canary packet trap with sub-millisecond tripwire cascade and zero egress leak proof.',
    status: 'VERIFIED_COMPLIANT',
    auditArtifact: 'Glass Floor Syscall Sink Log (0 Dispatched)'
  },
  {
    id: 'CTRL-SOC2-CC6.8',
    framework: 'SOC2_TYPE2',
    frameworkName: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    controlCode: 'CC6.8',
    controlTitle: 'Malicious Software & Adversarial AI Mitigation',
    domain: 'Logical and Physical Access Controls',
    formalRequirement: 'The entity implements controls to prevent or detect malicious inputs, malware, and unauthorized code execution across workloads.',
    octeposImplementation: 'AI Evidence Gate & Adversarial Prompt-Injection Heuristic Engine. Untrusted LLM outputs cannot directly authorize operations; deterministic policy engine owns all execution.',
    technicalMechanism: 'Two-stage pipeline: LLM produces Chain-of-Thought evidence; Deterministic CEL rules authorize operations.',
    verificationMethod: 'Automated test suite (P0 Acceptance) asserting 100% rejection of prompt-injection attempts.',
    status: 'CONTINUOUS_ENFORCEMENT',
    auditArtifact: 'DeterministicPolicyDecision Canonical Digest'
  },
  {
    id: 'CTRL-SOC2-CC7.2',
    framework: 'SOC2_TYPE2',
    frameworkName: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    controlCode: 'CC7.2',
    controlTitle: 'Tamper-Evident Security Monitoring & Incident Logs',
    domain: 'System Operations & Monitoring',
    formalRequirement: 'The entity monitors system components to detect anomalies, security incidents, and operational errors, maintaining an unalterable audit record.',
    octeposImplementation: 'Cryptographic Merkle Proof Engine (RFC 6962 / RFC 8785) with multi-node Proxmox consensus and immutable SQLite WAL ledger.',
    technicalMechanism: 'Binary Merkle tree with 0x00 leaf domain separation and 0x01 interior node hashing; Byzantine tamper invalidates root.',
    verificationMethod: 'O(log2 N) compact inclusion proof verified against live attested Merkle state root.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Merkle Inclusion Proof Chain (RFC 6962)'
  },
  {
    id: 'CTRL-SOC2-CC8.1',
    framework: 'SOC2_TYPE2',
    frameworkName: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    controlCode: 'CC8.1',
    controlTitle: 'Controlled Execution & Ephemeral Lease Revocation',
    domain: 'Change Management & Authorization',
    formalRequirement: 'The entity authorizes, designs, develops, and deploys changes to software and data using controlled operational constraints.',
    octeposImplementation: 'Dynamic Policy Leases with hard monotonic TTL auto-revocation and instant cluster-wide tripwire cascade upon anomaly detection.',
    technicalMechanism: 'Invocation caps decrement atomically; expired or tampered leases fail closed without execution.',
    verificationMethod: 'Monotonic clock attestation asserting lease invalidation upon TTL expiration or quota exhaustion.',
    status: 'VERIFIED_COMPLIANT',
    auditArtifact: 'Ephemeral Lease Monotonic Clock Record'
  },

  // ISO/IEC 27001:2022 CONTROLS
  {
    id: 'CTRL-ISO-A.5.15',
    framework: 'ISO_27001',
    frameworkName: 'ISO/IEC 27001:2022 (Information Security Management)',
    controlCode: 'A.5.15',
    controlTitle: 'Access Control & Principle of Least Privilege',
    domain: 'Organizational Controls',
    formalRequirement: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and security requirements.',
    octeposImplementation: 'Object-capability security model with strict monotonic attenuation. No role can inherit ambient superuser privileges.',
    technicalMechanism: 'Granular capability bitmasks (CAP_INGEST_WEBHOOKS, CAP_EVIDENCE_GATE, CAP_AIRGAP_ENCLAVE).',
    verificationMethod: 'P0 Acceptance Suite: Zero ambient authority across all tenant tiers.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Tenant Capability Bitmask Grant'
  },
  {
    id: 'CTRL-ISO-A.8.20',
    framework: 'ISO_27001',
    frameworkName: 'ISO/IEC 27001:2022 (Information Security Management)',
    controlCode: 'A.8.20',
    controlTitle: 'Network Security & Airgapped Enclave Isolation',
    domain: 'Technological Controls',
    formalRequirement: 'Networks and network devices shall be secured, managed and controlled to protect information in systems and applications.',
    octeposImplementation: 'Substrate Router with Corosync quorum validation, local ThinkCentre cluster airgap, and latency ceilings (<2.0ms).',
    technicalMechanism: 'Zero-egress hardware firewall rules; split-brain detection halts dispatch immediately.',
    verificationMethod: 'Automated test asserting execution halt if Corosync quorum drops below 2/3 threshold.',
    status: 'VERIFIED_COMPLIANT',
    auditArtifact: 'Proxmox Corosync Quorum State Heartbeat'
  },
  {
    id: 'CTRL-ISO-A.8.24',
    framework: 'ISO_27001',
    frameworkName: 'ISO/IEC 27001:2022 (Information Security Management)',
    controlCode: 'A.8.24',
    controlTitle: 'Use of Cryptography & Non-Repudiation',
    domain: 'Technological Controls',
    formalRequirement: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
    octeposImplementation: 'RFC 8785 JSON Canonicalization, SHA-256 state hashing, HMAC-SHA256 webhook signatures, and deterministic digests.',
    technicalMechanism: 'Timing-safe signature verification (crypto.timingSafeEqual) and PBKDF2/SHA256 salted tenant keys.',
    verificationMethod: 'Cryptographic constant-time comparison test preventing timing-attack oracle vulnerabilities.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Deterministic Digest (0x... SHA-256)'
  },
  {
    id: 'CTRL-ISO-A.8.28',
    framework: 'ISO_27001',
    frameworkName: 'ISO/IEC 27001:2022 (Information Security Management)',
    controlCode: 'A.8.28',
    controlTitle: 'Secure Coding & AI Prompt-Injection Defenses',
    domain: 'Technological Controls',
    formalRequirement: 'Secure coding principles shall be applied to software development to ensure resilience against vulnerability exploitation.',
    octeposImplementation: 'Deterministic evidence evaluation layer stripping injection heuristics (/ignore previous instructions/, /system prompt/).',
    technicalMechanism: 'Adversarial regex & AST parser refusing automated suppression of suspicious payloads.',
    verificationMethod: 'Automated fuzzing and adversarial prompt suite demonstrating prompt neutralization.',
    status: 'CONTINUOUS_ENFORCEMENT',
    auditArtifact: 'Adversarial Defense Evaluation Record'
  },
  {
    id: 'CTRL-ISO-A.8.15',
    framework: 'ISO_27001',
    frameworkName: 'ISO/IEC 27001:2022 (Information Security Management)',
    controlCode: 'A.8.15',
    controlTitle: 'Logging and Monitoring without Third-Party Exfiltration',
    domain: 'Technological Controls',
    formalRequirement: 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analyzed.',
    octeposImplementation: 'Zero-Cost Structured JSON Logger & Local SQLite WAL ledger. Telemetry is self-contained with zero telemetry data exfiltration.',
    technicalMechanism: 'Structured JSON to stdout/stderr natively ingested by container runtime and Google Cloud Logging.',
    verificationMethod: 'Fail-open verification: System runs completely isolated with zero external network telemetry calls.',
    status: 'VERIFIED_COMPLIANT',
    auditArtifact: 'Structured JSON Telemetry Stream'
  },

  // NIST SP 800-207 (ZERO TRUST ARCHITECTURE)
  {
    id: 'CTRL-NIST-PDP',
    framework: 'NIST_800_207',
    frameworkName: 'NIST SP 800-207 (Zero Trust Architecture)',
    controlCode: 'ZTA-PDP',
    controlTitle: 'Policy Decision Point (PDP) Separation',
    domain: 'Core Zero Trust Logical Components',
    formalRequirement: 'The Policy Decision Point (PDP) is responsible for the ultimate decision to grant access to a resource based on enterprise policy.',
    octeposImplementation: 'DeterministicEvidencePolicy engine acts as the formal PDP. The AI model only supplies probabilistic evidence; it never decides policy.',
    technicalMechanism: 'Immutable CEL policy rules evaluated deterministically on RFC 8785 canonical payloads.',
    verificationMethod: 'Sub-millisecond policy engine test suite validating deterministic output consistency.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'PDP Policy Decision Record'
  },
  {
    id: 'CTRL-NIST-PEP',
    framework: 'NIST_800_207',
    frameworkName: 'NIST SP 800-207 (Zero Trust Architecture)',
    controlCode: 'ZTA-PEP',
    controlTitle: 'Policy Enforcement Point (PEP) Glass Floor',
    domain: 'Core Zero Trust Logical Components',
    formalRequirement: 'The Policy Enforcement Point (PEP) is responsible for enabling, monitoring, and eventually terminating connections between an enterprise resource and a subject.',
    octeposImplementation: 'GlassFloorInterceptor & SubstrateRouter act as the strict PEP, terminating rogue processes immediately with 0 syscall impact.',
    technicalMechanism: 'Hardware-assisted userspace reference monitor intercepting system calls before kernel transit.',
    verificationMethod: 'Continuous telemetry verifying zero kernel syscall leaks across all intercepted workflows.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'PEP Syscall Trap Log'
  },

  // FINTECH & HIGH-ASSURANCE SYSTEMS
  {
    id: 'CTRL-FINTECH-IDEMP',
    framework: 'FINTECH_HIGH_ASSURANCE',
    frameworkName: 'High-Assurance / FinTech Deterministic Guarantees',
    controlCode: 'FIN-IDEMP-01',
    controlTitle: 'Strict Idempotency & Zero Double-Charging',
    domain: 'Financial & Transactional Integrity',
    formalRequirement: 'Systems processing financial or credit transactions must guarantee exactly-once execution across duplicate or concurrent delivery attempts.',
    octeposImplementation: 'Cryptographic delivery caching & atomic SQLite WAL transactions. Resubmitting an identical delivery ID charges exactly once.',
    technicalMechanism: 'SHA-256 delivery deduplication key in durable SQLite WAL store with sub-millisecond lookup.',
    verificationMethod: 'P0 Invariant 1 & 2: Concurrent submission of duplicate delivery IDs verified to trigger zero duplicate charges.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Idempotency Cache Audit Proof'
  },
  {
    id: 'CTRL-FINTECH-ROLLBACK',
    framework: 'FINTECH_HIGH_ASSURANCE',
    frameworkName: 'High-Assurance / FinTech Deterministic Guarantees',
    controlCode: 'FIN-ROLLBACK-02',
    controlTitle: 'Atomic Ledger Rollback (Zero Silent Failures)',
    domain: 'Financial & Transactional Integrity',
    formalRequirement: 'Any ledger mutation failure must trigger an atomic rollback, ensuring zero uncommitted state drift or silent debiting.',
    octeposImplementation: 'Atomic transaction wrapping in DurableLedgerStore. Any secondary failure rolls back both balance decrements and event logs.',
    technicalMechanism: 'BEGIN IMMEDIATE transaction in SQLite WAL mode; rollback on any non-zero exit.',
    verificationMethod: 'P0 Invariant 4: Injected write failure asserts zero state mutation and explicit transaction rejection.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Durable Ledger Rollback Assertion'
  },
  {
    id: 'CTRL-FINTECH-MERKLE',
    framework: 'FINTECH_HIGH_ASSURANCE',
    frameworkName: 'High-Assurance / FinTech Deterministic Guarantees',
    controlCode: 'FIN-AUDIT-03',
    controlTitle: 'Cryptographic Non-Repudiation & Merkle Provenance',
    domain: 'Financial & Transactional Integrity',
    formalRequirement: 'All ledger events must be cryptographically chained such that historical alterations are computationally infeasible.',
    octeposImplementation: 'Epoch-based Merkle tree with direct odd-node promotion (RFC 6962). Byzantine tampering alters the state root.',
    technicalMechanism: 'SHA-256 interior nodes with 0x01 domain separation; signed Proxmox cluster multi-node consensus.',
    verificationMethod: 'P0 Invariant 5: Bit-flip in any leaf invalidates the Merkle inclusion proof instantly.',
    status: 'MATHEMATICAL_INVARIANT',
    auditArtifact: 'Signed Merkle State Root & Epoch Certificate'
  }
];
