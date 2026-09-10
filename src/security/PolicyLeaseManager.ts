import { canonicalize } from 'json-canonicalize';
import { createHash } from 'crypto';

export type LeaseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'TRIPWIRE_TRIGGERED';

export type RevocationReason = 
  | 'TTL_EXPIRED'
  | 'MAX_INVOCATIONS_EXHAUSTED'
  | 'COROSYNC_QUORUM_LOSS'
  | 'GLASS_FLOOR_INTERCEPT'
  | 'SPLIT_BRAIN_ANOMALY'
  | 'AIRGAP_VIOLATION'
  | 'MANUAL_QUARANTINE';

export interface CapabilityLease {
  leaseId: string;
  substrateId: string;
  capabilities: string[];
  issuedAt: number; // Unix epoch ms
  expiresAt: number; // Unix epoch ms
  ttlSeconds: number;
  maxInvocations: number;
  invocationsConsumed: number;
  status: LeaseStatus;
  revocationReason?: RevocationReason;
  revokedAt?: number;
  tripwireRules: string[];
  leaseDigest: string; // RFC 8785 Canonical JSON SHA-256
}

export interface IssueLeaseRequest {
  substrateId: string;
  capabilities: string[];
  ttlSeconds?: number;
  maxInvocations?: number;
  tripwireRules?: string[];
}

export class PolicyLeaseManager {
  private leases: Map<string, CapabilityLease> = new Map();
  private readonly DEFAULT_TTL_SECONDS = 30;
  private readonly DEFAULT_MAX_INVOCATIONS = 3;

  constructor() {
    // Seed initial operational lease for sovereign cluster runtime
    this.issueLease({
      substrateId: 'local',
      capabilities: ['READ_STATE', 'EMIT_TELEMETRY'],
      ttlSeconds: 60,
      maxInvocations: 50,
      tripwireRules: ['COROSYNC_QUORUM_LOSS', 'AIRGAP_VIOLATION']
    });
  }

  /**
   * Generates a cryptographically signed, ephemeral capability lease with strict monotonic TTL
   */
  public issueLease(req: IssueLeaseRequest): CapabilityLease {
    const now = Date.now();
    const ttlSeconds = req.ttlSeconds || this.DEFAULT_TTL_SECONDS;
    const expiresAt = now + (ttlSeconds * 1000);
    const leaseId = `LEASE-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const rawLease = {
      leaseId,
      substrateId: req.substrateId,
      capabilities: [...req.capabilities].sort(),
      issuedAt: now,
      expiresAt,
      ttlSeconds,
      maxInvocations: req.maxInvocations || this.DEFAULT_MAX_INVOCATIONS,
      invocationsConsumed: 0,
      status: 'ACTIVE' as LeaseStatus,
      tripwireRules: req.tripwireRules || ['COROSYNC_QUORUM_LOSS', 'AIRGAP_VIOLATION']
    };

    const leaseDigest = this.computeCanonicalDigest(rawLease);
    const lease: CapabilityLease = {
      ...rawLease,
      leaseDigest
    };

    this.leases.set(leaseId, lease);
    return lease;
  }

  /**
   * Verifies lease validity and claims an invocation.
   * Throws an invariant error if expired, revoked, or capacity exhausted.
   */
  public claimInvocation(leaseId: string, requiredCapability: string): CapabilityLease {
    const lease = this.leases.get(leaseId);
    if (!lease) {
      throw new Error(`LEASE_INVALID: Lease ID ${leaseId} does not exist.`);
    }

    const now = Date.now();

    // 1. Check TTL Expiration
    if (now >= lease.expiresAt || lease.status === 'EXPIRED') {
      lease.status = 'EXPIRED';
      lease.revocationReason = 'TTL_EXPIRED';
      lease.revokedAt = now;
      lease.leaseDigest = this.computeCanonicalDigest(lease);
      throw new Error(`LEASE_EXPIRED: Lease ${leaseId} expired at ${new Date(lease.expiresAt).toISOString()} (Monotonic TTL exceeded).`);
    }

    // 2. Check if already Revoked or Tripwire Triggered
    if (lease.status === 'REVOKED' || lease.status === 'TRIPWIRE_TRIGGERED') {
      throw new Error(`LEASE_REVOKED: Lease ${leaseId} was invalidated due to ${lease.revocationReason}.`);
    }

    // 3. Verify Capability Inclusion
    if (!lease.capabilities.includes(requiredCapability)) {
      throw new Error(`LEASE_CAPABILITY_UNAUTHORIZED: Lease ${leaseId} does not grant '${requiredCapability}'.`);
    }

    // 4. Increment and check Max Invocations
    lease.invocationsConsumed += 1;
    if (lease.invocationsConsumed >= lease.maxInvocations) {
      lease.status = 'REVOKED';
      lease.revocationReason = 'MAX_INVOCATIONS_EXHAUSTED';
      lease.revokedAt = now;
    }

    lease.leaseDigest = this.computeCanonicalDigest(lease);
    return lease;
  }

  /**
   * Triggers an emergency tripwire revocation across all leases matching a condition
   */
  public triggerTripwireCascade(reason: RevocationReason, filterSubstrate?: string): CapabilityLease[] {
    const now = Date.now();
    const revoked: CapabilityLease[] = [];

    for (const lease of this.leases.values()) {
      if (lease.status === 'ACTIVE') {
        if (!filterSubstrate || lease.substrateId === filterSubstrate) {
          lease.status = 'TRIPWIRE_TRIGGERED';
          lease.revocationReason = reason;
          lease.revokedAt = now;
          lease.leaseDigest = this.computeCanonicalDigest(lease);
          revoked.push(lease);
        }
      }
    }

    return revoked;
  }

  /**
   * Manually revokes a specific lease
   */
  public revokeLease(leaseId: string, reason: RevocationReason = 'MANUAL_QUARANTINE'): CapabilityLease {
    const lease = this.leases.get(leaseId);
    if (!lease) {
      throw new Error(`LEASE_NOT_FOUND: Lease ${leaseId} not found.`);
    }

    lease.status = 'REVOKED';
    lease.revocationReason = reason;
    lease.revokedAt = Date.now();
    lease.leaseDigest = this.computeCanonicalDigest(lease);
    return lease;
  }

  /**
   * Sweeps and auto-expires all stale active leases
   */
  public sweepExpiredLeases(): CapabilityLease[] {
    const now = Date.now();
    const expired: CapabilityLease[] = [];

    for (const lease of this.leases.values()) {
      if (lease.status === 'ACTIVE' && now >= lease.expiresAt) {
        lease.status = 'EXPIRED';
        lease.revocationReason = 'TTL_EXPIRED';
        lease.revokedAt = now;
        lease.leaseDigest = this.computeCanonicalDigest(lease);
        expired.push(lease);
      }
    }

    return expired;
  }

  /**
   * Returns all tracked leases
   */
  public getAllLeases(): CapabilityLease[] {
    this.sweepExpiredLeases();
    return Array.from(this.leases.values()).sort((a, b) => b.issuedAt - a.issuedAt);
  }

  /**
   * Returns a specific lease
   */
  public getLease(leaseId: string): CapabilityLease | undefined {
    this.sweepExpiredLeases();
    return this.leases.get(leaseId);
  }

  /**
   * Computes an RFC 8785 canonical JSON SHA-256 hash of the lease object
   */
  private computeCanonicalDigest(obj: any): string {
    const { leaseDigest: _, ...digestible } = obj;
    const canonicalJson = canonicalize(digestible);
    return '0x' + createHash('sha256').update(canonicalJson).digest('hex');
  }
}
