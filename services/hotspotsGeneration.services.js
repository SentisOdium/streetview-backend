import getHotspotById from "../database/nodeQuery/HotspotQuery.js";
import getNodeById from "../database/nodeQuery/NodeQuery.js";
import getSpriteByNodeId from "../database/nodeQuery/SpriteQuery.js";

import NodeSchema from "../schema/resSchema/NodeSchema.js";

export default async function hotspotsGenerationService(nodeId) {
    const node = Number(nodeId);

    if (!node) {
        throw new Error("Node ID is required");
    }

    const [nodeData, hotspotData, spriteData] = await Promise.all([
        getNodeById({id: node}),
        getHotspotById(node),
        getSpriteByNodeId(node)
    ]);

    if(!nodeData){
        throw new Error("Node not found");
    }

    return{
        Node: {
            Current: nodeData ? NodeSchema.currentNodeSchema(nodeData) : null,
            Hotspots: hotspotData? hotspotData.map(NodeSchema.hotspotSchema)  : [],
            Room_Sprite: spriteData? spriteData.map(NodeSchema.roomSpriteSchema): [],
        }
    }
}