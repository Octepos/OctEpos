import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GlassFloorInterceptor, IntentPayload } from '../src/security/GlassFloorInterceptor';
import { canonicalize } from 'json-canonicalize';
import { createHash } from 'crypto';

describe('OCTEPOS Glass Floor Deterministic Invariant Suite', () => {
  const interceptor = new GlassFloorInterceptor();

  describe('Zero-State Invariant Baseline', () => {
    it('returns pristine zero-state metrics when capabilities and payload are fully authorized', () => {
      const authorizedPayload: IntentPayload = {
        action: 'READ_TELEMETRY',
        target: 'system/metrics/current',
        parameters: { epoch: 4892, filter: 'CANARY' },
        capabilities: ['READ_STATE', 'EMIT_TELEMETRY']
      };

      const invariantResult = interceptor.evaluateIntent(authorizedPayload);

      assert.deepEqual(invariantResult, {
        syscallsDispatched: 0,
        computeCost: 0,
        stateLeakage: '0.00%'
      });
    });
  });

  describe('Zero Ambient Authority Enforcement', () => {
    it('strictly rejects execution when capabilities array is empty (no default permissions)', () => {
      const ambientPayload: IntentPayload = {
        action: 'READ_TELEMETRY',
        target: 'system/metrics/current',
        parameters: {},
        capabilities: []
      };

      assert.throws(
        () => interceptor.evaluateIntent(ambientPayload),
        (error: Error) => {
          assert.match(error.message, /GLASS_FLOOR_VIOLATION: Zero Ambient Authority enforced/);
          return true;
        }
      );
    });

    it('rejects unapproved or inflated capabilities with insufficient clearance', () => {
      const escalatedPayload: IntentPayload = {
        action: 'EXECUTE_QUERY',
        target: 'finance/ledger',
        parameters: { query: 'SELECT *' },
        capabilities: ['READ_STATE', 'ROOT_SYS_CALL']
      };

      assert.throws(
        () => interceptor.evaluateIntent(escalatedPayload),
        (error: Error) => {
          assert.match(error.message, /Capability ROOT_SYS_CALL rejected\. Insufficient clearance/);
          return true;
        }
      );
    });
  });

  describe('Pre-Syscall Structural Payload Integrity', () => {
    it('traps path traversal attempts pre-syscall (e.g. ../ directory traversal)', () => {
      const traversalPayload: IntentPayload = {
        action: 'READ_STATE',
        target: '../../etc/shadow',
        parameters: { flags: 'O_RDONLY' },
        capabilities: ['READ_STATE']
      };

      assert.throws(
        () => interceptor.evaluateIntent(traversalPayload),
        (error: Error) => {
          assert.match(error.message, /GLASS_FLOOR_VIOLATION: Malicious intent detected pre-syscall/);
          return true;
        }
      );
    });

    it('traps unauthorized ledger mutation actions before dispatching to persistent storage', () => {
      const mutationPayload: IntentPayload = {
        action: 'MUTATE_LEDGER',
        target: 'accounts/master/credit_limit',
        parameters: { delta: 750000 },
        capabilities: ['READ_STATE']
      };

      assert.throws(
        () => interceptor.evaluateIntent(mutationPayload),
        (error: Error) => {
          assert.match(error.message, /GLASS_FLOOR_VIOLATION: Malicious intent detected pre-syscall/);
          return true;
        }
      );
    });
  });

  describe('RFC 8785 Canonical Provenance Audit Attestation', () => {
    it('generates deterministic SHA-256 audit digest invariant to object key ordering', () => {
      const payloadA: IntentPayload = {
        action: 'READ_STATE',
        target: 'vfs/storage/asset01',
        parameters: { alpha: 1, beta: 'test', gamma: [1, 2, 3] },
        capabilities: ['READ_STATE']
      };

      const payloadB: IntentPayload = {
        capabilities: ['READ_STATE'],
        target: 'vfs/storage/asset01',
        action: 'READ_STATE',
        parameters: { gamma: [1, 2, 3], beta: 'test', alpha: 1 }
      };

      const hashA = interceptor.generateProvenanceAudit(payloadA, 'TEST_AUDIT');
      const hashB = interceptor.generateProvenanceAudit(payloadB, 'TEST_AUDIT');

      // Must be byte-for-byte identical under RFC 8785 normalization
      assert.equal(hashA, hashB);
      assert.equal(hashA.length, 64);
      assert.match(hashA, /^[0-9a-f]{64}$/);

      // Verify manual canonicalization matches
      const expectedCanonical = canonicalize(payloadA);
      const expectedHash = createHash('sha256').update(expectedCanonical).digest('hex');
      assert.equal(hashA, expectedHash);
    });
  });
});
