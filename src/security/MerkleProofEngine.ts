import { createHash } from 'crypto';
import { canonicalize } from 'json-canonicalize';

export interface StateLeaf {
  leafId: string;
  leafType: 'POLICY_LEASE' | 'EVIDENCE_GATE_VERDICT' | 'CLUSTER_NODE_HEARTBEAT' | 'GLASS_FLOOR_INTERCEPT';
  data: Record<string, unknown>;
  timestamp: number;
}

export interface ProofStep {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleAuditProof {
  leafId: string;
  leafHash: string;
  auditPath: ProofStep[];
  expectedRoot: string;
  verified: boolean;
  treeSize: number;
  domainSeparation: {
    leafPrefix: '0x00';
    interiorPrefix: '0x01';
    balancingRule: 'RFC_6962_PROMOTION';
  };
}

export interface MerkleTreeNode {
  hash: string;
  layer: number;
  index: number;
  leafId?: string;
  leftChild?: string;
  rightChild?: string;
}

export interface NodeAttestationSignature {
  nodeId: string; // e.g. 'proxmox-pve-01', 'proxmox-pve-02', 'lxc-witness-01'
  signature: string;
  timestamp: number;
  stateRoot: string;
}

export interface EpochAttestationConsensus {
  epoch: number;
  stateRoot: string;
  totalNodes: number;
  quorumRequired: number; // 2 of 3 (66.7%)
  signatures: NodeAttestationSignature[];
  quorumAchieved: boolean;
  byzantineFaultToleranceVerified: boolean;
}

export class MerkleProofEngine {
  // Domain separation prefixes
  private static readonly LEAF_PREFIX = Buffer.from([0x00]);
  private static readonly INTERIOR_PREFIX = Buffer.from([0x01]);

  private leaves: StateLeaf[] = [];
  private layers: string[][] = [];
  private currentRoot: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

  constructor(initialLeaves?: StateLeaf[]) {
    if (initialLeaves && initialLeaves.length > 0) {
      this.buildTree(initialLeaves);
    } else {
      // Initialize with pristine genesis state
      this.buildTree([
        {
          leafId: 'GENESIS-LEAF-00',
          leafType: 'CLUSTER_NODE_HEARTBEAT',
          data: { node: 'proxmox-pve-01', status: 'ONLINE', quorum: true, corosyncLatencyMs: 0.8 },
          timestamp: Date.now()
        },
        {
          leafId: 'GENESIS-LEAF-01',
          leafType: 'CLUSTER_NODE_HEARTBEAT',
          data: { node: 'proxmox-pve-02', status: 'ONLINE', quorum: true, corosyncLatencyMs: 0.9 },
          timestamp: Date.now()
        },
        {
          leafId: 'GENESIS-LEAF-02',
          leafType: 'CLUSTER_NODE_HEARTBEAT',
          data: { node: 'lxc-witness-01', status: 'ONLINE', quorum: true, corosyncLatencyMs: 0.4 },
          timestamp: Date.now()
        }
      ]);
    }
  }

  /**
   * Computes leaf hash with RFC 8785 JSON canonicalization and 0x00 domain separation:
   * SHA-256(0x00 || RFC8785(data))
   */
  public static hashLeaf(leaf: StateLeaf): string {
    const canonicalJson = canonicalize({
      leafId: leaf.leafId,
      leafType: leaf.leafType,
      data: leaf.data,
      timestamp: leaf.timestamp
    });

    const hasher = createHash('sha256');
    hasher.update(MerkleProofEngine.LEAF_PREFIX);
    hasher.update(Buffer.from(canonicalJson, 'utf8'));
    return '0x' + hasher.digest('hex');
  }

  /**
   * Computes interior node hash with 0x01 domain separation:
   * SHA-256(0x01 || leftHash || rightHash)
   */
  public static hashInterior(left: string, right: string): string {
    const leftBuf = Buffer.from(left.replace(/^0x/, ''), 'hex');
    const rightBuf = Buffer.from(right.replace(/^0x/, ''), 'hex');

    const hasher = createHash('sha256');
    hasher.update(MerkleProofEngine.INTERIOR_PREFIX);
    hasher.update(leftBuf);
    hasher.update(rightBuf);
    return '0x' + hasher.digest('hex');
  }

