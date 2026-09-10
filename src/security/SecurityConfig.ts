/**
 * SecurityConfig
 * 
 * Enforces fail-closed configuration invariants for production environments.
 * If running in production (NODE_ENV === 'production'), missing secrets immediately
 * halt process boot with a fatal exception.
 * Development / test fallback secrets are strictly quarantined to non-production environments.
 */

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
   * Token used for Datadog / SIEM webhook verification.
   */
  public static getDatadogToken(): string {
    const token = process.env.OCTEPOS_DATADOG_TOKEN;
    if (this.isProduction() && (!token || token.trim().length === 0)) {
      throw new Error(
        'FATAL_SECURITY_INVARIANT: Missing required environment variable OCTEPOS_DATADOG_TOKEN in production. Process boot halted.'
      );
    }
    return token || 'octepos_development_datadog_token_for_local_testing_only_8819';
  }

  /**
   * Assert all required production secrets on application startup.
   * Fails closed immediately before any network ports or endpoints bind.
   */
  public static assertProductionInvariants(): void {
    if (this.isProduction()) {
      this.getKeySalt();
      this.getWebhookSecret();
      this.getDatadogToken();
    }
  }
}
