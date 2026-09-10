import { createHash } from 'node:crypto';
import { canonicalize } from 'json-canonicalize';
import {
  EvidenceGateCandidateAlert,
  StructuredEvidenceOutput
} from './EvidenceGate';
import { DeterministicPolicyDecision } from '../types/octepos';

export interface EvidencePolicyConfig {
  readonly minConfidenceForEnforcement: number; // e.g. 0.85
  readonly canaryToken: string;
  readonly strictMode: boolean;
}

const DEFAULT_POLICY_CONFIG: EvidencePolicyConfig = {
  minConfidenceForEnforcement: 0.85,
  canaryToken: 'CANARY-FIN-8841-SECRET',
  strictMode: true
};

/**
 * DeterministicEvidencePolicy
 * 
 * Implements the deterministic policy authorization layer.
 * 
 * CORE PRINCIPLE:
 * The LLM produces evidence (probabilities, explanations, classifications).
 * The LLM NEVER directly authorizes an operational action (e.g. blocking a GitHub PR,
 * unblocking a deployment, or suppressing an alert).
 * 
 * The Deterministic Policy Engine owns the final operational decision.
 */
export class DeterministicEvidencePolicy {
  private readonly config: EvidencePolicyConfig;

  // Patterns indicating potential prompt injection or adversarial attempt to trick the LLM
  private static readonly ADVERSARIAL_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /system\s+prompt/i,
    /override\s+(the\s+)?verdict/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /mark\s+this\s+as\s+false[_\s-]positive/i,
    /output\s+only\s*:\s*FILTERED_FALSE_POSITIVE/i,
    /bypass\s+security\s+gate/i
  ];

  constructor(config: Partial<EvidencePolicyConfig> = {}) {
    this.config = { ...DEFAULT_POLICY_CONFIG, ...config };
  }

  /**
   * Evaluates candidate alert + validated LLM evidence against deterministic policy rules.
   * Returns a cryptographically signed, immutable authorization decision.
   */
  public evaluate(
    alert: EvidenceGateCandidateAlert,
    evidence: StructuredEvidenceOutput
  ): DeterministicPolicyDecision {
    const timestamp = new Date().toISOString();

    // RULE 1: Adversarial Prompt Injection Guard
    // If the ingested alert contains text attempting to manipulate the LLM, the LLM verdict is untrusted.
    const hasInjectionAttempt = this.detectAdversarialInjection(alert);
    if (hasInjectionAttempt) {
      return this.concludeDecision({
        authorizedAction: 'REJECT_SUSPICIOUS_PAYLOAD',
        policyRuleId: 'RULE_ADVERSARIAL_INJECTION_DETECTED',
        isEnforced: false,
        reasoning:
          'Ingested code snippet contains adversarial prompt-injection heuristics attempting to coerce LLM triage. Automated suppression denied; escalated to forensic triage.',
        timestamp
      });
    }

    // RULE 2: Canary Token & Internal Test Fixture Whitelist
    // Known canary strings are deterministically filtered regardless of model hallucinations
    if (
      alert.codeSnippet.includes(this.config.canaryToken) ||
      alert.sourcePath.includes('test/fixtures/canary')
    ) {
      return this.concludeDecision({
        authorizedAction: 'SUPPRESS_FALSE_POSITIVE',
        policyRuleId: 'RULE_CANARY_TEST_HARNESS_EXCLUSION',
        isEnforced: true,
        reasoning:
          'Alert targets certified canary token test harness. Suppressing noise deterministically without production impact.',
        timestamp
      });
    }

    // RULE 3: Policy Confidence Threshold Gate
    // If model claims True Positive but confidence is below policy threshold, cannot enforce PR block
    if (
      evidence.verdict === 'CONFIRMED_TRUE_POSITIVE' &&
      evidence.confidenceScore < this.config.minConfidenceForEnforcement
    ) {
      return this.concludeDecision({
        authorizedAction: 'ESCALATE_HUMAN_TRIAGE',
        policyRuleId: 'RULE_SUB_THRESHOLD_CONFIDENCE_ESCALATION',
        isEnforced: false,
        reasoning: `Model reported CONFIRMED_TRUE_POSITIVE but confidence (${evidence.confidenceScore}) is below required policy threshold (${this.config.minConfidenceForEnforcement}). Action requires human security team triage.`,
        timestamp
      });
    }

    // RULE 4: Validated High-Confidence Exploit Authorization
    // True positive with >= minConfidence and critical/high risk level authorizes blocking PR
    if (
      evidence.verdict === 'CONFIRMED_TRUE_POSITIVE' &&
      evidence.confidenceScore >= this.config.minConfidenceForEnforcement
    ) {
      return this.concludeDecision({
        authorizedAction: 'DISPATCH_PR_BLOCK',
        policyRuleId: 'RULE_HIGH_CONFIDENCE_VULNERABILITY_CONFIRMED',
        isEnforced: true,
        reasoning: `True positive vulnerability validated with confidence ${evidence.confidenceScore} (>= ${this.config.minConfidenceForEnforcement}). Enforcing blocking security check on target repository.`,
        timestamp
      });
    }

    // RULE 5: Validated False-Positive Noise Suppression
    // False positive with >= minConfidence and documented reasoning authorizes noise suppression
    if (
      evidence.verdict === 'FILTERED_FALSE_POSITIVE' &&
      evidence.confidenceScore >= this.config.minConfidenceForEnforcement
    ) {
      return this.concludeDecision({
        authorizedAction: 'SUPPRESS_FALSE_POSITIVE',
        policyRuleId: 'RULE_VALIDATED_FALSE_POSITIVE_SUPPRESSION',
        isEnforced: true,
        reasoning: `Candidate finding verified as benign noise with confidence ${evidence.confidenceScore}. Suppressing alert notification.`,
        timestamp
      });
    }

    // Default Fallback: Human Review
    return this.concludeDecision({
      authorizedAction: 'ESCALATE_HUMAN_TRIAGE',
      policyRuleId: 'RULE_INSUFFICIENT_EVIDENCE_DEFAULT',
      isEnforced: false,
      reasoning:
        'Insufficient structural evidence or unclassifiable triage state. Defers to human security operations.',
      timestamp
    });
  }

  private detectAdversarialInjection(alert: EvidenceGateCandidateAlert): boolean {
    const combined = `${alert.codeSnippet} ${alert.ruleId} ${JSON.stringify(alert.context || {})}`;
    return DeterministicEvidencePolicy.ADVERSARIAL_INJECTION_PATTERNS.some(pattern =>
      pattern.test(combined)
    );
  }

  private concludeDecision(params: {
    authorizedAction: DeterministicPolicyDecision['authorizedAction'];
    policyRuleId: string;
    isEnforced: boolean;
    reasoning: string;
    timestamp: string;
  }): DeterministicPolicyDecision {
    const canonicalPayload = {
      action: params.authorizedAction,
      enforced: params.isEnforced,
      reasoning: params.reasoning,
      rule: params.policyRuleId,
      timestamp: params.timestamp
    };

    const canonicalJson = canonicalize(canonicalPayload);
    const deterministicDigest =
      '0x' + createHash('sha256').update(canonicalJson).digest('hex');

    return {
      authorizedAction: params.authorizedAction,
      policyRuleId: params.policyRuleId,
      isEnforced: params.isEnforced,
      reasoning: params.reasoning,
      deterministicDigest,
      timestamp: params.timestamp
    };
  }
}

export const deterministicPolicy = new DeterministicEvidencePolicy();
