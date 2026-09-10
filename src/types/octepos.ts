export type SubstrateId = 'gemini' | 'claude' | 'local';

export interface IntelligenceSubstrate {
  id: SubstrateId;
  name: string;
  version: string;
  badge: 'FAST/Breadth' | 'REASONING/Depth' | 'LOCAL';
  description: string;
  status: 'ONLINE' | 'ACTIVE' | 'ROUTING' | 'MAINTENANCE';
  tokensPerSec: number;
  latencyMs: number;
  contextWindow: string;
  egressPolicy: 'STRICT_PROXY' | 'FORMAL_ISOLATION' | 'ZERO_EGRESS_AIRGAP';
  allocatedWorkload: string;
  costPer1kTokens: number;
}

export type PipelineStage = 
  | 'INTENT'
  | 'CAPABILITY_ALLOCATION'
  | 'EPHEMERAL_HAND'
  | 'BROKERED_ACTION'
  | 'RESULT';

export interface CapabilityGrant {
  id: string;
  name: string;
  resourceMask: string;
  attenuationBoundary: string;
  ttlSeconds: number;
  remainingSeconds: number;
  isEphemeral: boolean;
  permittedSyscalls: string[];
  deniedSyscalls: string[];
}

export interface PipelineState {
  currentStage: PipelineStage | null;
  stageProgress: number; // 0-100
  intentText: string;
  substrateId: SubstrateId;
  capabilityGrants: CapabilityGrant[];
  ephemeralHandId: string | null;
  ephemeralNonce: string | null;
  brokeredAction: {
    actionType: string;
    targetResource: string;
    isAuthorized: boolean;
    attenuationViolation?: string;
  } | null;
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'INTERCEPTED';
  glassFloorTriggered: boolean;
  syscallsDispatched: number;
  computeCostSunk: number;
}

export interface ForensicEvent {
  id: string;
  timestamp: string;
  substrateId: SubstrateId;
  attemptedAction: string;
  targetResource: string;
  violationCode: string;
  violationCategory: 'PATH_TRAVERSAL' | 'NET_EGRESS' | 'CAPABILITY_INFLATION' | 'WRITE_ARTIFACT' | 'PROHIBITED_SYSCALL';
  nonAnthropomorphicEvaluation: string;
  interceptLocation: 'USERSPACE_REFERENCE_MONITOR_DETERMINISTIC_GLASS_FLOOR';
  syscallsDispatched: 0;
  computeCost: 0;
  stateLeakage: '0.00%';
  ephemeralTokenId: string;
  merkleStateRoot: string;
  rawPayload: Record<string, unknown>;
  remediated: boolean;
}

export interface ThinkCentreNode {
  nodeId: string;
  hostname: string;
  model: string;
  ipAddress: string;
  port: number;
  lxcId: number;
  modelLoaded: string;
  cpuUtil: number;
  ramUsageGb: number;
  ramTotalGb: number;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  endpointUrl: string;
  avxSupport: string;
  gpuPassthrough: boolean;
}

export interface ProxmoxClusterConfig {
  clusterName: string;
  quorum: string; // "2/2 Nodes Online"
  corosyncLatencyMs: number;
  routingPolicy: 'ROUND_ROBIN' | 'LEAST_LATENCY' | 'MEMORY_WEIGHTED' | 'FAILOVER_PRIMARY';
  zeroEgressEnforced: boolean;
  nodes: ThinkCentreNode[];
}

export interface CanaryState {
  currentStateRoot: string;
  nextStateRoot: string;
  divergencePercentage: number;
  entropyNonce: string;
  isolationIntegrity: 'SECURE_INTACT' | 'PROBING' | 'ATTENUATING';
  merkleEpoch: number;
  verifiedProofs: number;
}

export interface AdversarialTier {
  tier: 1 | 2 | 3;
  title: string;
  attackVector: string;
  payload: string;
  expectedDefense: string;
  targetSubstrate: SubstrateId;
  targetAction: string;
  targetPath: string;
  status: 'PENDING' | 'RUNNING' | 'INTERCEPTED' | 'PASSED';
  evalOutput?: string;
}

export type AppMode = 'EXECUTIVE_AUDIT' | 'ENGINEERING_COCKPIT';

export interface CommercialWorkflow {
  id: string;
  title: string;
  clientOrProject: string;
  domain: 'Regulated Finance & Loan Portfolios' | 'Commercial Asset Conversion & Municipal Feasibility';
  intent: string;
  substrateId: SubstrateId;
  commercialValue: string;
  attemptedUnauthorizedAction: string;
  policyDenialReason: string;
  costSaved: string;
  artifactName: string;
  artifactSnippet: string;
  status: 'IDLE' | 'ANALYZING' | 'INTERCEPTED_SAFE' | 'COMPLETED';
}

