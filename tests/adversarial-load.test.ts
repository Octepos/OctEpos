import test, { describe } from 'node:test';
import assert from 'node:assert';
import { AdversarialLoadHarness, LoadTestConfig } from '../src/security/AdversarialLoadHarness';

describe('OCTEPOS Adversarial Load & Stress Harness - DORA Lead Time & Concurrency Invariants', () => {
  const harness = new AdversarialLoadHarness();

  test('Batch generation respects distribution ratios and schema integrity', () => {
    const config: LoadTestConfig = {
      totalAlerts: 30,
      concurrencyLimit: 5,
      adversarialRatio: 0.5,
      syntheticCanaryRatio: 0.3,
      ambiguousRatio: 0.2
    };

    const batch = harness.generateAlertBatch(config);
    assert.strictEqual(batch.length, 30);

    for (const item of batch) {
      assert.ok(item.alert.alertId.startsWith('ALERT-LOAD-'));
      assert.ok(Array.isArray(item.payload.reasoningSteps) && item.payload.reasoningSteps.length >= 2, 'Must satisfy CoT >= 2 mandate');
      assert.ok(typeof item.payload.confidenceScore === 'number');
    }
  });

  test('Executes concurrent load test maintaining zero-syscall invariant', async () => {
    const config: LoadTestConfig = {
      totalAlerts: 40,
      concurrencyLimit: 8,
      adversarialRatio: 0.4,
      syntheticCanaryRatio: 0.4,
      ambiguousRatio: 0.2
    };

    const report = await harness.executeLoadTest(config);

    assert.strictEqual(report.totalProcessed, 40);
    assert.strictEqual(report.failedValidations, 0);
    assert.strictEqual(report.invariants.totalSyscallsDispatched, 0);
    assert.strictEqual(report.invariants.totalComputeCostSunk, 0);
    assert.strictEqual(report.invariants.stateLeakagePercentage, '0.00%');
    assert.strictEqual(report.invariants.merkleRootIntegrityPassed, true);

    // Verify percentiles are strictly non-decreasing: min <= p50 <= p95 <= p99 <= max
    assert.ok(report.latencies.minMs <= report.latencies.p50Ms, 'min <= p50');
    assert.ok(report.latencies.p50Ms <= report.latencies.p95Ms, 'p50 <= p95');
    assert.ok(report.latencies.p95Ms <= report.latencies.p99Ms, 'p95 <= p99');
    assert.ok(report.latencies.p99Ms <= report.latencies.maxMs, 'p99 <= max');

    // Throughput should be positive
    assert.ok(report.throughputPerSecond > 0, 'Throughput must be > 0');
  });

  test('Enforces penalty down-ranking for ambiguous alerts under concurrency', async () => {
    const config: LoadTestConfig = {
      totalAlerts: 20,
      concurrencyLimit: 4,
      adversarialRatio: 0.0,
      syntheticCanaryRatio: 0.0,
      ambiguousRatio: 1.0 // 100% low confidence ambiguous candidates
    };

    const report = await harness.executeLoadTest(config);

    assert.strictEqual(report.totalProcessed, 20);
    // All should be downranked to INSUFFICIENT_EVIDENCE
    assert.strictEqual(report.verdictDistribution.insufficientEvidence, 20);
    assert.strictEqual(report.verdictDistribution.confirmedTruePositive, 0);
    assert.strictEqual(report.verdictDistribution.filteredFalsePositive, 0);
  });

  test('Calculates DORA Lead Time impact and verifies CI/CD latency envelope', async () => {
    const config: LoadTestConfig = {
      totalAlerts: 25, // Standard PR size alert volume
      concurrencyLimit: 10,
      adversarialRatio: 0.4,
      syntheticCanaryRatio: 0.4,
      ambiguousRatio: 0.2
    };

    const report = await harness.executeLoadTest(config);

    // Fast in-process programmatic validation completes in < 5 seconds
    assert.strictEqual(report.doraLeadTimeImpact.verdict, 'NEGLIGIBLE_CI_IMPACT');
    assert.ok(report.doraLeadTimeImpact.estimatedCiDelaySeconds < 5.0, 'CI delay should be sub-5s');
  });
});
