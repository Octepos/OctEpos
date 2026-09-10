import test, { describe } from 'node:test';
import assert from 'node:assert';
import { MerkleProofEngine, StateLeaf, NodeAttestationSignature } from '../src/security/MerkleProofEngine';

describe('OCTEPOS Merkle Proof Engine - Cryptographic Verification & Byzantine Fault Invariants', () => {
  test('Deterministic leaf hashing with RFC 8785 canonicalization & 0x00 domain separation', () => {
    const leafA: StateLeaf = {
      leafId: 'LEAF-TEST-01',
      leafType: 'POLICY_LEASE',
      data: { leaseId: 'LEASE-A', quota: 5, active: true },
      timestamp: 1789000000000
    };

    // Construct duplicate object with different key insertion order
    const leafB: StateLeaf = {
      timestamp: 1789000000000,
      leafType: 'POLICY_LEASE',
      leafId: 'LEAF-TEST-01',
      data: { active: true, quota: 5, leaseId: 'LEASE-A' }
    };

    const hashA = MerkleProofEngine.hashLeaf(leafA);
    const hashB = MerkleProofEngine.hashLeaf(leafB);

    assert.strictEqual(hashA, hashB, 'RFC 8785 canonicalization must yield identical hashes invariant to key order');
    assert.ok(hashA.startsWith('0x'));
    assert.strictEqual(hashA.length, 66); // 0x + 64 hex chars
  });

  test('Interior node hashing enforces 0x01 domain separation (prevents second-preimage attacks)', () => {
    const left = '0x1111111111111111111111111111111111111111111111111111111111111111';
    const right = '0x2222222222222222222222222222222222222222222222222222222222222222';

    const interiorHash = MerkleProofEngine.hashInterior(left, right);
    assert.ok(interiorHash.startsWith('0x'));
    assert.strictEqual(interiorHash.length, 66);

    // Left and right positions must produce different hashes (non-commutative)
    const reversedInteriorHash = MerkleProofEngine.hashInterior(right, left);
    assert.notStrictEqual(interiorHash, reversedInteriorHash);
  });

  test('Builds binary Merkle tree with RFC 6962 Odd-Node Direct Promotion', () => {
    const leaves: StateLeaf[] = [
      { leafId: 'L1', leafType: 'CLUSTER_NODE_HEARTBEAT', data: { node: 'node-1' }, timestamp: 100 },
      { leafId: 'L2', leafType: 'CLUSTER_NODE_HEARTBEAT', data: { node: 'node-2' }, timestamp: 200 },
      { leafId: 'L3', leafType: 'CLUSTER_NODE_HEARTBEAT', data: { node: 'node-3' }, timestamp: 300 }
    ];

    const engine = new MerkleProofEngine(leaves);
    const root = engine.getRoot();

    assert.ok(root.startsWith('0x'));
    assert.strictEqual(root.length, 66);

    // Generating proofs for all 3 leaves must verify against root
    for (const leaf of leaves) {
      const proof = engine.generateProof(leaf.leafId);
      assert.strictEqual(proof.verified, true);
      assert.strictEqual(proof.expectedRoot, root);
      
      const standaloneValid = MerkleProofEngine.verifyProof(proof.leafHash, proof.auditPath, root);
      assert.strictEqual(standaloneValid, true);
    }
  });

  test('Compact inclusion proof operates in O(log2 N) sibling steps', () => {
    // Generate 8 leaves (balanced tree, depth 3)
    const leaves: StateLeaf[] = Array.from({ length: 8 }, (_, i) => ({
      leafId: `LEAF-SCALE-${i}`,
      leafType: 'EVIDENCE_GATE_VERDICT',
      data: { alertIndex: i, verdict: 'FILTERED_FALSE_POSITIVE' },
      timestamp: 1000 + i
    }));

    const engine = new MerkleProofEngine(leaves);
    const proof = engine.generateProof('LEAF-SCALE-3');

    assert.strictEqual(proof.verified, true);
    // Tree size 8 -> log2(8) = exactly 3 sibling steps in auditPath
    assert.strictEqual(proof.auditPath.length, 3);
    assert.strictEqual(proof.treeSize, 8);
  });

  test('Detects Byzantine tamper: altering a single byte in leaf invalidates proof and alters root', () => {
    const leaves: StateLeaf[] = [
      { leafId: 'L1', leafType: 'POLICY_LEASE', data: { capabilities: ['READ_STATE'] }, timestamp: 100 },
      { leafId: 'L2', leafType: 'POLICY_LEASE', data: { capabilities: ['EMIT_TELEMETRY'] }, timestamp: 200 }
    ];

    const engine = new MerkleProofEngine(leaves);
    const originalRoot = engine.getRoot();

    // Tamper attempt: attacker tries to inject unauthorized CAPABILITY
    const tamperResult = engine.simulateTamper('L1', {
      capabilities: ['READ_STATE', 'EVALUATE_SECURITY_AST', 'ROOT_ESCAPE']
    });

    assert.strictEqual(tamperResult.originalRoot, originalRoot);
    assert.notStrictEqual(tamperResult.tamperedRoot, originalRoot);
    assert.strictEqual(tamperResult.proofVerifiesAgainstOriginalRoot, false);
    assert.strictEqual(tamperResult.tamperDetected, true);
  });

  test('Multi-node Proxmox consensus requires >= 2/3 signed quorum before epoch validation', () => {
    const engine = new MerkleProofEngine();
    const currentRoot = engine.getRoot();

    // Test with only 1 signature (insufficient, < 2/3)
    const singleSig: NodeAttestationSignature[] = [
      {
        nodeId: 'proxmox-pve-01',
        signature: '0x' + 'a'.repeat(64),
        timestamp: Date.now(),
        stateRoot: currentRoot
      }
    ];

    const consensus1 = engine.evaluateEpochConsensus(4900, singleSig);
    assert.strictEqual(consensus1.quorumAchieved, false);
    assert.strictEqual(consensus1.byzantineFaultToleranceVerified, false);

    // Test with 2 valid signatures (satisfies 2/3 quorum)
    const validSignatures: NodeAttestationSignature[] = [
      {
        nodeId: 'proxmox-pve-01',
        signature: '0x' + 'a'.repeat(64),
        timestamp: Date.now(),
        stateRoot: currentRoot
      },
      {
        nodeId: 'proxmox-pve-02',
        signature: '0x' + 'b'.repeat(64),
        timestamp: Date.now(),
        stateRoot: currentRoot
      }
    ];

    const consensus2 = engine.evaluateEpochConsensus(4901, validSignatures);
    assert.strictEqual(consensus2.quorumAchieved, true);
    assert.strictEqual(consensus2.byzantineFaultToleranceVerified, true);
    assert.strictEqual(consensus2.signatures.length, 2);

    // Reject Byzantine signature with stale/mismatched stateRoot
    const byzantineSignatures: NodeAttestationSignature[] = [
      {
        nodeId: 'proxmox-pve-01',
        signature: '0x' + 'a'.repeat(64),
        timestamp: Date.now(),
        stateRoot: currentRoot
      },
      {
        nodeId: 'proxmox-pve-02',
        signature: '0x' + 'b'.repeat(64),
        timestamp: Date.now(),
        stateRoot: '0xBAD0000000000000000000000000000000000000000000000000000000000000' // Forged/stale root
      }
    ];

    const consensus3 = engine.evaluateEpochConsensus(4902, byzantineSignatures);
    assert.strictEqual(consensus3.quorumAchieved, false, 'Consensus must reject stale/forged root');
    assert.strictEqual(consensus3.signatures.length, 1);
  });
});
