import getNodeEdges from "../database/nodeQuery/NodeEdgesQuery.js";
import graphBuilder from "../services/functions/graphBuilder.js";
import { yenKShortestPaths } from "../services/functions/queue.js";
import getNodeById from "../database/nodeQuery/NodeQuery.js";
import getAllNodes from "../database/nodeQuery/NodeNamesQuery.js";

export default async function pathGenerationService(source, destination) {

    if (!source || !destination) {
        throw new Error("Source and destination are required");
    }

    const sourceRows = await getNodeById({ location: source });

    const destinationRows = await getNodeById({ location: destination });
    const sourceId = sourceRows?.id;
    const destinationId = destinationRows?.id;

    if (!sourceId || !destinationId) {
        throw new Error(`Invalid source or destination: '${source}' -> '${destination}'`);
    }

    const [nodes, allNodes] = await Promise.all([
        getNodeEdges(),
        getAllNodes()
    ]);

    if (!nodes || nodes.length === 0) {
        throw new Error("No Locations found");
    }

    const builtGraph = graphBuilder(nodes);

    if (!builtGraph[sourceId]) {
        throw new Error("Source node not in graph");
    }

    if (!builtGraph[destinationId]) {
        throw new Error("Destination node not in graph");
    }
    
    const paths = yenKShortestPaths(builtGraph, sourceId, destinationId, 3);

    if (paths.length === 0) {
        throw new Error("No path found from source to destination");
    }

    const nodeDetailsById = new Map(
        allNodes.map(node => [node.id, node])
    );

    const detailedPaths = paths.map((path, index) => {
        const detailedPath = path.map(nodeObj => {
            const details = nodeDetailsById.get(nodeObj.id);

            return {
                id: nodeObj.id,
                dist: nodeObj.dist,
                name: details?.node_name ?? "Unknown",
                type: details?.type ?? "N/A"
            };
        });

        return {
            label: `Route ${index + 1}${index === 0 ? " (Shortest)" : " (Alternative)"}`,
            dist: path[path.length - 1]?.dist ?? 0,
            path: detailedPath
        };
    });

    return {
        path: detailedPaths[0].path, // return shortest path for backward compatibility
        paths: detailedPaths
    };
}