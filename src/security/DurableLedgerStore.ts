import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import {
  TenantIdentity,
  TenantUsageState,
  TenantCapability,
  TenantState,
  TenantStateTransitionEvent,
  AccountingLedgerEntry,
  IdempotencyRecord,
  SubscriptionTier,
  QuotaErrorCode
} from '../types/octepos';

export interface AdmissionConsumptionResult {
  readonly authorized: boolean;
  readonly duplicate: boolean;
  readonly eventId?: string;
  readonly tenantId?: string;
  readonly tier?: SubscriptionTier;
  readonly remainingCredits?: number;
  readonly costNzd?: number;
  readonly cachedVerdictJson?: string;
  readonly errorCode?: QuotaErrorCode;
  readonly message?: string;
}

export interface DepositResult {
  readonly success: boolean;
  readonly eventId: string;
  readonly newBalance: number;
  readonly duplicate: boolean;
  readonly message?: string;
}

/**
 * DurableLedgerStore
 * 
 * Authoritative, transactional persistence engine for OCTEPOS.
 * All mutations that consume or grant capital value execute within strict ACID transactions.
 * Local in-memory maps serve strictly as acceleration caches; this store is the single source of truth.
 */
export class DurableLedgerStore {
  private readonly db: DatabaseSync;
  private readonly dbPath: string;

