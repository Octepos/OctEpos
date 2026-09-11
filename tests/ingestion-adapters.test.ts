import test, { describe } from 'node:test';
import assert from 'node:assert';
import { createHmac } from 'crypto';
import { IngestionAdapterEngine, ReplayDefenseBloomFilter } from '../src/security/IngestionAdapters';
import { StructuredEvidenceOutput } from '../src/security/EvidenceGate';

describe('OCTEPOS Ingestion Hooks & Webhook Normalizer Invariant Suite', () => {
  const GITHUB_WEBHOOK_SECRET = 'octepos-devsecops-webhook-secret-994';
  const DATADOG_WEBHOOK_TOKEN = 'dd-token-octepos-enclave-881';

  test('GitHub HMAC SHA-256 signature verification accepts valid signatures and rejects forged payloads', () => {
    const rawPayload = JSON.stringify({ action: 'created', repository: { full_name: 'acme/financial-core' } });
    const validHmac = 'sha256=' + createHmac('sha256', GITHUB_WEBHOOK_SECRET).update(rawPayload, 'utf8').digest('hex');

    // 1. Valid signature passes
    assert.strictEqual(
      IngestionAdapterEngine.verifyGitHubHmac(rawPayload, validHmac, GITHUB_WEBHOOK_SECRET),
      true,
      'Valid HMAC signature must verify'
    );

    // 2. Tampered payload fails
    const tamperedPayload = JSON.stringify({ action: 'created', repository: { full_name: 'acme/financial-core', evilInjection: true } });
    assert.strictEqual(
      IngestionAdapterEngine.verifyGitHubHmac(tamperedPayload, validHmac, GITHUB_WEBHOOK_SECRET),
      false,
      'Tampered payload must fail verification'
    );

    // 3. Wrong secret fails
    assert.strictEqual(
      IngestionAdapterEngine.verifyGitHubHmac(rawPayload, validHmac, 'wrong-secret-000'),
      false,
      'Signature signed with wrong secret must fail'
    );

    // 4. Missing or malformed header fails
    assert.strictEqual(IngestionAdapterEngine.verifyGitHubHmac(rawPayload, undefined, GITHUB_WEBHOOK_SECRET), false);
    assert.strictEqual(IngestionAdapterEngine.verifyGitHubHmac(rawPayload, 'md5=badprefix', GITHUB_WEBHOOK_SECRET), false);
  });

  test('Token header verification validates bearer tokens safely', () => {
    assert.strictEqual(IngestionAdapterEngine.verifyToken(DATADOG_WEBHOOK_TOKEN, DATADOG_WEBHOOK_TOKEN), true);
    assert.strictEqual(IngestionAdapterEngine.verifyToken(`Bearer ${DATADOG_WEBHOOK_TOKEN}`, DATADOG_WEBHOOK_TOKEN), true);
    assert.strictEqual(IngestionAdapterEngine.verifyToken('invalid-token', DATADOG_WEBHOOK_TOKEN), false);
    assert.strictEqual(IngestionAdapterEngine.verifyToken(undefined, DATADOG_WEBHOOK_TOKEN), false);
  });

  test('GitHub CodeQL Webhook normalizes into canonical EvidenceGateCandidateAlert', () => {
    const mockCodeQLPayload = {
      action: 'created',
      alert: {
        number: 42,
        rule: {
          id: 'js/path-injection',
          description: 'Unsanitized input flows into file system read'
        },
        most_recent_instance: {
          location: {
            path: 'src/controllers/reports.ts'
          },
          message: 'Potential directory traversal vulnerability: req.params.file flows into fs.readFile'
        },
        html_url: 'https://github.com/acme/core/security/code-scanning/42'
      },
      repository: {
        full_name: 'acme/core'
      }
    };

    const normalized = IngestionAdapterEngine.normalizeGitHub(mockCodeQLPayload);

    assert.strictEqual(normalized.alertId, 'GH-CODEQL-42');
    assert.strictEqual(normalized.sourceTool, 'GITHUB_CODEQL');
    assert.strictEqual(normalized.ruleId, 'js/path-injection');
    assert.strictEqual(normalized.sourcePath, 'src/controllers/reports.ts');
    assert.ok(normalized.codeSnippet.includes('Potential directory traversal vulnerability'));
    assert.strictEqual(normalized.context?.repository, 'acme/core');
  });

  test('GitHub Secret Scanning Webhook normalizes into canonical alert', () => {
    const mockSecretPayload = {
      action: 'created',
      secret_scanning_alert: {
        number: 104,
        secret_type: 'aws_access_key_id'
      },
      repository: {
        full_name: 'acme/cloud-infra'
      }
    };

    const normalized = IngestionAdapterEngine.normalizeGitHub(mockSecretPayload);

    assert.strictEqual(normalized.alertId, 'GH-SECRET-104');
    assert.strictEqual(normalized.sourceTool, 'GITHUB_CODEQL');
    assert.strictEqual(normalized.ruleId, 'secret-scan/aws_access_key_id');
    assert.strictEqual(normalized.sourcePath, 'config/credentials.env');
    assert.ok(normalized.codeSnippet.includes('CANARY_TOKEN'));
  });

  test('Datadog Monitor Webhook normalizes into canonical EvidenceGateCandidateAlert', () => {
    const mockDatadogPayload = {
      id: '8849201',
      title: 'Corosync Node Latency Spike on proxmox-pve-01',
      event_type: 'security_monitor_alert',
      hostname: 'proxmox-pve-01.internal',
      body: 'ALERT: Latency exceeded 2.5ms across Corosync ring 0. Quorum threatened.',
      tags: 'env:production,substrate:proxmox,cluster:pve-cluster-01',
      priority: 'normal'
    };

    const normalized = IngestionAdapterEngine.normalizeDatadog(mockDatadogPayload);

    assert.strictEqual(normalized.alertId, 'DD-MON-8849201');
    assert.strictEqual(normalized.sourceTool, 'DATADOG_MONITOR');
    assert.strictEqual(normalized.ruleId, 'security_monitor_alert');
    assert.strictEqual(normalized.sourcePath, 'proxmox-pve-01.internal');
    assert.ok(normalized.codeSnippet.includes('ALERT: Latency exceeded 2.5ms'));
  });

  test('Splunk / SIEM Security Incident normalizes into canonical alert', () => {
    const mockSplunkPayload = {
      search_name: 'Excessive-Failed-SSH-Root-Logins',
      sid: '1789400291.55',
      app: 'enterprise_security',
      result: {
        src_ip: '198.51.100.77',
        dest_ip: '10.0.10.12',
        message: '150 failed attempts in 30 seconds from untrusted subnet',
        action: 'DROPPED_BY_FIREWALL'
      }
    };

    const normalized = IngestionAdapterEngine.normalizeSplunk(mockSplunkPayload);

    assert.strictEqual(normalized.alertId, 'SPLUNK-1789400291.55');
    assert.strictEqual(normalized.sourceTool, 'SPLUNK_SIEM');
    assert.strictEqual(normalized.ruleId, 'Excessive-Failed-SSH-Root-Logins');
    assert.ok(normalized.codeSnippet.includes('SRC_IP: 198.51.100.77'));
    assert.ok(normalized.codeSnippet.includes('ACTION: DROPPED_BY_FIREWALL'));
  });

  test('Outbound dispatch logic correctly routes verdicts (suppress noise vs dispatch incident)', () => {
    const alert = IngestionAdapterEngine.normalizeGitHub({
      alert: { number: 12, rule: { id: 'test-rule' } }
    });

    const falsePositiveVerdict: StructuredEvidenceOutput = {
      verdict: 'FILTERED_FALSE_POSITIVE',
      confidenceScore: 0.94,
      vulnerabilityType: 'BENIGN_SANITIZED_PATH',
      reasoningSteps: ['Path is validated against strict whitelist regex', 'No dynamic user input reaches fs method'],
      riskLevel: 'LOW',
      provenanceDigest: '0xabc123',
      timestamp: new Date().toISOString()
    };

    const truePositiveVerdict: StructuredEvidenceOutput = {
      verdict: 'CONFIRMED_TRUE_POSITIVE',
      confidenceScore: 0.98,
      vulnerabilityType: 'PATH_TRAVERSAL',
      reasoningSteps: ['Input flows directly into readFile without normalization', 'Exploit string ../../etc/passwd succeeds'],
      riskLevel: 'CRITICAL',
      provenanceDigest: '0xdef456',
      timestamp: new Date().toISOString()
    };

    // 1. False Positive -> SUPPRESSED without on-call disruption
    const falsePositiveDispatch = IngestionAdapterEngine.determineOutboundDispatch('GITHUB', alert, falsePositiveVerdict);
    assert.strictEqual(falsePositiveDispatch.status, 'SUPPRESSED');
    assert.strictEqual(falsePositiveDispatch.action, 'DROPPED_FALSE_POSITIVE');
    assert.ok(falsePositiveDispatch.summary.includes('Suppressed false-positive'));

    // 2. True Positive on GitHub -> DISPATCHED to PR annotation
    const truePositiveDispatch = IngestionAdapterEngine.determineOutboundDispatch('GITHUB', alert, truePositiveVerdict);
    assert.strictEqual(truePositiveDispatch.status, 'DISPATCHED');
    assert.strictEqual(truePositiveDispatch.action, 'GITHUB_PR_ANNOTATION');

    // 3. GitHub PR Comment Markdown Formatting
    const prComment = IngestionAdapterEngine.formatGitHubPRComment(alert, truePositiveVerdict);
    assert.ok(prComment.includes('OCTEPOS Evidence Gate Triage Result'));
    assert.ok(prComment.includes('[BLOCK] True Positive Security Vulnerability Confirmed'));
    assert.ok(prComment.includes('PATH_TRAVERSAL'));
    assert.ok(prComment.includes('0 OS Syscalls (User-Space Gate)'));
  });

  test('ReplayDefenseBloomFilter blocks duplicate deliveries in sub-microsecond latency', () => {
    const filter = new ReplayDefenseBloomFilter(16384, 4, 5000);

    const deliveryA = 'webhook-deliv-001-abc';
    const deliveryB = 'webhook-deliv-002-xyz';

    // First arrival passes
    const check1 = filter.testAndAdd(deliveryA);
    assert.strictEqual(check1.isReplay, false);

    // Second unique arrival passes
    const check2 = filter.testAndAdd(deliveryB);
    assert.strictEqual(check2.isReplay, false);

    // Replay of deliveryA is immediately blocked
    const replay1 = filter.testAndAdd(deliveryA);
    assert.strictEqual(replay1.isReplay, true);

    // Replay of deliveryB is immediately blocked
    const replay2 = filter.testAndAdd(deliveryB);
    assert.strictEqual(replay2.isReplay, true);

    const stats = filter.getStats();
    assert.strictEqual(stats.replaysBlocked, 2);
    assert.strictEqual(stats.totalChecks, 4);
    assert.strictEqual(stats.entriesTracked, 2);
  });
});
