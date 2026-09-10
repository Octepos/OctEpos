import test, { describe } from 'node:test';
import assert from 'node:assert';
import { PolicyLeaseManager } from '../src/security/PolicyLeaseManager';
import { GlassFloorInterceptor, IntentPayload } from '../src/security/GlassFloorInterceptor';
import { SubstrateRouter, ProxmoxClusterState } from '../src/security/SubstrateRouter';

describe('OCTEPOS Dynamic Policy Lease - Auto-Revocation & Invariant Constraints', () => {
  test('Issues ephemeral lease with valid RFC 8785 canonical hash', () => {
    const leaseManager = new PolicyLeaseManager();
    const lease = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 15,
      maxInvocations: 3
    });

    assert.strictEqual(lease.status, 'ACTIVE');
    assert.strictEqual(lease.invocationsConsumed, 0);
    assert.strictEqual(lease.maxInvocations, 3);
    assert.ok(lease.leaseDigest.startsWith('0x'));
    assert.strictEqual(lease.leaseDigest.length, 66); // 0x + 64 hex chars
  });

  test('Enforces invocation cap auto-revocation when quota is exhausted', () => {
    const leaseManager = new PolicyLeaseManager();
    const lease = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 30,
      maxInvocations: 2
    });

    // Invocations 1 & 2 succeed
    const after1 = leaseManager.claimInvocation(lease.leaseId, 'READ_STATE');
    assert.strictEqual(after1.invocationsConsumed, 1);
    assert.strictEqual(after1.status, 'ACTIVE');

    const after2 = leaseManager.claimInvocation(lease.leaseId, 'READ_STATE');
    assert.strictEqual(after2.invocationsConsumed, 2);
    assert.strictEqual(after2.status, 'REVOKED');
    assert.strictEqual(after2.revocationReason, 'MAX_INVOCATIONS_EXHAUSTED');

    // Invocation 3 must be strictly rejected
    assert.throws(() => {
      leaseManager.claimInvocation(lease.leaseId, 'READ_STATE');
    }, /LEASE_REVOKED.*MAX_INVOCATIONS_EXHAUSTED/);
  });

  test('Enforces hard monotonic TTL expiration', async () => {
    const leaseManager = new PolicyLeaseManager();
    // Issue a micro-TTL lease (1 second)
    const lease = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 1,
      maxInvocations: 10
    });

    // Immediate invocation succeeds
    assert.doesNotThrow(() => {
      leaseManager.claimInvocation(lease.leaseId, 'READ_STATE');
    });

    // Wait 1100ms for TTL expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Subsequent invocation must be trapped by TTL expiry
    assert.throws(() => {
      leaseManager.claimInvocation(lease.leaseId, 'READ_STATE');
    }, /LEASE_EXPIRED/);

    const expiredLease = leaseManager.getLease(lease.leaseId);
    assert.strictEqual(expiredLease?.status, 'EXPIRED');
    assert.strictEqual(expiredLease?.revocationReason, 'TTL_EXPIRED');
  });

  test('Tripwire cascade instantly invalidates all active leases upon cluster anomaly', () => {
    const leaseManager = new PolicyLeaseManager();
    const lease1 = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 45
    });
    const lease2 = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['EMIT_TELEMETRY'],
      ttlSeconds: 45
    });

    assert.strictEqual(lease1.status, 'ACTIVE');
    assert.strictEqual(lease2.status, 'ACTIVE');

    // Trigger tripwire anomaly
    const revoked = leaseManager.triggerTripwireCascade('COROSYNC_QUORUM_LOSS');
    assert.ok(revoked.length >= 2);

    assert.strictEqual(leaseManager.getLease(lease1.leaseId)?.status, 'TRIPWIRE_TRIGGERED');
    assert.strictEqual(leaseManager.getLease(lease2.leaseId)?.status, 'TRIPWIRE_TRIGGERED');

    // Execution attempts are rejected immediately
    assert.throws(() => {
      leaseManager.claimInvocation(lease1.leaseId, 'READ_STATE');
    }, /LEASE_REVOKED.*COROSYNC_QUORUM_LOSS/);
  });

  test('Integrates with Glass Floor Interceptor: preserves zero-syscall invariant on rejected lease', () => {
    const leaseManager = new PolicyLeaseManager();
    const glassFloor = new GlassFloorInterceptor(leaseManager);

    const lease = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 30,
      maxInvocations: 1
    });

    const validIntent: IntentPayload = {
      action: 'READ_TELEMETRY',
      target: 'proc/status',
      parameters: {},
      capabilities: ['READ_STATE'],
      leaseId: lease.leaseId
    };

    // First invocation passes with zero-syscall baseline
    const baseline = glassFloor.evaluateIntent(validIntent);
    assert.strictEqual(baseline.syscallsDispatched, 0);
    assert.strictEqual(baseline.computeCost, 0);
    assert.strictEqual(baseline.stateLeakage, '0.00%');

    // Second invocation exceeds maxInvocations -> Glass Floor halts pre-syscall
    assert.throws(() => {
      glassFloor.evaluateIntent(validIntent);
    }, /GLASS_FLOOR_VIOLATION.*MAX_INVOCATIONS_EXHAUSTED/);
  });

  test('Integrates with Substrate Router: cluster split-brain auto-revokes leases via tripwire', async () => {
    const leaseManager = new PolicyLeaseManager();
    const router = new SubstrateRouter(leaseManager);

    const lease = leaseManager.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE'],
      ttlSeconds: 60
    });

    const splitBrainState: ProxmoxClusterState = {
      nodesOnline: 2,
      latencyMs: 1.1,
      splitBrainDetected: true
    };

    const intent: IntentPayload = {
      action: 'EXECUTE_COMPUTE',
      target: 'local_lxc',
      parameters: {},
      capabilities: ['READ_STATE'],
      leaseId: lease.leaseId
    };

    // Router must reject dispatch
    await assert.rejects(async () => {
      await router.dispatchToLocalCluster(intent, splitBrainState);
    }, /SUBSTRATE_ROUTING_FAULT.*Split-brain/);

    // Tripwire must have revoked the lease automatically
    const checkedLease = leaseManager.getLease(lease.leaseId);
    assert.strictEqual(checkedLease?.status, 'TRIPWIRE_TRIGGERED');
    assert.strictEqual(checkedLease?.revocationReason, 'SPLIT_BRAIN_ANOMALY');
  });
});
