import getNodeById from "../database/nodeQuery/NodeQuery.js";
import getHotspotById from "../database/nodeQuery/HotspotQuery.js";
import getSpriteByNodeId from "../database/nodeQuery/SpriteQuery.js";

import NodeSchema from "../schema/resSchema/NodeSchema.js";

export default async function searchNodeService(location) {
    const nodeData = await getNodeById({ location })

    if(!nodeData){
        throw new Error("Location not found");
    }

    const [hotspotdata, spriteData] = await Promise.all([
        getHotspotById(nodeData.id),
        getSpriteByNodeId(nodeData.id)
    ]);


    return {
        Node:{
            Current: nodeData ? NodeSchema.currentNodeSchema(nodeData) : null,
            Hotspots: hotspotdata? hotspotdata.map(NodeSchema.hotspotSchema)  : [],
            Room_Sprite: spriteData? spriteData.map(NodeSchema.roomSpriteSchema): [],
        }
    }
}