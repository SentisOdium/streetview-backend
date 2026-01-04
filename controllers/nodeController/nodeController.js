import getHotspotById from "../../database/nodeQuery/HotspotQuery.js";
import getNodeById from "../../database/nodeQuery/NodeQuery.js";
import getSpriteByNodeId from "../../database/nodeQuery/SpriteQuery.js";

import { currentNodeSchema, 
         hotspotSchema, 
         roomSpriteSchema } from "../../schema/resSchema/NodeSchema.js";

export async function fetchHotspotById(req, res) {
    try {
        const {id} = req.params;

        const [nodeData, hotspotData, spriteData] = await Promise.all([
            getNodeById(id),
            getHotspotById(id),
            getSpriteByNodeId(id)
        ]);

        if(!nodeData){
            return res.status(404).json({ 
                error: "Node not found" 
            });
        }

         res.status(200).json({
            Node:{
                Current: currentNodeSchema(nodeData),
                Hotspots: hotspotData? hotspotData.map(hotspotSchema) : [],
                Room_Sprite: spriteData? spriteData.map(roomSpriteSchema): [],
            }
        });

    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}