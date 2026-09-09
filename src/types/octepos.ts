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
