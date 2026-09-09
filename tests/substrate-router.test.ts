import test, { describe } from 'node:test';
import assert from 'node:assert';
import { SubstrateRouter, ProxmoxClusterState } from '../src/SubstrateRouter';
import { IntentPayload } from '../src/GlassFloorInterceptor';

describe('Substrate Router - Local Proxmox Cluster Constraints', () => {
  const HEALTHY_CLUSTER_STATE: ProxmoxClusterState = {
    nodesOnline: 2,
    latencyMs: 1.2,
    splitBrainDetected: false,
  };

  const VALID_INTENT: IntentPayload = {
    action: 'EXECUTE_COMPUTE',
    target: 'local_lxc_node',
    parameters: {},
    capabilities: ['COMPUTE_LOCAL']
  };

  test('Dispatches successfully when quorum is met and airgap is maintained', async () => {
    const router = new SubstrateRouter();
    
    await assert.doesNotReject(async () => {
      await router.dispatchToLocalCluster(VALID_INTENT, HEALTHY_CLUSTER_STATE);
    });
  });

  test('Halts dispatch when Corosync quorum is lost (< 2 nodes)', async () => {
    const router = new SubstrateRouter();
    const degradedState = { ...HEALTHY_CLUSTER_STATE, nodesOnline: 1 };
    
    await assert.rejects(
      async () => { await router.dispatchToLocalCluster(VALID_INTENT, degradedState); },
      { message: 'SUBSTRATE_ROUTING_FAULT: Quorum lost. Expected 2 nodes, found 1.' }
    );
  });

  test('Halts dispatch immediately on split-brain detection', async () => {
    const router = new SubstrateRouter();
    const splitBrainState = { ...HEALTHY_CLUSTER_STATE, splitBrainDetected: true };
    
    await assert.rejects(
      async () => { await router.dispatchToLocalCluster(VALID_INTENT, splitBrainState); },
      { message: 'SUBSTRATE_ROUTING_FAULT: Split-brain condition detected. Halting mutations.' }
    );
  });

  test('Halts dispatch if cluster latency exceeds 2.0ms threshold', async () => {
    const router = new SubstrateRouter();
    const highLatencyState = { ...HEALTHY_CLUSTER_STATE, latencyMs: 2.5 };
    
    await assert.rejects(
      async () => { await router.dispatchToLocalCluster(VALID_INTENT, highLatencyState); },
      { message: 'SUBSTRATE_ROUTING_FAULT: Cluster latency 2.5ms exceeds strict 2ms threshold.' }
    );
  });

  test('Traps zero-egress airgap violation (egressRequested flag)', async () => {
    const router = new SubstrateRouter();
    const egressIntent = { 
      ...VALID_INTENT, 
      parameters: { egressRequested: true } 
    };
    
    await assert.rejects(
      async () => { await router.dispatchToLocalCluster(egressIntent, HEALTHY_CLUSTER_STATE); },
      { message: 'SUBSTRATE_ROUTING_FAULT: ZERO_EGRESS_AIRGAP violated. External routing rejected.' }
    );
  });

  test('Traps zero-egress airgap violation (external HTTP target)', async () => {
    const router = new SubstrateRouter();
    const httpIntent = { 
      ...VALID_INTENT, 
      target: 'https://external-api.com/leak' 
    };
    
    await assert.rejects(
      async () => { await router.dispatchToLocalCluster(httpIntent, HEALTHY_CLUSTER_STATE); },
      { message: 'SUBSTRATE_ROUTING_FAULT: ZERO_EGRESS_AIRGAP violated. External routing rejected.' }
    );
  });
});
