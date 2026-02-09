import getNodeListQuery from "../../database/nodeQuery/ListQuery";
import graphBuilder from "../../functions/graphBuilder";
import { dijkstra } from "../../functions/queue";

export async function pathGenController(req, res){
    try {
        
        const { source, destination } = req.body;
        const nodeList = await getNodeListQuery();

        if(!nodeList || nodeList.length === 0){
            return res.status(404).json({ error: "No Locations found" });
        }

        const graph = graphBuilder(nodeList);   
        const result = dijkstra(graph, source); 

        if(!result[destination]){
            return res.status(404).json({ error: "No path found from source to destination" });
        }

    } catch (error) {
        console.error("Error Creating Path Generation Preview:", error);
        res.status(500).json({ error: "Error Creating Path Generation Preview"});
    }
}