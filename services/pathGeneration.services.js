import getNodeListQuery from "../database/nodeQuery/ListQuery.js";
import graphBuilder from "../services/functions/graphBuilder.js";
import { dijkstra } from "../services/functions/queue.js";

export default async function pathGenerationService(source, destination) {
    if (!source || !destination) {
        throw new Error("Source and destination are required");
    }

    const nodes = await getNodeListQuery();

    if (!nodes || nodes.length === 0) {
        throw new Error("No Locations found");
    }

    const builtGraph = graphBuilder(nodes);
    const result = dijkstra(builtGraph, source, destination);

    if (result.path.length === 0) {
        throw new Error("No path found from source to destination");
    }

    // Debugging output  -- romove or comment out in production
    console.log("Shortest Path:", result.path);
    console.log("Distances:", result.dist);
    console.log("Graph:", builtGraph);

    return {
        graph: builtGraph,
        dist: result.dist,
        path: result.path
    }
}