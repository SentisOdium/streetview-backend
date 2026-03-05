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

    if (result.path.length === 0) {
        throw new Error("No path found from source to destination");
    }
    // Optional: clean the graph if needed
    // Debugging output  -- remove in production --
    // console.log("Shortest Path:", result.path);
    // console.log("Distances:", result.dist);
    // console.log("Graph:", builtGraph);

    return {
        // graph: builtGraph, //optional: return the graph for debugging or visualization
        // distances: result.dist, //optional: return distances for all nodes
        path: result.path //return the cleaned path with node ids and distances
    }
}