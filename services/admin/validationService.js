import getAllNodes from "../../database/nodeQuery/NodeNamesQuery.js";
import {
  getAllLocationsAdmin,
  getAllHotspotsAdmin,
  getGraphDataAdmin,
} from "../../database/adminQuery/AdminQuery.js";

export async function validateNavigationGraph() {
  const errors = [];
  const warnings = [];

  const [locations, hotspots, graph] = await Promise.all([
    getAllLocationsAdmin(),
    getAllHotspotsAdmin(),
    getGraphDataAdmin(),
  ]);

  const locationIds = new Set(locations.map((l) => l.id));
  const locationNames = new Map(locations.map((l) => [l.id, l.node_name]));

  for (const loc of locations) {
    if (!loc.panorama_image?.trim()) {
      errors.push({
        type: "missing_panorama",
        message: `Location "${loc.node_name}" is missing a panorama image`,
        locationId: loc.id,
      });
    }
  }

  const connectionKey = (sourceId, destId) => `${sourceId}->${destId}`;
  const seen = new Set();

  for (const hs of hotspots) {
    if (!locationIds.has(hs.source_id)) {
      errors.push({
        type: "missing_source",
        message: `Hotspot references missing source (id: ${hs.source_id})`,
        hotspotId: hs.id,
      });
    }
    if (!locationIds.has(hs.destination_id)) {
      errors.push({
        type: "missing_destination",
        message: `Hotspot from "${hs.source_name}" points to missing destination (id: ${hs.destination_id})`,
        hotspotId: hs.id,
      });
    }

    const key = connectionKey(hs.source_id, hs.destination_id);
    if (seen.has(key)) {
      warnings.push({
        type: "duplicate_connection",
        message: `Duplicate hotspot: "${hs.source_name}" → "${hs.destination_name}"`,
        hotspotId: hs.id,
      });
    }
    seen.add(key);
  }

  const connectedIds = new Set();
  for (const edge of graph.edges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  for (const node of graph.nodes) {
    if (!connectedIds.has(node.id) && graph.nodes.length > 1) {
      warnings.push({
        type: "orphan_node",
        message: `Orphan location: "${node.node_name}" has no hotspot connections`,
        locationId: node.id,
      });
    }
  }

  const cycles = detectCircularRoutes(graph.edges);
  for (const cycle of cycles) {
    warnings.push({
      type: "circular_route",
      message: `Circular navigation detected: ${cycle.map((id) => locationNames.get(id) || id).join(" → ")}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
      totalLocations: locations.length,
      totalHotspots: hotspots.length,
    },
  };
}

function detectCircularRoutes(edges) {
  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source).push(e.target);
  }

  const cycles = [];
  const visited = new Set();
  const stack = new Set();

  function dfs(node, path) {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx >= 0) cycles.push([...path.slice(idx), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const next of adj.get(node) || []) {
      dfs(next, [...path, next]);
    }
    stack.delete(node);
  }

  for (const node of adj.keys()) {
    dfs(node, [node]);
  }

  return cycles.slice(0, 10);
}

export async function validateBeforeSave(entityType, payload) {
  const result = await validateNavigationGraph();
  const entityErrors = [];

  if (entityType === "hotspot") {
    if (!payload.destination_id) {
      entityErrors.push({ type: "missing_destination", message: "Destination is required" });
    }
    if (!payload.hotspot_label?.trim()) {
      entityErrors.push({ type: "missing_label", message: "Hotspot label is required" });
    }
  }

  if (entityType === "location") {
    if (!payload.node_name?.trim()) {
      entityErrors.push({ type: "missing_name", message: "Location name is required" });
    }
  }

  return {
    valid: entityErrors.length === 0,
    errors: [...entityErrors, ...result.errors],
    warnings: result.warnings,
  };
}
