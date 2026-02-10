import getNodeListQuery from "../../database/nodeQuery/ListQuery.js";
import graphBuilder from "../../functions/graphBuilder.js";
import { dijkstra } from "../../functions/queue.js";

export async function pathGenController(req, res) {
    try {
        const { source, destination } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ error: "Source and destination are required" });
        }

        const nodeList = await getNodeListQuery();

        if (!nodeList || nodeList.length === 0) {
            return res.status(404).json({ error: "No Locations found" });
        }

        const graph = graphBuilder(nodeList);   
        const result = dijkstra(graph, source, destination); 

        if (result.path.length === 0) {
            return res.status(404).json({ error: "No path found from source to destination" });
        }

        // console.log("Graph:", graph);
        console.log("Shortest Path:", result.path);
        // console.log("Distances:", result.dist);

        return res.status(200).json({ 
            graph,
            dist: result.dist,
            path: result.path
        });

    } catch (error) {
        console.error("Error Creating Path Generation Preview:", error);
        res.status(500).json({ error: "Error Creating Path Generation Preview" });
    }
}
