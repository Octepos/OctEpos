import { IntentPayload } from './GlassFloorInterceptor';

export interface ProxmoxClusterState {
  nodesOnline: number;
  latencyMs: number;
  splitBrainDetected: boolean;
}

export class SubstrateRouter {
  private readonly REQUIRED_QUORUM = 2;
  private readonly MAX_LATENCY_MS = 2.0;

  /**
   * Evaluates cluster health and routes the payload to the local Proxmox substrate.
   * Enforces strict quorum, latency, and airgap invariants.
   */
  public async dispatchToLocalCluster(payload: IntentPayload, state: ProxmoxClusterState): Promise<void> {
    try {
      this.verifyCorosyncQuorum(state);
      this.enforceZeroEgressAirgap(payload);
      
      // If invariants hold, proceed with local LXC dispatch
      console.log(`[ROUTER] Dispatching ${payload.action} to Proxmox substrate...`);
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // Any failure in cluster state halts routing immediately
      throw new Error(`SUBSTRATE_ROUTING_FAULT: ${message}`);
    }
  }

  private verifyCorosyncQuorum(state: ProxmoxClusterState): void {
    if (state.splitBrainDetected) {
      throw new Error("Split-brain condition detected. Halting mutations.");
    }
    if (state.nodesOnline < this.REQUIRED_QUORUM) {
      throw new Error(`Quorum lost. Expected ${this.REQUIRED_QUORUM} nodes, found ${state.nodesOnline}.`);
    }
    if (state.latencyMs > this.MAX_LATENCY_MS) {
      throw new Error(`Cluster latency ${state.latencyMs}ms exceeds strict 2ms threshold.`);
    }
  }

  private enforceZeroEgressAirgap(payload: IntentPayload): void {
    // Ensure the payload doesn't contain external network targets or egress flags
    if (payload.parameters?.egressRequested || payload.target.startsWith('http')) {
      throw new Error("ZERO_EGRESS_AIRGAP violated. External routing rejected.");
    }
  }
}
