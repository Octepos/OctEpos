import { canonicalize } from 'json-canonicalize';
import { createHash } from 'crypto';

export type TriageVerdict = 'CONFIRMED_TRUE_POSITIVE' | 'FILTERED_FALSE_POSITIVE' | 'INSUFFICIENT_EVIDENCE';
export type TriageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EvidenceGateCandidateAlert {
  alertId: string;
  sourceTool: 'SAST' | 'COROSYNC_MONITOR' | 'REFERENCE_MONITOR' | 'GITHUB_CODEQL' | 'DATADOG_MONITOR' | 'SPLUNK_SIEM' | 'GENERIC_WEBHOOK';
  ruleId: string;
  sourcePath: string;
  codeSnippet: string;
  context?: Record<string, unknown>;
}

export interface StructuredEvidenceOutput {
  verdict: TriageVerdict;
  confidenceScore: number; // 0.00 to 1.00
  vulnerabilityType: string;
  reasoningSteps: string[]; // Chain-of-Thought (CoT) mandate
  attackScenario?: string;
  sanitizationEvidence?: string;
  riskLevel: TriageSeverity;
  provenanceDigest: string; // RFC 8785 canonical hash
  timestamp: string;
}

export interface RawEvidencePayload {
  verdict?: unknown;
  confidenceScore?: unknown;
  vulnerabilityType?: unknown;
  reasoningSteps?: unknown;
  attackScenario?: unknown;
  sanitizationEvidence?: unknown;
  riskLevel?: unknown;
}

export class EvidenceGateValidator {
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.65;
  private readonly MIN_COT_STEPS = 2;

  /**
   * Programmatic validation loop for LLM Evidence Gate outputs.
   * Enforces strict schema, CoT array depth, confidence bounds, and RFC 8785 provenance.
   */
  public validate(raw: RawEvidencePayload): StructuredEvidenceOutput {
    if (!raw || typeof raw !== 'object') {
      throw new Error('EVIDENCE_GATE_SCHEMA_FAULT: Output payload must be a non-null object.');
    }

    // 1. Validate Chain of Thought (CoT) mandates
    if (!Array.isArray(raw.reasoningSteps) || raw.reasoningSteps.length < this.MIN_COT_STEPS) {
      throw new Error(
        `EVIDENCE_GATE_COT_VIOLATION: Chain of Thought mandate violated. Expected at least ${this.MIN_COT_STEPS} analytical reasoning steps.`
      );
    }

    const sanitizedSteps = raw.reasoningSteps.map(step => {
      if (typeof step !== 'string' || step.trim().length === 0) {
        throw new Error('EVIDENCE_GATE_COT_VIOLATION: Reasoning steps must be non-empty strings.');
      }
      return step.trim();
    });

    // 2. Validate Confidence Score range [0.0, 1.0]
    const confidence = Number(raw.confidenceScore);
    if (isNaN(confidence) || confidence < 0.0 || confidence > 1.0) {
      throw new Error('EVIDENCE_GATE_SCHEMA_FAULT: confidenceScore must be a number between 0.00 and 1.00.');
    }

    // 3. Validate Verdict and Penalty Directives
    const validVerdicts: TriageVerdict[] = [
      'CONFIRMED_TRUE_POSITIVE',
      'FILTERED_FALSE_POSITIVE',
      'INSUFFICIENT_EVIDENCE'
    ];
    let verdict = raw.verdict as TriageVerdict;

    if (!validVerdicts.includes(verdict)) {
      throw new Error(`EVIDENCE_GATE_SCHEMA_FAULT: Invalid verdict '${String(raw.verdict)}'.`);
    }

    // Penalty Directive: If confidence is below threshold, model must abstain / downgrade to INSUFFICIENT_EVIDENCE
    if (confidence < this.MIN_CONFIDENCE_THRESHOLD && verdict === 'CONFIRMED_TRUE_POSITIVE') {
      verdict = 'INSUFFICIENT_EVIDENCE';
    }

    // 4. Validate Vulnerability Type and Severity
    if (typeof raw.vulnerabilityType !== 'string' || raw.vulnerabilityType.trim().length === 0) {
      throw new Error('EVIDENCE_GATE_SCHEMA_FAULT: vulnerabilityType must be a non-empty string.');
    }

    const validSeverities: TriageSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const riskLevel = validSeverities.includes(raw.riskLevel as TriageSeverity)
      ? (raw.riskLevel as TriageSeverity)
      : 'MEDIUM';

    // 5. Generate RFC 8785 Canonical Provenance Digest
    const canonicalPayload = {
      confidenceScore: Math.round(confidence * 1000) / 1000,
      reasoningSteps: sanitizedSteps,
      riskLevel,
      verdict,
      vulnerabilityType: raw.vulnerabilityType.trim()
    };

    const canonicalJson = canonicalize(canonicalPayload);
    const provenanceDigest = '0x' + createHash('sha256').update(canonicalJson).digest('hex');

    return {
      verdict,
      confidenceScore: canonicalPayload.confidenceScore,
      vulnerabilityType: canonicalPayload.vulnerabilityType,
      reasoningSteps: sanitizedSteps,
      attackScenario: typeof raw.attackScenario === 'string' ? raw.attackScenario.trim() : undefined,
      sanitizationEvidence: typeof raw.sanitizationEvidence === 'string' ? raw.sanitizationEvidence.trim() : undefined,
      riskLevel,
      provenanceDigest,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Constructs the strict system prompt for the Evidence Gate LLM.
   */
  public generateSystemPrompt(alert: EvidenceGateCandidateAlert): string {
    return `You are the OCTEPOS Evidence Gate Security Auditor.
Your task is to triage a candidate SAST/policy finding with zero ambient authority.

CANDIDATE ALERT:
- Rule ID: ${alert.ruleId}
- Source: ${alert.sourceTool} (${alert.sourcePath})
- Code Snippet:
${alert.codeSnippet}

STRICT INVARIANTS:
1. You MUST populate "reasoningSteps" with at least 2 rigorous, sequential analytical steps evaluating data flow and sanitization BEFORE concluding your verdict.
2. If there is insufficient contextual evidence to confirm exploitability or sanitization, you MUST set "confidenceScore" < 0.65 and "verdict": "INSUFFICIENT_EVIDENCE".
3. Return ONLY valid JSON adhering strictly to this schema:
{
  "verdict": "CONFIRMED_TRUE_POSITIVE" | "FILTERED_FALSE_POSITIVE" | "INSUFFICIENT_EVIDENCE",
  "confidenceScore": number (0.0 to 1.0),
  "vulnerabilityType": string (e.g. "OWASP API3: BOPLA", "PATH_TRAVERSAL"),
  "reasoningSteps": string[] (minimum 2 detailed steps),
  "attackScenario": string (optional),
  "sanitizationEvidence": string (optional),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}`;
  }
}
