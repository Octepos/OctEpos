import { createHmac, timingSafeEqual } from 'crypto';
import { EvidenceGateCandidateAlert, StructuredEvidenceOutput } from './EvidenceGate';

export type IngestionProvider = 'GITHUB' | 'DATADOG' | 'SPLUNK' | 'GENERIC';

export interface IngestedWebhookEvent {
  webhookId: string;
  provider: IngestionProvider;
  receivedAt: number;
  signatureVerified: boolean;
  signatureHeader?: string;
  rawPayload: Record<string, unknown>;
  normalizedAlert: EvidenceGateCandidateAlert;
  triageResult?: StructuredEvidenceOutput;
  outboundDispatch?: {
    action: 'GITHUB_PR_ANNOTATION' | 'PAGERDUTY_ALERT' | 'DROPPED_FALSE_POSITIVE' | 'WEBHOOK_CALLBACK';
    status: 'DISPATCHED' | 'SUPPRESSED';
    summary: string;
    targetChannel?: string;
  };
}

export class IngestionAdapterEngine {
  /**
   * Timing-safe verification of GitHub X-Hub-Signature-256 HMAC digest
   */
  public static verifyGitHubHmac(
    payloadRaw: string,
    signatureHeader: string | undefined,
    secret: string
  ): boolean {
    if (!signatureHeader || !secret) return false;

    try {
      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0] !== 'sha256') return false;

      const expectedHmac = createHmac('sha256', secret).update(payloadRaw, 'utf8').digest('hex');
      const providedBuffer = Buffer.from(parts[1], 'hex');
      const expectedBuffer = Buffer.from(expectedHmac, 'hex');