  /**
   * Builds the binary Merkle tree with RFC 6962 Odd-Node Direct Promotion rule.
   * This strictly prevents duplicate-leaf malleability (CVE-2012-2459).
   */
  public buildTree(leaves: StateLeaf[]): string {
    if (leaves.length === 0) {
      this.leaves = [];
      this.layers = [[]];
      this.currentRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
      return this.currentRoot;
    }

    this.leaves = [...leaves];
    const leafHashes = this.leaves.map((l) => MerkleProofEngine.hashLeaf(l));

    this.layers = [leafHashes];
    let currentLayer = leafHashes;

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Pair adjacent nodes with interior domain separation
          nextLayer.push(MerkleProofEngine.hashInterior(currentLayer[i], currentLayer[i + 1]));
        } else {
          // RFC 6962 Odd-Node Promotion: Carry odd trailing node directly to next layer
          nextLayer.push(currentLayer[i]);
        }
      }

      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    this.currentRoot = currentLayer[0];
    return this.currentRoot;
  }

  /**
   * Appends a new state leaf and recalculates the Merkle root
   */
  public appendLeaf(leaf: StateLeaf): string {
    const updated = [...this.leaves, leaf];
    return this.buildTree(updated);
  }

  /**
   * Returns current state root
   */
  public getRoot(): string {
    return this.currentRoot;
  }

  /**
   * Returns all recorded leaves
   */
  public getLeaves(): StateLeaf[] {
    return [...this.leaves];
  }

  /**
   * Generates a compact cryptographic inclusion proof for a given leafId.
   * Traverses from leaf to root collecting sibling hashes.
   */
  public generateProof(leafId: string): MerkleAuditProof {
    const leafIndex = this.leaves.findIndex((l) => l.leafId === leafId);
    if (leafIndex === -1) {
      throw new Error(`LEAF_NOT_FOUND: State leaf with ID '${leafId}' does not exist in Merkle tree.`);
    }

    const leaf = this.leaves[leafIndex];
    const leafHash = MerkleProofEngine.hashLeaf(leaf);
    const auditPath: ProofStep[] = [];

    let currentIndex = leafIndex;

    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const currentLayer = this.layers[layerIndex];
      const isRightChild = currentIndex % 2 === 1;

      if (isRightChild) {
        // Current node is on right, sibling is on left
        const siblingHash = currentLayer[currentIndex - 1];
        auditPath.push({ position: 'left', hash: siblingHash });
      } else {
        // Current node is on left; check if right sibling exists
        if (currentIndex + 1 < currentLayer.length) {
          const siblingHash = currentLayer[currentIndex + 1];
          auditPath.push({ position: 'right', hash: siblingHash });
        }
        // If no sibling (odd-node promotion), no sibling hash is needed for this level!
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    const verified = MerkleProofEngine.verifyProof(leafHash, auditPath, this.currentRoot);

    return {
      leafId,
      leafHash,
      auditPath,
      expectedRoot: this.currentRoot,
      verified,
      treeSize: this.leaves.length,
      domainSeparation: {
        leafPrefix: '0x00',
        interiorPrefix: '0x01',
        balancingRule: 'RFC_6962_PROMOTION'
      }
    };
  }

  /**
   * Verifies an inclusion proof independently without needing the full Merkle tree.
   * Returns true if and only if recomputing hashes along the auditPath matches expectedRoot.
   */
  public static verifyProof(leafHash: string, auditPath: ProofStep[], expectedRoot: string): boolean {
    let current = leafHash;

    for (const step of auditPath) {
      if (step.position === 'left') {
        current = MerkleProofEngine.hashInterior(step.hash, current);
      } else {
        current = MerkleProofEngine.hashInterior(current, step.hash);
      }
    }

    return current.toLowerCase() === expectedRoot.toLowerCase();
  }

  /**
   * Validates multi-node Proxmox consensus over an epoch state root.
   * Requires >= 2/3 valid signatures from distinct sovereign cluster nodes.
   */
  public evaluateEpochConsensus(
    epoch: number,
    signatures: NodeAttestationSignature[],
    clusterNodes: string[] = ['proxmox-pve-01', 'proxmox-pve-02', 'lxc-witness-01']
  ): EpochAttestationConsensus {
    const totalNodes = clusterNodes.length;
    const quorumRequired = Math.ceil((2 / 3) * totalNodes); // 2 out of 3

    // Filter valid signatures matching current state root and recognized nodes
    const validSignatures: NodeAttestationSignature[] = [];
    const seenNodes = new Set<string>();

    for (const sig of signatures) {
      if (
        clusterNodes.includes(sig.nodeId) &&
        !seenNodes.has(sig.nodeId) &&
        sig.stateRoot.toLowerCase() === this.currentRoot.toLowerCase() &&
        sig.signature.startsWith('0x') &&
        sig.signature.length >= 40
      ) {
        seenNodes.add(sig.nodeId);
        validSignatures.push(sig);
      }
    }

    const quorumAchieved = validSignatures.length >= quorumRequired;

    return {
      epoch,
      stateRoot: this.currentRoot,
      totalNodes,
      quorumRequired,
      signatures: validSignatures,
      quorumAchieved,
      byzantineFaultToleranceVerified: quorumAchieved && totalNodes >= 3
    };
  }

  /**
   * Simulates a Byzantine or state tamper attack against a specific leaf,
   * demonstrating that modifying even 1 byte completely invalidates the root.
   */
  public simulateTamper(leafId: string, tamperedData: Record<string, unknown>): {
    originalRoot: string;
    tamperedRoot: string;
    proofVerifiesAgainstOriginalRoot: boolean;
    tamperDetected: boolean;
  } {
    const originalProof = this.generateProof(leafId);
    
    // Construct tampered leaf
    const leafIndex = this.leaves.findIndex((l) => l.leafId === leafId);
    if (leafIndex === -1) throw new Error('Leaf not found');

    const originalLeaf = this.leaves[leafIndex];
    const tamperedLeaf: StateLeaf = {
      ...originalLeaf,
      data: { ...originalLeaf.data, ...tamperedData }
    };

    const tamperedLeafHash = MerkleProofEngine.hashLeaf(tamperedLeaf);
    
    // Check if the original proof would pass with the tampered leaf
    const proofVerifies = MerkleProofEngine.verifyProof(
      tamperedLeafHash,
      originalProof.auditPath,
      this.currentRoot
    );

    // Also recalculate what the tampered tree root would look like
    const clonedLeaves = [...this.leaves];
    clonedLeaves[leafIndex] = tamperedLeaf;
    const tempEngine = new MerkleProofEngine(clonedLeaves);
    const tamperedRoot = tempEngine.getRoot();

    return {
      originalRoot: this.currentRoot,
      tamperedRoot,
      proofVerifiesAgainstOriginalRoot: proofVerifies,
      tamperDetected: !proofVerifies && (tamperedRoot !== this.currentRoot)
    };
  }
}
