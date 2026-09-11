# OCTEPOS Formal Engineering Specification: Invariant-Based Control Plane
**Document Version:** 4.0.0-Formal  
**System Designation:** OCTEPOS Zero-Ambient-Authority Control Plane  
**Security Model:** Deterministic Policy Decision Point (PDP) / Policy Enforcement Point (PEP) Separation  
**Standard References:** RFC 8785 (JCS), RFC 6962 (Certificate Transparency Merkle Trees), NIST SP 800-207 (Zero Trust Architecture)

---

## 1. System Threat Model & Boundary Definitions

### 1.1 The Threat Model
The system assumes the Generative AI Model (whether a local weight model like LLaMA-3 or a remote frontier API like Gemini 2.5 Flash) is **inherently untrusted and adversarial**. The threat surface includes:
1. **Adversarial Prompt Injection**: Malicious user input manipulating the model into emitting destructive commands (e.g. `DROP TABLE`, `rm -rf`, unauthorized ledger transfer).
2. **Ambient Credential Hijacking**: Exploits where an agent process leverages ambient environment credentials (e.g. AWS IAM roles, environment secrets, database connection strings) to perform side-effects without explicit authorization.
3. **Non-Deterministic State Divergence**: Hallucinated parameters leading to duplicate billing, invalid schema mutations, or inconsistent multi-tenant state.
4. **Covert Egress Exfiltration**: In-process exfiltration of sensitive tokens via outbound TCP/UDP network connections.

### 1.2 Boundary Architecture & Pipeline Topology

The execution lifecycle enforces a strict, unidirectional 5-stage pipeline:

```
┌─────────────────┐
│  Untrusted LLM  │ (Local vLLM UNIX socket OR Isolated TLS Worker)
└────────┬────────┘
         │ 1. Raw Response Tokens
         ▼
┌─────────────────┐
│  Evidence Gate  │ [Invariant I_2: Schema & Canonicalization Filter]
└────────┬────────┘
         │ 2. Canonical JSON Evidence (RFC 8785)
         ▼
┌─────────────────┐
│ CEL Policy (PDP)│ [Invariant I_3: Pure Deterministic Evaluation]
└────────┬────────┘
         │ 3. Authorization Decision (PERMIT / DENY) + Capability Lease
         ▼
┌─────────────────┐
│ Execution Gate  │ [Invariant I_0: Glass Floor Userspace Reference Monitor]
│     (PEP)       │ (Traps pre-syscall; strictly 0 unauthorized kernel calls)
└────────┬────────┘
         │ 4. Atomic Action Execution
         ▼
┌─────────────────┐
│ Merkle & WAL    │ [Invariant I_5: Cryptographic State Provenance & Idempotency]
│     Ledger      │
└─────────────────┘
```

---

## 2. Formally Stated Invariants

### Invariant $\mathcal{I}_0$ — Isolation Boundary & Zero Syscall Egress
* **Statement:** An unauthorized action intent $A \notin \text{Caps}(L)$ submitted to the Execution Gate shall trigger a userspace interception and abort **prior to the invocation of any host operating system system call**.
* **Mathematical Definition:**
  $$\forall A \in \text{Intents}, \quad \text{Authorized}(A, L) = \text{False} \implies \text{SyscallsDispatched}(A) = 0$$
* **Implementation Mechanism:**
  1. The target execution environment runs within a restricted `seccomp-bpf` filter and unprivileged Linux namespace (`CLONE_NEWUSER | CLONE_NEWPID | CLONE_NEWNET`).
  2. The Glass Floor Interceptor acts as a userspace reference monitor over an in-memory or UNIX domain socket protocol.
  3. Authorization validation occurs purely in memory. If validation fails, an internal `GLASS_FLOOR_VIOLATION` exception is raised, memory is wiped, and execution halts. No `SYS_connect`, `SYS_sendto`, `SYS_write`, or `SYS_execve` is dispatched to the host Linux kernel.

---

### Invariant $\mathcal{I}_1$ — Airgap vs. External Network Mutual Exclusivity
* **Statement:** An OCTEPOS instance operates in one of two mutually exclusive modes: $\mathcal{M} \in \{\text{AIRGAP\_STRICT}, \text{HYBRID\_SIDECAR}\}$. An instance in $\text{AIRGAP\_STRICT}$ mode is physically incapable of dispatching outbound network traffic to external APIs.
* **Mathematical Definition:**
  $$\mathcal{M} = \text{AIRGAP\_STRICT} \iff (\text{RoutingTable} = \{\text{lo}: 127.0.0.1/8\} \land \text{ExtPacketsSent} \equiv 0)$$
