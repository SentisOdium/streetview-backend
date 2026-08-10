export const currentNodeSchema = (nodeData) => ({
    id: nodeData.id,
    node_name: nodeData.node_name,
    img: {
        src: nodeData.src,
        alt: nodeData.alt,
        rotation_offset: nodeData.rotationOffset,
        rotation_offset_x: nodeData.rotationOffsetX,
        rotation_offset_z: nodeData.rotationOffsetZ,
    }
});

export const hotspotSchema = (hotspotData) => ({
    destination_id: hotspotData.destination_node_id,
    destination_name: hotspotData.target_name,
    hotspot_label: hotspotData.direction ?? hotspotData.target_name,
    yaw: hotspotData.yaw ?? null,
    pitch: hotspotData.pitch ?? null,
    marker_width: hotspotData.marker_width ?? 35,
    marker_height: hotspotData.marker_height ?? 55,
});


export const roomSpriteSchema = (spriteData) => ({
    room_number: spriteData.room_number,
    room_type: spriteData.room_type,
    room_img: spriteData.room_img,
    room_description: spriteData.room_description,
    phone: spriteData.phone,
    hours: spriteData.hours,
})

export default {
    currentNodeSchema,
    hotspotSchema,
    roomSpriteSchema
}