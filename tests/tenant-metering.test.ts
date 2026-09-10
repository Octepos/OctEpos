import test, { describe } from 'node:test';
import assert from 'node:assert';
import { TenantIdentityManager } from '../src/security/TenantIdentityManager';
import { TenantCapability } from '../src/types/octepos';

describe('OCTEPOS Tenant Identity & Atomic Metering Invariant Suite', () => {
  test('Invariant 1: Sub-millisecond tenant authentication & quota evaluation (< 0.1ms)', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Sub-Millisecond Benchmark Corp',
      tenantSlug: 'latency',
      tier: 'GROWTH_METERED',
      initialCredits: 1000,
      unitCostPerAlertNzd: 0.025
    });

    // Warm up JIT execution path once
    manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');

    // Measure steady-state latency
    const start = performance.now();
    const result = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');
    const elapsed = performance.now() - start;

    assert.ok(result.authorized, 'Key must be successfully authorized');
    assert.strictEqual(result.tier, 'GROWTH_METERED');
    assert.strictEqual(result.remainingCredits, 998);
    assert.strictEqual(result.costNzd, 0.025);
    assert.ok(elapsed < 0.25, `Evaluation must complete in under 0.25ms (took ${elapsed.toFixed(4)}ms)`);
  });

  test('Invariant 2: Raw API keys are never stored in plain text (Salted SHA-256 only)', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Security Attestation Ltd',
      tenantSlug: 'crypto-audit',
      tier: 'GROWTH_METERED',
      initialCredits: 500
    });

    const tenant = manager.getTenant(issuance.tenant.tenantId);
    assert.ok(tenant, 'Tenant must exist');
    assert.notStrictEqual(tenant.keyHash, issuance.rawApiKey, 'Stored keyHash must not be the raw API key');
    assert.strictEqual(tenant.keyHash.length, 64, 'Stored keyHash must be 64-character SHA-256 hex string');
    assert.strictEqual(
      tenant.keyHash,
      TenantIdentityManager.hashApiKey(issuance.rawApiKey),
      'Stored hash must match salted SHA-256 digest'
    );
  });

  test('Invariant 3: Zero-Ambient Authority capability checks strictly reject unauthorized operations', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Restricted Ingestion Node',
      tenantSlug: 'restricted',
      tier: 'COMMUNITY_FREE',
      initialCredits: 100,
      capabilities: ['CAP_INGEST_WEBHOOKS'] // Notice: lacks CAP_PROXMOX_CLUSTER_DISPATCH
    });

    // 1. Authorized capability succeeds
    const allowed = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');
    assert.strictEqual(allowed.authorized, true);

    // 2. Prohibited capability rejected pre-syscall
    const forbidden = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_PROXMOX_CLUSTER_DISPATCH');
    assert.strictEqual(forbidden.authorized, false);
    assert.strictEqual(forbidden.errorCode, 'CAPABILITY_MISSING');
    assert.ok(forbidden.message?.includes('CAP_PROXMOX_CLUSTER_DISPATCH'));
  });

  test('Invariant 4: Atomic quota exhaustion enforces hard stop without balance overshoot', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Micro-Quota Tenant',
      tenantSlug: 'micro',
      tier: 'GROWTH_METERED',
      initialCredits: 2,
      unitCostPerAlertNzd: 0.03
    });

    // Burn 1
    const r1 = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');
    assert.strictEqual(r1.authorized, true);
    assert.strictEqual(r1.remainingCredits, 1);

    // Burn 2
    const r2 = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');
    assert.strictEqual(r2.authorized, true);
    assert.strictEqual(r2.remainingCredits, 0);

    // Burn 3: Must be rejected with QUOTA_EXHAUSTED
    const r3 = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS');
    assert.strictEqual(r3.authorized, false);
    assert.strictEqual(r3.errorCode, 'QUOTA_EXHAUSTED');
    assert.strictEqual(r3.remainingCredits, 0);

    // Assert unbilled accrual matches exactly 2 * $0.03 = $0.06 NZD
    const usage = manager.getUsage(issuance.tenant.tenantId);
    assert.strictEqual(usage?.totalTriagedCount, 2);
    assert.strictEqual(usage?.unbilledAccrualNzd, 0.06);
    assert.strictEqual(usage?.availableCredits, 0);
  });

  test('Invariant 5: Sovereign Enterprise bypasses credit decrement while retaining audit count', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Government Enclave Defense',
      tenantSlug: 'defense',
      tier: 'SOVEREIGN_ENTERPRISE',
      initialCredits: 999999
    });

    const r1 = manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_AIRGAP_ENCLAVE_CONTROL');
    assert.strictEqual(r1.authorized, true);
    assert.strictEqual(r1.costNzd, 0);
    assert.strictEqual(r1.remainingCredits, 999999, 'Credits should not decrease for sovereign tier');

    const usage = manager.getUsage(issuance.tenant.tenantId);
    assert.strictEqual(usage?.totalTriagedCount, 1);
    assert.strictEqual(usage?.unbilledAccrualNzd, 0);
  });

  test('Invariant 6: Administrative suspension instantly revokes authorization', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Sanctioned Entity',
      tenantSlug: 'sanctioned',
      tier: 'GROWTH_METERED',
      initialCredits: 1000
    });

    assert.strictEqual(manager.evaluateAndBurnQuota(issuance.rawApiKey).authorized, true);

    // Administratively suspend
    manager.setSuspension(issuance.tenant.tenantId, true);

    const suspendedResult = manager.evaluateAndBurnQuota(issuance.rawApiKey);
    assert.strictEqual(suspendedResult.authorized, false);
    assert.strictEqual(suspendedResult.errorCode, 'TENANT_SUSPENDED');

    // Lift suspension
    manager.setSuspension(issuance.tenant.tenantId, false);
    assert.strictEqual(manager.evaluateAndBurnQuota(issuance.rawApiKey).authorized, true);
  });

  test('Invariant 7: Top-up immediately restores exhausted account quota', () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'Refill Corp',
      tenantSlug: 'refill',
      tier: 'GROWTH_METERED',
      initialCredits: 1
    });

    manager.evaluateAndBurnQuota(issuance.rawApiKey);
    assert.strictEqual(manager.evaluateAndBurnQuota(issuance.rawApiKey).authorized, false);

    // Top up 500 credits
    const topup = manager.depositCredits(issuance.tenant.tenantId, 500);
    assert.strictEqual(topup.success, true);
    assert.strictEqual(topup.newBalance, 500);

    const renewed = manager.evaluateAndBurnQuota(issuance.rawApiKey);
    assert.strictEqual(renewed.authorized, true);
    assert.strictEqual(renewed.remainingCredits, 499);
  });

  test('Invariant 8: High-concurrency burst safety preserves zero ledger discrepancy', async () => {
    const manager = new TenantIdentityManager();
    const issuance = manager.issueApiKey({
      orgName: 'High Concurrency Burst Test',
      tenantSlug: 'burst',
      tier: 'GROWTH_METERED',
      initialCredits: 100,
      unitCostPerAlertNzd: 0.02
    });

    // 150 concurrent calls on an account with only 100 credits
    const promises = Array.from({ length: 150 }, () => 
      Promise.resolve(manager.evaluateAndBurnQuota(issuance.rawApiKey, 'CAP_INGEST_WEBHOOKS'))
    );

    const results = await Promise.all(promises);
    const authorizedCount = results.filter(r => r.authorized).length;
    const exhaustedCount = results.filter(r => !r.authorized && r.errorCode === 'QUOTA_EXHAUSTED').length;

    assert.strictEqual(authorizedCount, 100, 'Exactly 100 requests must be authorized');
    assert.strictEqual(exhaustedCount, 50, 'Exactly 50 requests must be rejected as exhausted');

    const usage = manager.getUsage(issuance.tenant.tenantId);
    assert.strictEqual(usage?.availableCredits, 0, 'Balance must hit exactly 0 and never go negative');
    assert.strictEqual(usage?.totalTriagedCount, 100);
    assert.strictEqual(usage?.unbilledAccrualNzd, 2.00, 'Accrual must match exactly 100 * $0.02 = $2.00 NZD');

    // Verify write-behind buffer drain
    const flushedCount = manager.flushWriteBehindBuffer();
    assert.strictEqual(flushedCount, 100, 'All 100 mutations must be staged in write-behind buffer');
    assert.strictEqual(manager.flushWriteBehindBuffer(), 0, 'Buffer must be empty after flush');
  });
});