export interface PolicyDecision {
  id: string;
  timestamp: string;
  taskName: string;
  clientContext: string;
  attemptedAction: string;
  status: 'POLICY DENIAL' | 'AUTHORIZED_BROKER';
  reason: string;
  costSaved: string;
  stateIntegrity: string;
  dispatchedSyscalls: 0;
  substrate: SubstrateId;
  category: 'LEDGER_MUTATION' | 'UNMETERED_API_SPEND' | 'UNAUTHORIZED_EXTERNAL_COMM' | 'VFS_ISOLATION';
}

export interface AuditorGuarantee {
  id: string;
  title: string;
  plainLanguageGuarantee: string;
  status: 'VERIFIED_DESTROYED' | 'UNALTERED_100%' | 'ZERO_EXTERNAL_LOGS' | 'ZERO_AMBIENT_AUTHORITY';
  cryptographicAttestation: string;
  verifiedAt: string;
}

export interface CapabilityAllocationItem {
  id: string;
  taskName: string;
  assignedSubstrate: SubstrateId;
  substrateBadge: 'FAST/Breadth' | 'REASONING/Depth' | 'LOCAL';
  activeGrants: string[];
  prohibitedActions: string[];
  attenuationBoundary: string;
  ambientAuthority: string;
  commercialContext: string;
}

export interface DynamicPolicyRule {
  id: string;
  name: string;
  environment: 'GLOBAL' | 'FINANCIAL_CORE' | 'MUNICIPAL_ASSET';
  ruleExpression: string;
  description: string;
  enforcement: 'INTERCEPT_PRE_SYSCALL' | 'REVOKE_LEASE' | 'ISOLATE_ARTIFACT';
  enabled: boolean;
}

export interface EvidenceGateTriageEvent {
  id: string;
  alertId: string;
  verdict: 'CONFIRMED_TRUE_POSITIVE' | 'FILTERED_FALSE_POSITIVE' | 'INSUFFICIENT_EVIDENCE';
  confidenceScore: number;
  vulnerabilityType: string;
  reasoningSteps: string[];
  attackScenario?: string;
  sanitizationEvidence?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  provenanceDigest: string;
  merkleEpoch: number;
  timestamp: string;
}

export interface ThreePillarStatus {
  glassFloor: {
    status: 'OPTIMAL_ZERO_STATE' | 'INTERCEPTING';
    syscallsDispatched: 0;
    computeCostSunk: 0;
    stateLeakage: '0.00%';
  };
  substrateRouter: {
    status: 'QUORUM_LOCKED' | 'DEGRADED';
    nodesOnline: number;
    latencyMs: number;
    splitBrainDetected: boolean;
    zeroEgressEnforced: boolean;
  };
  evidenceGate: {
    status: 'ACTIVE_TRIAGE' | 'PENALTY_DOWNRANKED';
    verifiedCount: number;
    falsePositiveSuppressionRate: string;
    cotMandateDepth: number;
    latestDigest: string;
  };
}

export interface LatencyPercentiles {
  minMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  meanMs: number;
}

export interface LoadTestReport {
  timestamp: string;
  config: {
    totalAlerts: number;
    concurrencyLimit: number;
    adversarialRatio: number;
    syntheticCanaryRatio: number;
    ambiguousRatio: number;
  };
  totalProcessed: number;
  successfulTriages: number;
  failedValidations: number;
  verdictDistribution: {
    confirmedTruePositive: number;
    filteredFalsePositive: number;
    insufficientEvidence: number;
  };
  durationMs: number;
  throughputPerSecond: number;
  latencies: LatencyPercentiles;
  doraLeadTimeImpact: {
    estimatedCiDelaySeconds: number;
    verdict: 'NEGLIGIBLE_CI_IMPACT' | 'MODERATE_CI_DELAY' | 'PIPELINE_BOTTLENECK';
    recommendedConcurrency: number;
  };
  invariants: {
    totalSyscallsDispatched: 0;
    totalComputeCostSunk: 0;
    stateLeakagePercentage: '0.00%';
    merkleRootIntegrityPassed: boolean;
  };
}

export type LeaseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'TRIPWIRE_TRIGGERED';

export type RevocationReason = 
  | 'TTL_EXPIRED'
  | 'MAX_INVOCATIONS_EXHAUSTED'
  | 'COROSYNC_QUORUM_LOSS'
  | 'GLASS_FLOOR_INTERCEPT'
  | 'SPLIT_BRAIN_ANOMALY'
  | 'AIRGAP_VIOLATION'
  | 'MANUAL_QUARANTINE';

export interface CapabilityLease {
  leaseId: string;
  substrateId: string;
  capabilities: string[];
  issuedAt: number;
  expiresAt: number;
  ttlSeconds: number;
  maxInvocations: number;
  invocationsConsumed: number;
  status: LeaseStatus;
  revocationReason?: RevocationReason;
  revokedAt?: number;
  tripwireRules: string[];
  leaseDigest: string;
}

export interface StateLeaf {
  leafId: string;
  leafType: 'POLICY_LEASE' | 'EVIDENCE_GATE_VERDICT' | 'CLUSTER_NODE_HEARTBEAT' | 'GLASS_FLOOR_INTERCEPT';
  data: Record<string, unknown>;
  timestamp: number;
}

