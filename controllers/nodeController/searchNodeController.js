import getNodeById from "../../database/nodeQuery/NodeQuery.js";
import getHotspotById from "../../database/nodeQuery/HotspotQuery.js";
import getSpriteByNodeId from "../../database/nodeQuery/SpriteQuery.js";

import nodeSchema from "../../schema/resSchema/NodeSchema.js";

export async function searchNodeController(req, res) {
    try {
        const {location} = req.query;
            
        const nodeData = await getNodeById({ location })

        if(!nodeData){
            return res.status(404).json({ 
                error: "Location not found" 
            });
        }

        const [hotspotdata, spriteData] = await Promise.all([
            getHotspotById(nodeData.id),
            getSpriteByNodeId(nodeData.id)
        ]);

        res.status(200).json({
            Node:{
                Current: nodeSchema.currentNodeSchema(nodeData),
                Hotspots: hotspotdata? hotspotdata.map(nodeSchema.hotspotSchema) : [],
                Room_Sprite: spriteData? spriteData.map(nodeSchema.roomSpriteSchema): [],
            }
        });

    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}