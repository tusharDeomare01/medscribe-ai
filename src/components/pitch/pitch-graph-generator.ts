// ── Procedural Graph Layout Generator ────────────────────────────────
// Generates positions for the 23-page site map visualization using
// a simple radial cluster layout (force-directed-like).

import { SITE_NODES, CLUSTER_ANGLES } from "./pitch-slides";

export interface GraphNode {
  id: string;
  name: string;
  cluster: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

/**
 * Compute node positions using radial cluster layout.
 *
 * @param centerX  Center X of the graph
 * @param centerY  Center Y of the graph
 * @param clusterRadius  Distance from center to cluster centers
 * @param nodeSpread     How far nodes spread within a cluster
 */
export function computeGraphLayout(
  centerX: number = 400,
  centerY: number = 300,
  clusterRadius: number = 180,
  nodeSpread: number = 55
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const clusterNodes: Record<string, typeof SITE_NODES> = {};

  // Group nodes by cluster
  for (const node of SITE_NODES) {
    if (!clusterNodes[node.cluster]) clusterNodes[node.cluster] = [];
    clusterNodes[node.cluster].push(node);
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const [cluster, members] of Object.entries(clusterNodes)) {
    const angleDeg = CLUSTER_ANGLES[cluster] ?? 0;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Cluster center position
    const isCore = cluster === "core";
    const cx = isCore ? centerX : centerX + Math.cos(angleRad) * clusterRadius;
    const cy = isCore ? centerY : centerY + Math.sin(angleRad) * clusterRadius;

    // Place nodes within cluster
    members.forEach((member, i) => {
      let x: number, y: number;

      if (isCore) {
        // Core node at exact center
        x = centerX;
        y = centerY;
      } else if (members.length === 1) {
        x = cx;
        y = cy;
      } else {
        // Spread within cluster in a small circle
        const subAngle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
        const spreadR = Math.min(nodeSpread, nodeSpread * (members.length / 6));
        x = cx + Math.cos(subAngle) * spreadR;
        y = cy + Math.sin(subAngle) * spreadR;
      }

      nodes.push({
        id: member.id,
        name: member.name,
        cluster,
        x: Math.round(x),
        y: Math.round(y),
      });

      // Edge from dashboard (core) to every non-core node
      if (!isCore) {
        edges.push({ from: "dashboard", to: member.id });
      }
    });
  }

  return { nodes, edges };
}

/**
 * Get cluster summary info for labeling.
 */
export function getClusterSummaries(
  nodes: GraphNode[]
): { cluster: string; count: number; centerX: number; centerY: number }[] {
  const clusters: Record<string, GraphNode[]> = {};
  for (const node of nodes) {
    if (node.cluster === "core") continue;
    if (!clusters[node.cluster]) clusters[node.cluster] = [];
    clusters[node.cluster].push(node);
  }

  return Object.entries(clusters).map(([cluster, members]) => ({
    cluster,
    count: members.length,
    centerX: Math.round(members.reduce((s, n) => s + n.x, 0) / members.length),
    centerY: Math.round(members.reduce((s, n) => s + n.y, 0) / members.length),
  }));
}