* **Implementation Mechanism:**
  1. **$\text{AIRGAP\_STRICT}$ Deployment:**
     - Container network namespace is booted without an `eth0` interface (or with `NET_ADMIN` dropped and no default gateway).
     - Model execution is bound strictly to local weights (vLLM, llama.cpp) communicating over a local UNIX domain socket (`/var/run/octepos/vllm.sock`).
     - External cloud endpoints (e.g. Gemini, OpenAI) are unresolvable (DNS disabled) and unroutable (no network stack).
  2. **$\text{HYBRID\_SIDECAR}$ Deployment:**
     - Outbound egress is pinned strictly to explicitly whitelisted TLS IP/SNI destinations through an egress proxy with mutual TLS (mTLS). Model outputs are still subject to $\mathcal{I}_0$ and $\mathcal{I}_2$.

---

### Invariant $\mathcal{I}_2$ — Separation of Evidence from Execution (PDP/PEP)
* **Statement:** Output emitted by any AI model is strictly typed as untrusted **Evidence ($E$)** and possesses zero ambient execution authority.
* **Mathematical Definition:**
  $$E = \langle D_{\text{candidate}}, R_{\text{tokens}}, \sigma_{\text{model}} \rangle \quad \text{where} \quad \text{Authority}(E) \equiv \emptyset$$
* **Implementation Mechanism:**
  1. The Evidence Gate validates $D_{\text{candidate}}$ against a strict schema (JSON Schema / Zod).
  2. The output is canonicalized using RFC 8785 (JSON Canonicalization Scheme) to eliminate whitespace/key ordering variance:
     $$J_{\text{canonical}} = \text{canonicalize}(E)$$
  3. No model output is ever piped directly to an `eval()`, shell interpreter, or database client.

---

### Invariant $\mathcal{I}_3$ — Deterministic Policy Evaluation
* **Statement:** The Policy Decision Point (PDP) evaluation function $f_{\text{eval}}$ is pure, side-effect free, and mathematically deterministic over identical canonical inputs.
* **Mathematical Definition:**
  $$\forall t_1, t_2 \in \text{Time}, \quad f_{\text{eval}}(J_{\text{canonical}}, C, P)_{t_1} \equiv f_{\text{eval}}(J_{\text{canonical}}, C, P)_{t_2}$$
* **Implementation Mechanism:**
  1. The policy engine uses Google's Common Expression Language (CEL) with disabled extension functions (no random, no wall-clock variance, no ambient I/O).
  2. Evaluation is strictly budget-bounded: runtime is hard-capped at $T_{\text{eval}} \le 2.0\text{ ms}$ with maximum AST depth $\le 10$.
  3. Policies are immutable, content-addressed files identified by SHA-256 digests.

---

### Invariant $\mathcal{I}_4$ — Zero Ambient Authority & Monotonic Attenuation
* **Statement:** No process or function executes with implicit privileges. All operations require an explicit, unforgeable capability token with monotonically non-increasing scope.
* **Mathematical Definition:**
  $$\forall L_{\text{child}}, L_{\text{parent}}, \quad \text{Scope}(L_{\text{child}}) \subseteq \text{Scope}(L_{\text{parent}}) \quad \land \quad \text{TTL}(L_{\text{child}}) \le \text{TTL}(L_{\text{parent}})$$
* **Implementation Mechanism:**
  1. Tokens are HMAC-SHA256 capability grants signed with an isolated cluster secret (`OCTEPOS_KEY_SALT`).
  2. Tokens specify an exact lease lifetime (TTL) and max invocation budget.
  3. When an agent creates a sub-task, it can only delegate a strict subset of its active capabilities.

---

### Invariant $\mathcal{I}_5$ — Cryptographic State Provenance & Transaction Idempotency
* **Statement:** Every committed action must be atomically paired with an RFC 6962 binary Merkle leaf and executed exactly once per idempotent key.
* **Mathematical Definition:**
  $$\forall K_{\text{idempotency}}, \quad \text{Executions}(K_{\text{idempotency}}) \le 1 \quad \land \quad \text{Root}_{N} = \text{MerkleUpdate}(\text{Root}_{N-1}, \text{SHA256}(0\text{x}00 \,\|\, J_{\text{canonical}}))$$
* **Implementation Mechanism:**
  1. Duplicate deliveries matching $K_{\text{idempotency}}$ return cached signed receipts without invoking the downstream system.
  2. The local ledger uses SQLite in WAL (Write-Ahead Logging) mode with `PRAGMA synchronous = NORMAL; BEGIN IMMEDIATE`.
  3. Merkle leaves use RFC 6962 standard byte domain separation (`0x00` for leaf nodes, `0x01` for internal parent nodes) to eliminate second-preimage attacks.

