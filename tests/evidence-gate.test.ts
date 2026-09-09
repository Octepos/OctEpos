import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EvidenceGateValidator,
  RawEvidencePayload,
  EvidenceGateCandidateAlert
} from '../src/EvidenceGate';
import { canonicalize } from 'json-canonicalize';
import { createHash } from 'crypto';

describe('OCTEPOS Evidence Gate - Structured Output & Programmatic Validation Suite', () => {
  const validator = new EvidenceGateValidator();

  const validAlert: EvidenceGateCandidateAlert = {
    alertId: 'SAST-ALERT-8902',
    sourceTool: 'SAST',
    ruleId: 'OWASP_API3_BOPLA',
    sourcePath: 'src/controllers/account.controller.ts',
    codeSnippet: 'const { role, balance, ...safe } = req.body; Object.assign(user, req.body);'
  };

  describe('Strict JSON Schema & Chain-of-Thought (CoT) Enforcement', () => {
    it('successfully validates compliant LLM triage output with valid CoT reasoning steps', () => {
      const validPayload: RawEvidencePayload = {
        verdict: 'CONFIRMED_TRUE_POSITIVE',
        confidenceScore: 0.94,
        vulnerabilityType: 'OWASP API3: Broken Object Property Level Authorization (Mass Assignment)',
        reasoningSteps: [
          'Tainted input originates from req.body and flows directly into Object.assign without whitelist filtering.',
          'Attack vector allows malicious actor to override user.role and user.balance parameters, bypassing privilege barriers.'
        ],
        attackScenario: 'POST /api/users/profile with {"role": "SUPERADMIN"} promotes user without authorization.',
        sanitizationEvidence: 'None. Deconstruction was attempted on line 1 but all properties in req.body were applied.',
        riskLevel: 'HIGH'
      };

      const result = validator.validate(validPayload);

      assert.equal(result.verdict, 'CONFIRMED_TRUE_POSITIVE');
      assert.equal(result.confidenceScore, 0.94);
      assert.equal(result.reasoningSteps.length, 2);
      assert.match(result.provenanceDigest, /^0x[0-9a-f]{64}$/);
    });

    it('rejects output when Chain of Thought mandate is breached (< 2 reasoning steps)', () => {
      const prematurePayload: RawEvidencePayload = {
        verdict: 'CONFIRMED_TRUE_POSITIVE',
        confidenceScore: 0.92,
        vulnerabilityType: 'SQL_INJECTION',
        reasoningSteps: ['It looks vulnerable without further tracing.'] // Only 1 step!
      };

      assert.throws(
        () => validator.validate(prematurePayload),
        (error: Error) => {
          assert.match(
            error.message,
            /EVIDENCE_GATE_COT_VIOLATION: Chain of Thought mandate violated\. Expected at least 2 analytical reasoning steps/
          );
          return true;
        }
      );
    });

    it('rejects output when reasoning steps contain empty or whitespace-only strings', () => {
      const whitespaceCoTPayload: RawEvidencePayload = {
        verdict: 'CONFIRMED_TRUE_POSITIVE',
        confidenceScore: 0.88,
        vulnerabilityType: 'XSS',
        reasoningSteps: ['Valid analytical step.', '   ']
      };

      assert.throws(
        () => validator.validate(whitespaceCoTPayload),
        (error: Error) => {
          assert.match(
            error.message,
            /EVIDENCE_GATE_COT_VIOLATION: Reasoning steps must be non-empty strings/
          );
          return true;
        }
      );
    });
  });

  describe('Confidence Bounds & Penalty Directives', () => {
    it('rejects confidence scores outside [0.0, 1.0] mathematical range', () => {
      const outOfBoundsPayload: RawEvidencePayload = {
        verdict: 'CONFIRMED_TRUE_POSITIVE',
        confidenceScore: 1.45, // Invalid > 1.0
        vulnerabilityType: 'COMMAND_INJECTION',
        reasoningSteps: ['Step 1: Analyzed command sink.', 'Step 2: User input unsanitized.']
      };

      assert.throws(
        () => validator.validate(outOfBoundsPayload),
        (error: Error) => {
          assert.match(
            error.message,
            /EVIDENCE_GATE_SCHEMA_FAULT: confidenceScore must be a number between 0\.00 and 1\.00/
          );
          return true;
        }
      );
    });

    it('enforces penalty directive: down-ranks CONFIRMED_TRUE_POSITIVE to INSUFFICIENT_EVIDENCE when confidence < 0.65', () => {
      const weakEvidencePayload: RawEvidencePayload = {
        verdict: 'CONFIRMED_TRUE_POSITIVE',
        confidenceScore: 0.52, // Below 0.65 confidence threshold
        vulnerabilityType: 'POSSIBLE_SSRF',
        reasoningSteps: [
          'External URL fetched via axios.',
          'Surrounding middleware not provided in prompt snippet, cannot verify if VPC perimeter blocks it.'
        ],
        riskLevel: 'LOW'
      };

      const result = validator.validate(weakEvidencePayload);

      // Must be safely downgraded to prevent false positive alert fatigue
      assert.equal(result.verdict, 'INSUFFICIENT_EVIDENCE');
      assert.equal(result.confidenceScore, 0.52);
    });
  });

  describe('RFC 8785 Canonical Provenance Audit', () => {
    it('guarantees identical SHA-256 provenance hash regardless of field evaluation order', () => {
      const payloadA: RawEvidencePayload = {
        verdict: 'FILTERED_FALSE_POSITIVE',
        confidenceScore: 0.98,
        vulnerabilityType: 'HARDCODED_SECRET_FALSE_ALARM',
        reasoningSteps: [
          'Value "CANARY-FIN-8841-SECRET" is an intentional synthetic canary token injected by reference monitor.',
          'Zero production credentials or private keys are exposed.'
        ],
        riskLevel: 'LOW'
      };

      const resultA = validator.validate(payloadA);

      // Verify digest matches expected RFC 8785 computation
      const expectedCanonical = canonicalize({
        confidenceScore: 0.98,
        reasoningSteps: [
          'Value "CANARY-FIN-8841-SECRET" is an intentional synthetic canary token injected by reference monitor.',
          'Zero production credentials or private keys are exposed.'
        ],
        riskLevel: 'LOW',
        verdict: 'FILTERED_FALSE_POSITIVE',
        vulnerabilityType: 'HARDCODED_SECRET_FALSE_ALARM'
      });
      const expectedDigest = '0x' + createHash('sha256').update(expectedCanonical).digest('hex');

      assert.equal(resultA.provenanceDigest, expectedDigest);
    });
  });

  describe('System Prompt Generation', () => {
    it('generates strict system prompt embedding alert details and schema constraints', () => {
      const prompt = validator.generateSystemPrompt(validAlert);

      assert.match(prompt, /OCTEPOS Evidence Gate Security Auditor/);
      assert.match(prompt, /OWASP_API3_BOPLA/);
      assert.match(prompt, /reasoningSteps/);
      assert.match(prompt, /INSUFFICIENT_EVIDENCE/);
    });
  });
});
