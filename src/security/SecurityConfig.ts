/**
 * SecurityConfig
 * 
 * Enforces fail-closed configuration invariants for production environments.
 * If running in production (NODE_ENV === 'production'), missing secrets immediately
 * halt process boot with a fatal exception.
 * Development / test fallback secrets are strictly quarantined to non-production environments.
 */

import { logEvent } from '../utils/logger';

export class SecurityConfig {
  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Salt used for deterministic, one-way API key hashing.
   * In production: MUST be provided via OCTEPOS_KEY_SALT (min 32 chars recommended).
   */
  public static getKeySalt(): string {
    const salt = process.env.OCTEPOS_KEY_SALT;
    if (this.isProduction() && (!salt || salt.trim().length === 0)) {
      throw new Error(
        'FATAL_SECURITY_INVARIANT: Missing required environment variable OCTEPOS_KEY_SALT in production. Process boot halted.'
      );
    }
    return salt || 'octepos_development_ephemeral_salt_for_local_testing_only_9981';
  }

  /**
   * Secret used for GitHub Webhook HMAC SHA-256 signature verification.
   */
  public static getWebhookSecret(): string {
    const secret = process.env.OCTEPOS_WEBHOOK_SECRET;
    if (this.isProduction() && (!secret || secret.trim().length === 0)) {
      throw new Error(
        'FATAL_SECURITY_INVARIANT: Missing required environment variable OCTEPOS_WEBHOOK_SECRET in production. Process boot halted.'
      );
    }
    return secret || 'octepos_development_webhook_hmac_secret_for_local_testing_only_4412';
  }

  /**
   * Token used for Datadog / SIEM webhook verification (optional).
   * Gracefully bypassed if omitted or disabled for zero-cost operation.
   */
  public static getDatadogToken(): string | undefined {
    const token = process.env.OCTEPOS_DATADOG_TOKEN;
    if (!token || token === 'disabled' || token.trim().length === 0) {
      return undefined;
    }
    return token;
  }

  /**
   * Assert all required production secrets on application startup.
   * 
   * Architecture:
   * 1. Critical security invariants (Fail-closed): Cryptographic salt and webhook HMAC.
   * 2. Optional external tools (Fail-open / Graceful bypass): Datadog / commercial SaaS.
   *    If omitted, runs with local zero-cost telemetry without incurring paid fees.
   */
  public static assertProductionInvariants(): void {
    // 1. Critical security invariants (Fail-closed if missing)
    if (this.isProduction()) {
      const criticalEnvVars = ['OCTEPOS_KEY_SALT', 'OCTEPOS_WEBHOOK_SECRET'];
      for (const envVar of criticalEnvVars) {
        const val = process.env[envVar];
        if (!val || val.trim().length === 0) {
          throw new Error(
            `FATAL_SECURITY_INVARIANT: Missing required environment variable ${envVar} in production. Process boot halted.`
          );
        }
      }
    }

    // 2. Optional external tools (Graceful bypass if omitted for zero-cost operation)
    if (process.env.OCTEPOS_DATADOG_TOKEN && process.env.OCTEPOS_DATADOG_TOKEN !== 'disabled') {
      logEvent('INFO', 'Datadog integration enabled.', {
        component: 'SecurityConfig',
        integration: 'Datadog'
      });
    } else {
      logEvent('INFO', 'Datadog token omitted. Running with local zero-cost telemetry fallback.', {
        component: 'SecurityConfig',
        zeroCostTelemetry: true
      });
    }
  }
}

