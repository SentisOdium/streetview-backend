import getHotspotById from "../../database/nodeQuery/HotspotQuery.js";
import {getNodeById} from "../../database/nodeQuery/NodeQuery.js";
import { currentNodeSchema, 
         hotspotSchema, 
         roomSpriteSchema } from "../../schema/resSchema/NodeSchema.js";

export async function fetchHotspotById(req, res) {
    try {
        const {id} = req.params;

        const [nodeData, hotspotData] = await Promise.all([
            getNodeById(id),
            getHotspotById(id)
        ]);

        if(!nodeData){
            return res.status(404).json({ error: "Node not found" });
        }

         res.status(200).json({
            Node:{
                Current_Node: currentNodeSchema(nodeData),
                Hotspots: hotspotData.map(hotspotSchema),
                Room_Sprite: roomSpriteSchema(nodeData),
            }
        });

    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}