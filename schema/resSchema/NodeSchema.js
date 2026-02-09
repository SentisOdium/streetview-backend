export const currentNodeSchema = (nodeData) => ({
    id: nodeData.id,
    node_name: nodeData.node_name,
    coordinates: nodeData.coordinates,
    img: {
        src: nodeData.src,
        alt: nodeData.alt,
    }
});

export const hotspotSchema = (hotspotData) => ({
    node_id: hotspotData.target_node_id,
    currentNode_id: hotspotData.id,
    hotspot_name: hotspotData.node_name,
    coordinates:{
        node_Coordinates: hotspotData.coordinates,
        node_Direction: hotspotData.direction,
    }
});


export const roomSpriteSchema = (spriteData) => ({
    room_number: spriteData.room_number,
    room_type: spriteData.room_type,
    room_img: spriteData.room_img,
    room_description: spriteData.room_description,
})

export default {
    currentNodeSchema,
    hotspotSchema,
    roomSpriteSchema
}