import getNodeEdges from "../database/nodeQuery/NodeEdgesQuery.js";
import graphBuilder from "../services/functions/graphBuilder.js";
import { dijkstra } from "../services/functions/queue.js";
import getNodeById from "../database/nodeQuery/NodeQuery.js";

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

    const nodes = await getNodeEdges();

    if (!nodes || nodes.length === 0) {
        throw new Error("No Locations found");
    }
     
    const builtGraph = graphBuilder(nodes);
    const result = dijkstra(builtGraph, sourceId, destinationId);

    const detailedPath = result.path.map(nodeObj => {
    const nodeId = nodeObj.id; // <-- extract numeric id
    const details = nodes.find(n => n.node_details_id === nodeId);
        return {
            id: nodeId,
            dist: nodeObj.dist, // optionally include distance
            name: details?.node_name || "Unknown",
            type: details?.type || "N/A"
        };
    });
    
    if (result.path.length === 0) {
        throw new Error("No path found from source to destination");
    }
    // Optional: clean the graph if needed
    // Debugging output  -- remove in production --
    // console.log("Shortest Path:", result.path);
    // console.log("Distances:", result.dist);
    // console.log("Graph:", builtGraph);

    console.log("Detailedpath:", detailedPath)
    return {
        // graph: builtGraph, //optional: return the graph for debugging or visualization
        // distances: result.dist, //optional: return distances for all nodes
        path: detailedPath //return the cleaned path with node ids and distances
    }
}