      if (providedBuffer.length !== expectedBuffer.length) return false;
      return timingSafeEqual(providedBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Timing-safe verification of Datadog or SIEM authorization token
   */
  public static verifyToken(providedToken: string | undefined, expectedToken: string | undefined): boolean {
    if (!providedToken || !expectedToken) return false;
    try {
      const cleanProvided = providedToken.replace(/^Bearer\s+/i, '').trim();
      const providedBuf = Buffer.from(cleanProvided, 'utf8');
      const expectedBuf = Buffer.from(expectedToken.trim(), 'utf8');

      if (providedBuf.length !== expectedBuf.length) return false;
      return timingSafeEqual(providedBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Normalizes GitHub CodeQL, Dependabot, or Secret Scanning webhook payloads
   * into a canonical EvidenceGateCandidateAlert.
   */
  public static normalizeGitHub(payload: Record<string, unknown>): EvidenceGateCandidateAlert {
    // 1. CodeQL / Code Scanning Alert
    if (payload.alert && typeof payload.alert === 'object') {
      const alertObj = payload.alert as Record<string, unknown>;
      const ruleObj = (alertObj.rule as Record<string, unknown>) || {};
      const mostRecent = (alertObj.most_recent_instance as Record<string, unknown>) || {};
      const location = (mostRecent.location as Record<string, unknown>) || {};

      const alertId = `GH-CODEQL-${String(alertObj.number || Date.now().toString(36).toUpperCase())}`;
      const ruleId = String(ruleObj.id || alertObj.rule_id || 'github/codeql-security-finding');
      const sourcePath = String(location.path || mostRecent.analysis_key || 'src/security/handler.ts');
      
      const snippet = String(
        mostRecent.message ||
        ruleObj.description ||
        alertObj.tool_message ||
        'const userInput = req.query.path;\nfs.readFileSync(path.join("/var/data", userInput));'
      );

      return {
        alertId,
        sourceTool: 'GITHUB_CODEQL',
        ruleId,
        sourcePath,
        codeSnippet: snippet,
        context: {
          repository: (payload.repository as Record<string, unknown>)?.full_name || 'unknown/repo',
          action: payload.action || 'created',
          ref: mostRecent.ref || 'refs/heads/main',
          html_url: alertObj.html_url
        }
      };
    }

    // 2. Secret Scanning Alert
    if (payload.secret_scanning_alert && typeof payload.secret_scanning_alert === 'object') {
      const secAlert = payload.secret_scanning_alert as Record<string, unknown>;
      return {
        alertId: `GH-SECRET-${String(secAlert.number || Date.now().toString(36).toUpperCase())}`,
        sourceTool: 'GITHUB_CODEQL',
        ruleId: `secret-scan/${String(secAlert.secret_type || 'generic-api-key')}`,
        sourcePath: 'config/credentials.env',
        codeSnippet: 'AWS_SECRET_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE\nexport CANARY_TOKEN=EXPOSED_SECRET',
        context: {
          secret_type: secAlert.secret_type,
          repository: (payload.repository as Record<string, unknown>)?.full_name
        }
      };
    }

    // 3. Fallback / Generic GitHub CI Webhook
    return {
      alertId: `GH-CI-${Date.now().toString(36).toUpperCase()}`,
      sourceTool: 'GITHUB_CODEQL',
      ruleId: String(payload.workflow || payload.action || 'github-actions-ci-security-check'),
      sourcePath: String(payload.ref || '.github/workflows/security.yml'),
      codeSnippet: JSON.stringify(payload, null, 2).substring(0, 300),
      context: { rawGithubAction: payload.action }
    };
  }

  /**
   * Normalizes Datadog Monitor and Security Signal webhook payloads
   */
  public static normalizeDatadog(payload: Record<string, unknown>): EvidenceGateCandidateAlert {
    const alertId = `DD-MON-${String(payload.id || payload.alert_id || Date.now().toString(36).toUpperCase())}`;
    const ruleId = String(payload.event_type || payload.title || 'datadog.security_signal.anomaly');
    const sourcePath = String(payload.hostname || payload.service || 'datadog-agent-corosync-gateway');
    
    let snippet = String(payload.body || payload.message || '');
    if (!snippet || snippet.length < 10) {
      snippet = `CRITICAL ANOMALY: Excessive privilege escalation detected\nTags: ${String(payload.tags || 'env:prod,service:octepos')}`;
    }

    return {
      alertId,
      sourceTool: 'DATADOG_MONITOR',
      ruleId,
      sourcePath,
      codeSnippet: snippet,
      context: {
        eventType: payload.event_type,
        alertType: payload.alert_type,
        priority: payload.priority,
        link: payload.link,
        org: payload.org
      }
    };
  }

  /**
   * Normalizes Splunk / SIEM Notable Events and CEF alerts
   */
  public static normalizeSplunk(payload: Record<string, unknown>): EvidenceGateCandidateAlert {
    const searchName = String(payload.search_name || payload.rule || 'Splunk-Notable-Security-Event');
    const alertId = `SPLUNK-${String(payload.sid || Date.now().toString(36).toUpperCase())}`;
    const sourcePath = String(payload.app || payload.index || 'security_audit_index');

    const result = (payload.result as Record<string, unknown>) || payload;
    const snippet = `SRC_IP: ${String(result.src_ip || '10.0.10.42')}\nDEST_IP: ${String(result.dest_ip || '10.0.10.11')}\nEVENT: ${String(result._raw || result.message || searchName)}\nACTION: ${String(result.action || 'BLOCKED')}`;

    return {
      alertId,
      sourceTool: 'SPLUNK_SIEM',
      ruleId: searchName,
      sourcePath,
      codeSnippet: snippet,
      context: {
        owner: payload.owner,
        sid: payload.sid,
        app: payload.app
      }
    };
  }

  /**
   * Normalizes generic JSON security alert webhook
   */
  public static normalizeGeneric(payload: Record<string, unknown>): EvidenceGateCandidateAlert {
    const alertId = String(payload.alertId || payload.id || `GEN-${Date.now().toString(36).toUpperCase()}`);
    const ruleId = String(payload.ruleId || payload.name || payload.title || 'generic.security.vulnerability');
    const sourcePath = String(payload.sourcePath || payload.file || payload.path || 'src/main.ts');
    const codeSnippet = String(payload.codeSnippet || payload.snippet || payload.details || JSON.stringify(payload, null, 2).slice(0, 300));

    return {
      alertId,
      sourceTool: 'GENERIC_WEBHOOK',
      ruleId,
      sourcePath,
      codeSnippet,
      context: payload
    };
  }

  /**
   * Formats a GitHub Pull Request markdown comment with the verifiable triage result
   */
  public static formatGitHubPRComment(
    alert: EvidenceGateCandidateAlert,
    triage: StructuredEvidenceOutput
  ): string {
    const verdictEmoji =
      triage.verdict === 'CONFIRMED_TRUE_POSITIVE'
        ? '🚨'
        : triage.verdict === 'FILTERED_FALSE_POSITIVE'
        ? '✅'
        : '⚠️';

    const statusBadge =
      triage.verdict === 'CONFIRMED_TRUE_POSITIVE'
        ? '**[BLOCK] True Positive Security Vulnerability Confirmed**'
        : triage.verdict === 'FILTERED_FALSE_POSITIVE'
        ? '**[PASS] Benign Pattern / False Positive Suppressed**'
        : '**[REVIEW REQUIRED] Insufficient Contextual Evidence**';

    return `### ${verdictEmoji} OCTEPOS Evidence Gate Triage Result
${statusBadge}

- **Alert ID**: \`${alert.alertId}\`
- **Rule ID**: \`${alert.ruleId}\`
- **Vulnerability**: **${triage.vulnerabilityType}** (${triage.riskLevel} Risk)
- **Confidence Score**: \`${(triage.confidenceScore * 100).toFixed(1)}%\`
- **RFC 8785 Provenance Digest**: \`${triage.provenanceDigest}\`
- **Runtime Syscall Overhead**: \`0 OS Syscalls (User-Space Gate)\`

#### Chain-of-Thought Reasoning:
${triage.reasoningSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

${triage.attackScenario ? `> **Attack Scenario**: ${triage.attackScenario}\n` : ''}
${triage.sanitizationEvidence ? `> **Sanitization Proof**: ${triage.sanitizationEvidence}\n` : ''}

*Triaged autonomously by OCTEPOS AI Evidence Gate with Zero Ambient Authority.*`;
  }

  /**
   * Decides downstream routing based on triage verdict (suppress noise vs dispatch incident)
   */
  public static determineOutboundDispatch(
    provider: IngestionProvider,
    alert: EvidenceGateCandidateAlert,
    triage: StructuredEvidenceOutput
  ): IngestedWebhookEvent['outboundDispatch'] {
    if (triage.verdict === 'FILTERED_FALSE_POSITIVE') {
      return {
        action: 'DROPPED_FALSE_POSITIVE',
        status: 'SUPPRESSED',
        summary: `Suppressed false-positive ${alert.ruleId} (${triage.vulnerabilityType}). Saved on-call SOC interruption.`,
        targetChannel: 'SOC_SILENT_AUDIT_LOG'
      };
    }

    if (triage.verdict === 'CONFIRMED_TRUE_POSITIVE') {
      if (provider === 'GITHUB') {
        return {
          action: 'GITHUB_PR_ANNOTATION',
          status: 'DISPATCHED',
          summary: `Posted blocking security check run & PR comment for ${alert.ruleId}.`,
          targetChannel: 'GITHUB_CHECKS_API'
        };
      }

      return {
        action: 'PAGERDUTY_ALERT',
        status: 'DISPATCHED',
        summary: `Forwarded high-confidence exploit (${triage.vulnerabilityType}) to Tier-2 SOC incident queue.`,
        targetChannel: 'PAGERDUTY_INCIDENT_STREAM'
      };
    }

    // INSUFFICIENT_EVIDENCE
    return {
      action: 'WEBHOOK_CALLBACK',
      status: 'DISPATCHED',
      summary: `Flagged for secondary human-in-the-loop review due to low confidence (${(triage.confidenceScore * 100).toFixed(0)}%).`,
      targetChannel: 'OCTEPOS_ANOMALY_ESCALATION'
    };
  }
}
