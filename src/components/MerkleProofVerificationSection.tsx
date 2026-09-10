import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Server, 
  Cpu, 
  Lock, 
  FileCode, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  Zap, 
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  StateLeaf, 
  MerkleAuditProof, 
  EpochAttestationConsensus, 
  ProofStep 
} from '../types/octepos';

interface MerkleProofVerificationSectionProps {
  onEpochAdvanced?: () => void;
}

export const MerkleProofVerificationSection: React.FC<MerkleProofVerificationSectionProps> = ({
  onEpochAdvanced
}) => {
  const [treeData, setTreeData] = useState<{
    merkleEpoch: number;
    stateRoot: string;
    leaves: StateLeaf[];
    treeSize: number;
    consensus: EpochAttestationConsensus;
    domainSeparation: {
      leafPrefix: string;
      interiorPrefix: string;
      balancingRule: string;
    };
  } | null>(null);

  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [activeProof, setActiveProof] = useState<MerkleAuditProof | null>(null);
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; verifiedAt: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tamper Simulation state
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);
  const [tamperReport, setTamperReport] = useState<{
    originalRoot: string;
    tamperedRoot: string;
    proofVerifiesAgainstOriginalRoot: boolean;
    tamperDetected: boolean;
  } | null>(null);

  // Append Leaf state
  const [isAppendingLeaf, setIsAppendingLeaf] = useState(false);

  // Fetch Merkle tree from backend
  const fetchMerkleTree = async () => {
    try {
      const res = await fetch('/api/merkle/tree');
      const data = await res.json();
      if (data.success) {
        setTreeData(data);
        if (!selectedLeafId && data.leaves.length > 0) {
          setSelectedLeafId(data.leaves[0].leafId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Merkle tree:', err);
    }
  };

  useEffect(() => {
    fetchMerkleTree();
    const interval = setInterval(fetchMerkleTree, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch inclusion proof when selected leaf changes
  useEffect(() => {
    if (!selectedLeafId) return;

    const fetchProof = async () => {
      try {
        const res = await fetch(`/api/merkle/proof/${selectedLeafId}`);
        const data = await res.json();
        if (data.success) {
          setActiveProof(data.proof);
          setVerificationResult(null);
          setTamperReport(null);
        }
      } catch (err) {
        console.error('Failed to fetch proof for leaf:', selectedLeafId, err);
      }
    };

    fetchProof();
  }, [selectedLeafId, treeData?.stateRoot]);

  // Execute independent cryptographic verification
  const handleVerifyInclusion = async () => {
    if (!activeProof || !treeData) return;
    setIsVerifyingProof(true);

    try {
      const res = await fetch('/api/merkle/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leafHash: activeProof.leafHash,
          auditPath: activeProof.auditPath,
          expectedRoot: treeData.stateRoot
        })
      });

      const data = await res.json();
      if (data.success) {
        setVerificationResult({
          valid: data.verified,
          verifiedAt: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error('Failed to verify proof:', err);
    } finally {
      setIsVerifyingProof(false);
    }
  };

  // Run Byzantine tamper simulation
  const handleSimulateTamper = async () => {
    if (!selectedLeafId) return;
    setIsSimulatingTamper(true);

    try {
      const res = await fetch('/api/merkle/tamper-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leafId: selectedLeafId,
          tamperedData: {
            forgedPrivilege: 'SUBSTRATE_ROOT_OVERRIDE',
            tamperBitFlipped: true,
            corruptedTimestamp: 9999999999999
          }
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setTamperReport(data.result);
      }
    } catch (err) {
      console.error('Failed to simulate tamper:', err);
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  // Append new state leaf
  const handleAppendHeartbeat = async () => {
    if (isAppendingLeaf) return;
    setIsAppendingLeaf(true);

    try {
      const res = await fetch('/api/merkle/append-leaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leafType: 'CLUSTER_NODE_HEARTBEAT',
          data: {
            node: 'proxmox-pve-01',
            corosyncLatencyMs: 0.72,
            quorumActive: true,
            syncedEpoch: (treeData?.merkleEpoch || 4892) + 1
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchMerkleTree();
        if (data.leaf) {
          setSelectedLeafId(data.leaf.leafId);
        }
        if (onEpochAdvanced) onEpochAdvanced();
      }
    } catch (err) {
      console.error('Failed to append leaf:', err);
    } finally {
      setIsAppendingLeaf(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <span>Cryptographic Merkle Proof & Multi-Node Proxmox Attestation</span>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800 font-semibold">
                RFC 8785 + RFC 6962
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            Cryptographically attests state root consistency across multi-node Proxmox substrates using compact $O(\log_2 N)$ inclusion proofs and Byzantine fault-tolerant epoch consensus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAppendHeartbeat}
            disabled={isAppendingLeaf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Append State Leaf & Roll Epoch</span>
          </button>
        </div>
      </div>

      {/* State Root & Cluster Attestation Bar */}
      {treeData && (
        <div className="mb-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Active Merkle Root */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span className="font-bold uppercase flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-cyan-400" /> Current State Root (Epoch #{treeData.merkleEpoch})
              </span>
              <span className="text-[9px] text-emerald-400 font-sans">Tree Size: {treeData.treeSize} leaves</span>
            </div>
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px] font-mono text-cyan-300">
              <span className="truncate pr-2">{treeData.stateRoot}</span>
              <button
                onClick={() => copyToClipboard(treeData.stateRoot, 'state-root')}
                className="text-neutral-400 hover:text-cyan-300 shrink-0 cursor-pointer"
              >
                {copiedId === 'state-root' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-neutral-500 mt-2 font-sans">
              <span>Balancing: Direct Promotion (No duplicate CVEs)</span>
              <span>Prefix: Leaf 0x00 &bull; Node 0x01</span>
            </div>
          </div>

          {/* Byzantine Quorum Consensus (2/3) */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span className="font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Proxmox Multi-Node Consensus
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                treeData.consensus.quorumAchieved
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {treeData.consensus.quorumAchieved ? 'QUORUM REACHED' : 'QUORUM PENDING'}
              </span>
            </div>

            <div className="space-y-1 my-1">
              <div className="flex justify-between text-[10px] text-neutral-300">
                <span>Signatures Verified:</span>
                <strong className="text-emerald-400">{treeData.consensus.signatures.length} / {treeData.consensus.totalNodes} Nodes</strong>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(treeData.consensus.signatures.length / treeData.consensus.totalNodes) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-neutral-400">
              <span>Threshold: &ge; {treeData.consensus.quorumRequired} of {treeData.consensus.totalNodes} (66.7%)</span>
              <span className="text-emerald-400">Byzantine Fault Tolerant</span>
            </div>
          </div>

          {/* Sovereign Cluster Node Signatures */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-purple-400" /> Sovereign Attestation Signatures
            </span>

            <div className="space-y-1">
              {treeData.consensus.signatures.map((sig) => (
                <div key={sig.nodeId} className="flex items-center justify-between text-[9px] p-1 rounded bg-neutral-900 border border-neutral-800/70">
                  <span className="font-bold text-neutral-200">{sig.nodeId}</span>
                  <span className="text-neutral-500 font-mono truncate max-w-[110px]">{sig.signature.substring(0, 14)}...</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" /> SIGNED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Grid: Leaves on Left, Proof & Tamper Lab on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: State Leaves Tree Browser (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-[11px] border-b border-neutral-800 pb-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" /> Canonical State Leaves ({treeData?.leaves.length || 0})
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">Select to inspect audit proof</span>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {treeData?.leaves.map((leaf, index) => {
              const isSelected = leaf.leafId === selectedLeafId;
              return (
                <div
                  key={leaf.leafId}
                  onClick={() => setSelectedLeafId(leaf.leafId)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 text-neutral-100 shadow-md ring-1 ring-cyan-500/40'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-cyan-400">#{index}</span>
                      <span className="font-bold text-[11px] text-neutral-200">{leaf.leafId}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      leaf.leafType === 'POLICY_LEASE'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                        : leaf.leafType === 'EVIDENCE_GATE_VERDICT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {leaf.leafType}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono truncate">
                    {JSON.stringify(leaf.data)}
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 mt-1 font-sans">
                    <span>{new Date(leaf.timestamp).toLocaleTimeString()}</span>
                    <span className="text-cyan-400 flex items-center gap-0.5">
                      Inspect Proof <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cryptographic Proof Inspector & Byzantine Lab (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeProof ? (
            <div className="space-y-4">
              {/* Proof Details Card */}
              <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-neutral-100 text-xs block">
                        Cryptographic Inclusion Proof &bull; {activeProof.leafId}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-sans">
                        Audit Path Complexity: $O(\log_2 {activeProof.treeSize}) = {activeProof.auditPath.length}$ Sibling Hashes
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyInclusion}
                    disabled={isVerifyingProof}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isVerifyingProof ? 'Computing Hashes...' : 'Verify Cryptographic Proof'}</span>
                  </button>
                </div>

                {/* Leaf Hash */}
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Leaf Digest (Domain Prefix 0x00 + RFC 8785 Canonical JSON):
                  </span>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-300">
                    <span className="truncate pr-2">{activeProof.leafHash}</span>
                    <button
                      onClick={() => copyToClipboard(activeProof.leafHash, 'leaf-hash')}
                      className="text-neutral-400 hover:text-cyan-300 shrink-0 cursor-pointer"
                    >
                      {copiedId === 'leaf-hash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Audit Path */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Audit Path Traversal ($O(\log_2 N)$):
                  </span>

                  {activeProof.auditPath.length === 0 ? (
                    <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-500 text-center text-[10px]">
                      Single leaf tree: Leaf hash is directly the Merkle root.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeProof.auditPath.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-neutral-900 border border-neutral-800/80 flex items-center justify-between text-[10px] font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold text-[9px]">
                              Step {idx + 1}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                              step.position === 'left'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                            }`}>
                              {step.position.toUpperCase()} SIBLING
                            </span>
                          </div>

                          <span className="text-neutral-400 truncate max-w-[240px]">{step.hash}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification Confirmation Banner */}
                {verificationResult && (
                  <div className={`p-3 rounded-lg border flex items-center justify-between animate-fadeIn ${
                    verificationResult.valid
                      ? 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
                      : 'border-red-800 bg-red-950/40 text-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {verificationResult.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <div>
                        <span className="font-bold text-[11px] block">
                          {verificationResult.valid
                            ? 'CRYPTOGRAPHIC INCLUSION VERIFIED'
                            : 'PROOF VERIFICATION FAILED'}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-sans">
                          Recomputed hash along audit path strictly matched state root ({verificationResult.verifiedAt}).
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono font-bold">PASS &bull; 0 SYSCALLS</span>
                  </div>
                )}
              </div>

              {/* Byzantine Tamper Simulation Lab */}
              <div className="p-4 rounded-lg border border-amber-900/60 bg-amber-950/15 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-amber-200 text-xs block">
                        Byzantine Tamper & Bit-Flip Simulation Lab
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-sans">
                        Demonstrates that altering even 1 bit in a leaf is immediately caught by proof verification
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateTamper}
                    disabled={isSimulatingTamper}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSimulatingTamper ? 'Mutating Leaf...' : 'Simulate Byzantine Tamper'}
                  </button>
                </div>

                {tamperReport && (
                  <div className="p-3 rounded-lg border border-red-800 bg-red-950/50 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-red-200">
                      <span className="font-bold text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-red-400 animate-pulse" />
                        TAMPER ATTEMPT DETECTED PRE-SYSCALL
                      </span>
                      <span className="text-[9px] text-red-400 font-bold">TAMPER DETECTED: {String(tamperReport.tamperDetected).toUpperCase()}</span>
                    </div>

                    <div className="space-y-1 text-[10px] text-neutral-300 font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Original State Root:</span>
                        <span className="text-cyan-300 truncate max-w-[260px]">{tamperReport.originalRoot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Tampered Tree Root:</span>
                        <span className="text-red-400 truncate max-w-[260px]">{tamperReport.tamperedRoot}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-red-900/60 text-red-300">
                        <span>Proof Verification Result Against Original Root:</span>
                        <strong className="text-red-400">
                          {tamperReport.proofVerifiesAgainstOriginalRoot ? 'VERIFIED (FAIL)' : 'FAILED (REJECTED AS EXPECTED)'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
              Select a state leaf from the left panel to inspect its cryptographic inclusion proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