  constructor(dbPath: string = process.env.OCTEPOS_DB_PATH || './octepos_ledger.db') {
    this.dbPath = dbPath;
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  private initSchema(): void {
    // Enforce WAL mode and foreign key constraints
    if (this.dbPath !== ':memory:') {
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA synchronous = NORMAL;');
    }
    this.db.exec('PRAGMA foreign_keys = ON;');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id TEXT PRIMARY KEY,
        org_name TEXT NOT NULL,
        tier TEXT NOT NULL,
        capabilities TEXT NOT NULL,
        billing_currency TEXT NOT NULL DEFAULT 'NZD',
        unit_cost_nzd REAL NOT NULL,
        rate_limit_rps INTEGER NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        state TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tenant_balances (
        tenant_id TEXT PRIMARY KEY,
        available_credits INTEGER NOT NULL,
        total_triaged_count INTEGER NOT NULL,
        unbilled_accrual_nzd REAL NOT NULL,
        last_updated_at INTEGER NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS tenant_state_transitions (
        transition_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        from_state TEXT NOT NULL,
        to_state TEXT NOT NULL,
        actor TEXT NOT NULL,
        reason TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS idempotency_records (
        idempotency_key TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        status TEXT NOT NULL,
        accounting_event_id TEXT,
        cached_result_json TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounting_ledger (
        event_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        provider_event_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        credits_consumed INTEGER NOT NULL,
        unit_price_nzd REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NZD',
        balance_before INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'COMMITTED',
        metadata_json TEXT NOT NULL DEFAULT '{}',
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_key_hash ON tenants(key_hash);
      CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON accounting_ledger(tenant_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_ledger_provider_event ON accounting_ledger(tenant_id, provider_event_id);
    `);
  }

  /**
   * Insert or update tenant identity and initial balance atomically
   */
  public registerTenant(
    tenant: TenantIdentity,
    initialCredits: number = 0
  ): void {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const stmtTenant = this.db.prepare(`
        INSERT INTO tenants (
          tenant_id, org_name, tier, capabilities, billing_currency,
          unit_cost_nzd, rate_limit_rps, key_hash, state, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tenant_id) DO UPDATE SET
          org_name = excluded.org_name,
          tier = excluded.tier,
          capabilities = excluded.capabilities,
          unit_cost_nzd = excluded.unit_cost_nzd,
          rate_limit_rps = excluded.rate_limit_rps,
          key_hash = excluded.key_hash,
          state = excluded.state;
      `);

      stmtTenant.run(
        tenant.tenantId,
        tenant.orgName,
        tenant.tier,
        JSON.stringify(tenant.capabilities),
        tenant.billingCurrency,
        tenant.unitCostPerAlertNzd,
        tenant.rateLimitRps,
        tenant.keyHash,
        tenant.state,
        tenant.createdAt
      );

      const stmtBalance = this.db.prepare(`
        INSERT INTO tenant_balances (
          tenant_id, available_credits, total_triaged_count, unbilled_accrual_nzd, last_updated_at
        ) VALUES (?, ?, 0, 0.0, ?)
        ON CONFLICT(tenant_id) DO NOTHING;
      `);

      stmtBalance.run(tenant.tenantId, initialCredits, Date.now());
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  /**
   * O(1) Authoritative lookup by key hash
   */
  public getTenantByKeyHash(keyHash: string): TenantIdentity | null {
    const stmt = this.db.prepare(`SELECT * FROM tenants WHERE key_hash = ? LIMIT 1`);
    const row = stmt.get(keyHash) as any;
    if (!row) return null;
    return this.mapTenantRow(row);
  }

  /**
   * O(1) Authoritative lookup by tenant ID
   */
  public getTenantById(tenantId: string): TenantIdentity | null {
    const stmt = this.db.prepare(`SELECT * FROM tenants WHERE tenant_id = ? LIMIT 1`);
    const row = stmt.get(tenantId) as any;
    if (!row) return null;
    return this.mapTenantRow(row);
  }

  /**
   * Retrieve authoritative balance ledger for tenant
   */
  public getBalance(tenantId: string): TenantUsageState | null {
    const stmt = this.db.prepare(`SELECT * FROM tenant_balances WHERE tenant_id = ? LIMIT 1`);
    const row = stmt.get(tenantId) as any;
    if (!row) return null;

    return {
      tenantId: row.tenant_id,
      availableCredits: row.available_credits,
      totalTriagedCount: row.total_triaged_count,
      unbilledAccrualNzd: Number(row.unbilled_accrual_nzd),
      lastActiveTimestamp: row.last_updated_at,
      lastFlushedTimestamp: row.last_updated_at
    };
  }

  /**
   * CRITICAL ATOMIC TRANSACTION:
   * 1. Check idempotency: if provider delivery already processed -> RETURN EXISTING RESULT (0 CHARGE)
   * 2. Authorize tenant: active state & required capability
   * 3. Validate quota: positive credits (or flat enterprise)
   * 4. Deduct credit, increment usage, record immutable accounting event
   * 5. Commit atomically.
   */
  public admitAndRecordConsumption(params: {
    tenantId: string;
    providerEventId: string;
    requestId: string;
    operation: string;
    unitPriceNzd: number;
    requiredCapability: TenantCapability;
    metadata?: Record<string, unknown>;
  }): AdmissionConsumptionResult {
    const idempotencyKey = `${params.tenantId}:${params.providerEventId}`;

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // 1. Idempotency Check
      const stmtIdem = this.db.prepare(`
        SELECT * FROM idempotency_records WHERE idempotency_key = ? LIMIT 1
      `);
      const existingIdem = stmtIdem.get(idempotencyKey) as any;

      if (existingIdem && existingIdem.status === 'COMMITTED') {
        const balStmt = this.db.prepare(`SELECT * FROM tenant_balances WHERE tenant_id = ? LIMIT 1`);
        const balRow = balStmt.get(params.tenantId) as any;
        const tenantStmt = this.db.prepare(`SELECT * FROM tenants WHERE tenant_id = ? LIMIT 1`);
        const tRow = tenantStmt.get(params.tenantId) as any;

        this.db.exec('COMMIT');
        return {
          authorized: true,
          duplicate: true,
          eventId: existingIdem.accounting_event_id,
          tenantId: params.tenantId,
          tier: tRow?.tier as SubscriptionTier,
          remainingCredits: balRow ? balRow.available_credits : 0,
          costNzd: 0, // ZERO CHARGE FOR DUPLICATE
          cachedVerdictJson: existingIdem.cached_result_json,
          message: 'Duplicate provider delivery detected. Reusing existing outcome with 0 additional charge.'
        };
      }

      // 2. Validate Tenant Identity & State
      const stmtTenant = this.db.prepare(`SELECT * FROM tenants WHERE tenant_id = ? LIMIT 1`);
      const tenantRow = stmtTenant.get(params.tenantId) as any;

      if (!tenantRow) {
        this.db.exec('ROLLBACK');
        return {
          authorized: false,
          duplicate: false,
          errorCode: 'UNAUTHORIZED_KEY',
          message: 'Tenant identity not registered in authoritative store'
        };
      }

      const tenantState = tenantRow.state as TenantState;
      if (tenantState !== 'ACTIVE') {
        this.db.exec('ROLLBACK');
        return {
          authorized: false,
          duplicate: false,
          tenantId: params.tenantId,
          tier: tenantRow.tier as SubscriptionTier,
          errorCode: 'TENANT_SUSPENDED',
          message: `Tenant account ${params.tenantId} is in state ${tenantState}. Authorization denied.`
        };
      }

      const capabilities: TenantCapability[] = JSON.parse(tenantRow.capabilities);
      if (!capabilities.includes(params.requiredCapability)) {
        this.db.exec('ROLLBACK');
        return {
          authorized: false,
          duplicate: false,
          tenantId: params.tenantId,
          tier: tenantRow.tier as SubscriptionTier,
          errorCode: 'CAPABILITY_MISSING',
          message: `Tenant ${params.tenantId} lacks required capability: ${params.requiredCapability}`
        };
      }

      // 3. Check Authoritative Balance
      const stmtBal = this.db.prepare(`SELECT * FROM tenant_balances WHERE tenant_id = ? LIMIT 1`);
      const balRow = stmtBal.get(params.tenantId) as any;

      if (!balRow) {
        this.db.exec('ROLLBACK');
        return {
          authorized: false,
          duplicate: false,
          errorCode: 'UNAUTHORIZED_KEY',
          message: 'Tenant ledger record missing'
        };
      }

      const isSovereign = tenantRow.tier === 'SOVEREIGN_ENTERPRISE';
      const creditsToDeduct = isSovereign ? 0 : 1;

      if (!isSovereign && balRow.available_credits <= 0) {
        this.db.exec('ROLLBACK');
        return {
          authorized: false,
          duplicate: false,
          tenantId: params.tenantId,
          tier: tenantRow.tier as SubscriptionTier,
          remainingCredits: 0,
          errorCode: 'QUOTA_EXHAUSTED',
          message: 'Available alert credits exhausted. Deposit credits to continue.'
        };
      }

      // 4. Calculate New Balances
      const balanceBefore = balRow.available_credits;
      const balanceAfter = balanceBefore - creditsToDeduct;
      const newTriaged = balRow.total_triaged_count + 1;
      const unitCost = isSovereign ? 0.0 : params.unitPriceNzd;
      const newAccrual = Number((balRow.unbilled_accrual_nzd + unitCost).toFixed(4));
      const now = Date.now();
      const eventId = `EVT-${randomUUID()}`;

      // 5. Insert Immutable Accounting Event
      const stmtLedger = this.db.prepare(`
        INSERT INTO accounting_ledger (
          event_id, tenant_id, request_id, provider_event_id, operation,
          credits_consumed, unit_price_nzd, currency, balance_before, balance_after,
          timestamp, status, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'NZD', ?, ?, ?, 'COMMITTED', ?)
      `);

      stmtLedger.run(
        eventId,
        params.tenantId,
        params.requestId,
        params.providerEventId,
        params.operation,
        creditsToDeduct,
        unitCost,
        balanceBefore,
        balanceAfter,
        now,
        JSON.stringify(params.metadata || {})
      );

      // 6. Update Balance Table
      const stmtUpdateBal = this.db.prepare(`
        UPDATE tenant_balances
        SET available_credits = ?, total_triaged_count = ?, unbilled_accrual_nzd = ?, last_updated_at = ?
        WHERE tenant_id = ?
      `);
      stmtUpdateBal.run(balanceAfter, newTriaged, newAccrual, now, params.tenantId);

      // 7. Establish Durable Idempotency Reservation
      const stmtInsertIdem = this.db.prepare(`
        INSERT INTO idempotency_records (
          idempotency_key, tenant_id, status, accounting_event_id, cached_result_json, created_at, updated_at
        ) VALUES (?, ?, 'COMMITTED', ?, NULL, ?, ?)
        ON CONFLICT(idempotency_key) DO UPDATE SET
          status = 'COMMITTED',
          accounting_event_id = excluded.accounting_event_id,
          updated_at = excluded.updated_at;
      `);
      stmtInsertIdem.run(idempotencyKey, params.tenantId, eventId, now, now);

      this.db.exec('COMMIT');

      return {
        authorized: true,
        duplicate: false,
        eventId,
        tenantId: params.tenantId,
        tier: tenantRow.tier as SubscriptionTier,
        remainingCredits: balanceAfter,
        costNzd: unitCost
      };
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  /**
   * Cache final execution verdict under the established idempotency key
   */
  public updateIdempotencyPayload(
    tenantId: string,
    providerEventId: string,
    verdictPayload: Record<string, unknown>
  ): void {
    const key = `${tenantId}:${providerEventId}`;
    const stmt = this.db.prepare(`
      UPDATE idempotency_records
      SET cached_result_json = ?, updated_at = ?
      WHERE idempotency_key = ?
    `);
    stmt.run(JSON.stringify(verdictPayload), Date.now(), key);
  }

  /**
   * Route deposits through durable accounting authority with explicit idempotency
   */
  public recordCreditDeposit(params: {
    tenantId: string;
    depositIdempotencyKey: string;
    credits: number;
    actor: string;
    reason?: string;
  }): DepositResult {
    const creditsToAdd = Math.max(0, Math.floor(params.credits));
    if (creditsToAdd === 0) {
      const cur = this.getBalance(params.tenantId);
      return {
        success: false,
        eventId: '',
        newBalance: cur ? cur.availableCredits : 0,
        duplicate: false,
        message: 'Deposit credit amount must be greater than zero'
      };
    }

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Check for duplicate top-up request
      const checkStmt = this.db.prepare(`
        SELECT * FROM accounting_ledger
        WHERE tenant_id = ? AND request_id = ? LIMIT 1
      `);
      const existing = checkStmt.get(params.tenantId, params.depositIdempotencyKey) as any;
      if (existing) {
        const balRow = this.db.prepare(`SELECT available_credits FROM tenant_balances WHERE tenant_id = ?`).get(params.tenantId) as any;
        this.db.exec('COMMIT');
        return {
          success: true,
          eventId: existing.event_id,
          newBalance: balRow ? balRow.available_credits : 0,
          duplicate: true,
          message: 'Deposit already processed previously under this idempotency key.'
        };
      }

      const balRow = this.db.prepare(`SELECT * FROM tenant_balances WHERE tenant_id = ?`).get(params.tenantId) as any;
      if (!balRow) {
        this.db.exec('ROLLBACK');
        return { success: false, eventId: '', newBalance: 0, duplicate: false, message: 'Tenant not found' };
      }

      const balanceBefore = balRow.available_credits;
      const balanceAfter = balanceBefore + creditsToAdd;
      const now = Date.now();
      const eventId = `DEP-${randomUUID()}`;

      // Append immutable ledger credit event
      this.db.prepare(`
        INSERT INTO accounting_ledger (
          event_id, tenant_id, request_id, provider_event_id, operation,
          credits_consumed, unit_price_nzd, currency, balance_before, balance_after,
          timestamp, status, metadata_json
        ) VALUES (?, ?, ?, ?, 'TOP_UP_DEPOSIT', ?, 0.0, 'NZD', ?, ?, ?, 'COMMITTED', ?)
      `).run(
        eventId,
        params.tenantId,
        params.depositIdempotencyKey,
        params.depositIdempotencyKey,
        -creditsToAdd, // negative consumption = credit
        balanceBefore,
        balanceAfter,
        now,
        JSON.stringify({ actor: params.actor, reason: params.reason || 'Manual top-up' })
      );

      // Update balance
      this.db.prepare(`
        UPDATE tenant_balances
        SET available_credits = ?, last_updated_at = ?
        WHERE tenant_id = ?
      `).run(balanceAfter, now, params.tenantId);

      this.db.exec('COMMIT');
      return {
        success: true,
        eventId,
        newBalance: balanceAfter,
        duplicate: false
      };
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  /**
   * Formal, auditable state transition
   */
  public transitionTenantState(params: {
    tenantId: string;
    targetState: TenantState;
    actor: string;
    reason: string;
  }): { success: boolean; event?: TenantStateTransitionEvent } {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const tenantRow = this.db.prepare(`SELECT * FROM tenants WHERE tenant_id = ?`).get(params.tenantId) as any;
      if (!tenantRow) {
        this.db.exec('ROLLBACK');
        return { success: false };
      }

      const fromState = tenantRow.state as TenantState;
      if (fromState === params.targetState) {
        this.db.exec('COMMIT');
        return { success: true };
      }

      const now = Date.now();
      const transitionId = `TR-${randomUUID()}`;

      this.db.prepare(`
        INSERT INTO tenant_state_transitions (
          transition_id, tenant_id, from_state, to_state, actor, reason, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(transitionId, params.tenantId, fromState, params.targetState, params.actor, params.reason, now);

      this.db.prepare(`UPDATE tenants SET state = ? WHERE tenant_id = ?`).run(params.targetState, params.tenantId);

      this.db.exec('COMMIT');

      return {
        success: true,
        event: {
          transitionId,
          tenantId: params.tenantId,
          fromState,
          toState: params.targetState,
          actor: params.actor,
          reason: params.reason,
          timestamp: now
        }
      };
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  /**
   * Query all registered tenants with their current balance
   */
  public getAllTenantsWithUsage(): Array<{
    identity: TenantIdentity;
    usage: TenantUsageState;
  }> {
    const stmt = this.db.prepare(`
      SELECT t.*, b.available_credits, b.total_triaged_count, b.unbilled_accrual_nzd, b.last_updated_at
      FROM tenants t
      LEFT JOIN tenant_balances b ON t.tenant_id = b.tenant_id
      ORDER BY t.created_at ASC;
    `);
    const rows = stmt.all() as any[];

    return rows.map(r => ({
      identity: this.mapTenantRow(r),
      usage: {
        tenantId: r.tenant_id,
        availableCredits: r.available_credits ?? 0,
        totalTriagedCount: r.total_triaged_count ?? 0,
        unbilledAccrualNzd: Number(r.unbilled_accrual_nzd ?? 0),
        lastActiveTimestamp: r.last_updated_at ?? r.created_at,
        lastFlushedTimestamp: r.last_updated_at ?? r.created_at
      }
    }));
  }

  /**
   * Query recent accounting ledger records for audit verification
   */
  public getRecentLedger(limit: number = 50): AccountingLedgerEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM accounting_ledger
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];

    return rows.map(r => ({
      eventId: r.event_id,
      tenantId: r.tenant_id,
      requestId: r.request_id,
      providerEventId: r.provider_event_id,
      operation: r.operation as any,
      creditsConsumed: r.credits_consumed,
      unitPriceNzd: r.unit_price_nzd,
      currency: 'NZD',
      balanceBefore: r.balance_before,
      balanceAfter: r.balance_after,
      timestamp: r.timestamp,
      status: r.status as any,
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }

  public close(): void {
    this.db.close();
  }

  private mapTenantRow(row: any): TenantIdentity {
    const isSuspended = row.state === 'SUSPENDED';
    return Object.freeze({
      tenantId: row.tenant_id,
      orgName: row.org_name,
      tier: row.tier as SubscriptionTier,
      capabilities: Object.freeze(JSON.parse(row.capabilities)),
      billingCurrency: row.billing_currency || 'NZD',
      unitCostPerAlertNzd: Number(row.unit_cost_nzd),
      rateLimitRps: Number(row.rate_limit_rps),
      keyHash: row.key_hash,
      state: row.state as TenantState,
      isSuspended,
      createdAt: Number(row.created_at)
    });
  }
}
