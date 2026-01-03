export const currentNodeSchema = (nodeData, hotspotData) => ({
    id: nodeData.id,
    currentNode_name: nodeData.node_name,
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


export const roomSpriteSchema = (nodeData) => ({
    room_number: nodeData.room_number,
    room_type: nodeData.room_type,
    room_img: nodeData.room_img,
    room_description: nodeData.room_description,
})