export interface ProofStep {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleAuditProof {
  leafId: string;
  leafHash: string;
  auditPath: ProofStep[];
  expectedRoot: string;
  verified: boolean;
  treeSize: number;
  domainSeparation: {
    leafPrefix: '0x00';
    interiorPrefix: '0x01';
    balancingRule: 'RFC_6962_PROMOTION';
  };
}

export interface NodeAttestationSignature {
  nodeId: string;
  signature: string;
  timestamp: number;
  stateRoot: string;
}

export interface EpochAttestationConsensus {
  epoch: number;
  stateRoot: string;
  totalNodes: number;
  quorumRequired: number;
  signatures: NodeAttestationSignature[];
  quorumAchieved: boolean;
  byzantineFaultToleranceVerified: boolean;
}

// -------------------------------------------------------------
// Tenant Identity, Capabilities & Capital Share Metering Types
// -------------------------------------------------------------

export type SubscriptionTier = 'COMMUNITY_FREE' | 'GROWTH_METERED' | 'SOVEREIGN_ENTERPRISE';

export type TenantState = 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';

export interface TenantStateTransitionEvent {
  readonly transitionId: string;
  readonly tenantId: string;
  readonly fromState: TenantState;
  readonly toState: TenantState;
  readonly actor: string;
  readonly reason: string;
  readonly timestamp: number;
}

export interface AccountingLedgerEntry {
  readonly eventId: string;
  readonly tenantId: string;
  readonly requestId: string;
  readonly providerEventId: string;
  readonly operation: 'WEBHOOK_INGEST_TRIAGE' | 'TOP_UP_DEPOSIT' | 'ADMIN_ADJUSTMENT';
  readonly creditsConsumed: number;
  readonly unitPriceNzd: number;
  readonly currency: 'NZD';
  readonly balanceBefore: number;
  readonly balanceAfter: number;
  readonly timestamp: number;
  readonly status: 'COMMITTED' | 'REVERTED';
  readonly metadata: Record<string, unknown>;
}

export interface IdempotencyRecord {
  readonly idempotencyKey: string;
  readonly tenantId: string;
  readonly status: 'RESERVED' | 'COMMITTED' | 'FAILED';
  readonly accountingEventId?: string;
  readonly cachedResultJson?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface DeterministicPolicyDecision {
  readonly authorizedAction: 'DISPATCH_PR_BLOCK' | 'SUPPRESS_FALSE_POSITIVE' | 'ESCALATE_HUMAN_TRIAGE' | 'REJECT_SUSPICIOUS_PAYLOAD';
  readonly policyRuleId: string;
  readonly isEnforced: boolean;
  readonly reasoning: string;
  readonly deterministicDigest: string;
  readonly timestamp: string;
}

export type TenantCapability = 
  | 'CAP_INGEST_WEBHOOKS'          // Submit raw alerts from GitHub/Datadog/SIEM
  | 'CAP_EVIDENCE_GATE_TRIAGE'     // Run CoT AI Evidence Gate triage
  | 'CAP_MERKLE_STATE_ATTESTATION' // Sign & verify Merkle state epoch roots
  | 'CAP_PROXMOX_CLUSTER_DISPATCH' // Dispatch workloads to local Proxmox substrate
  | 'CAP_AIRGAP_ENCLAVE_CONTROL';  // Issue dynamic policy leases in zero-egress enclaves

export interface TenantIdentity {
  readonly tenantId: string;
  readonly orgName: string;
  readonly tier: SubscriptionTier;
  readonly capabilities: readonly TenantCapability[];
  readonly billingCurrency: 'NZD' | 'USD';
  readonly unitCostPerAlertNzd: number; // e.g. 0.025 NZD
  readonly rateLimitRps: number;        // e.g. 100 RPS burst cap
  readonly keyHash: string;             // Salted SHA-256 hash of API key
  readonly state: TenantState;          // Formally tracked tenant state
  readonly isSuspended: boolean;
  readonly createdAt: number;
}

export interface TenantUsageState {
  readonly tenantId: string;
  availableCredits: number;
  totalTriagedCount: number;
  unbilledAccrualNzd: number;
  lastActiveTimestamp: number;
  lastFlushedTimestamp: number;
}

export type QuotaErrorCode = 
  | 'UNAUTHORIZED_KEY'
  | 'CAPABILITY_MISSING'
  | 'QUOTA_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'TENANT_SUSPENDED';

export interface TenantQuotaResult {
  readonly authorized: boolean;
  readonly tenantId?: string;
  readonly tier?: SubscriptionTier;
  readonly remainingCredits?: number;
  readonly costNzd?: number;
  readonly errorCode?: QuotaErrorCode;
  readonly message?: string;
  readonly evaluationTimeMs?: number;
}

export interface TenantApiKeyIssuance {
  readonly rawApiKey: string;
  readonly tenant: TenantIdentity;
  readonly initialCredits: number;
}