---

## 3. Verification Test Matrix & Falsification Criteria

To establish this specification as verifiable and falsifiable, the test suite executes four deterministic test harnesses:

| Test Harness ID | Invariant Tested | Adversarial Vector / Condition | Passing Falsification Criteria |
| :--- | :--- | :--- | :--- |
| **`TEST-INV-01`** | $\mathcal{I}_0$ (Zero Syscall Leak) | Inject `MUTATE_LEDGER` or `../../etc/passwd` intent payload | Glass Floor traps payload in memory; system call tracer (`strace` / `seccomp_tracer`) records **0 dispatched syscalls** for `write`/`connect`. |
| **`TEST-INV-02`** | $\mathcal{I}_1$ (Airgap Isolation) | Attempt HTTP socket open in `AIRGAP_STRICT` mode | OS kernel socket creation fails with `ENETUNREACH` or `EPERM`; 0 bytes egress loopback. |
| **`TEST-INV-03`** | $\mathcal{I}_2$ & $\mathcal{I}_3$ (PDP Determinism) | Submit 10,000 randomized permutations of JSON evidence | RFC 8785 canonical hashes are identical; CEL policy evaluation outcome is 100.00% invariant across runs. |
| **`TEST-INV-04`** | $\mathcal{I}_4$ (Monotonic Attenuation) | Sub-task attempts to claim `WRITE_STATE` when parent has only `READ_STATE` | `PolicyLeaseManager` rejects token issuance with `ATTENUATION_VIOLATION`. |
| **`TEST-INV-05`** | $\mathcal{I}_5$ (Idempotency & WAL) | Resubmit identical payload with same UUID 500 times concurrently | Exactly 1 record written to SQLite WAL; exactly 1 leaf added to Merkle tree; 499 cached receipts returned. |

---

## 4. Hardware Lab & Proxmox Verification Architecture

In the sovereign laboratory setting, the invariant verification harness is deployed across dual Lenovo ThinkCentre M700 nodes running Proxmox VE:

```
┌────────────────────────────────────────────────────────┐
│ PROXMOX NODE 1 (10.0.40.10) - Corosync Quorum Master   │
│  - LXC 201: Airgapped Model Runner (vLLM, lo only)     │
│  - LXC 202: OCTEPOS Glass Floor & CEL PDP Engine       │
│  - SQLite WAL local state / Merkle Leaf accumulator    │
└───────────────────────────┬────────────────────────────┘
                            │ Corosync Ring (Dedicated Eth Link)
                            │ Quorum Requirement: >= 2 Votes
┌───────────────────────────▼────────────────────────────┐
│ PROXMOX NODE 2 (10.0.40.11) - Witness & Backup Quorum  │
│  - Synchronized Merkle State Root Verification         │
│  - Independent Hardware Attestation Probes             │
└────────────────────────────────────────────────────────┘
```

If Corosync quorum drops below the $\ge 2/3$ threshold (e.g. network split or node power cut), the Substrate Router **immediately revokes all active policy leases** and transitions the Glass Floor to `FAIL_CLOSED`.

---

## 5. Standard Compliance Traceability Matrix

| Invariant | SOC 2 Type II Trust Principle | ISO/IEC 27001:2022 Control | NIST SP 800-207 Tenet |
| :--- | :--- | :--- | :--- |
| **$\mathcal{I}_0$ (Syscall Trap)** | CC6.6 (Boundary Protection), CC6.8 (Malicious Code) | A.8.20 (Network Security), A.8.28 (Secure Coding) | Tenet 4: Dynamic Resource Access |
| **$\mathcal{I}_1$ (Airgap)** | CC6.6 (Perimeter Controls) | A.8.22 (Segregation of Networks) | Tenet 2: Secure Communication |
| **$\mathcal{I}_2$ (PDP/PEP)** | CC6.1 (Logical Access), CC6.3 (Least Privilege) | A.5.15 (Access Control) | Tenet 1: All Data Sources Considered Resources |
| **$\mathcal{I}_3$ (Determinism)** | CC8.1 (Change & Execution Integrity) | A.8.31 (Separation of Environments) | Tenet 5: Dynamic State Monitoring |
| **$\mathcal{I}_4$ (Zero Ambient)** | CC6.2 (Credential Issuance & TTL) | A.9.4 (Privilege Management) | Tenet 6: Authentication & Authorization Dynamic |
| **$\mathcal{I}_5$ (Merkle State)** | CC7.2 (Audit Logging & Non-Repudiation) | A.8.24 (Use of Cryptography) | Tenet 7: Continuous Diagnostics & Logging |
