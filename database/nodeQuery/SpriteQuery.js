import pool from "../../config/db.js";

export default async function getSpriteByNodeId(nodeId) {
    try {
        const [rows] = await pool.query(`
        SELECT 
            ns.room_number, 
            ns.room_type, 
            ns.room_img, 
            ns.room_description
            
        FROM  node_sprite ns
        JOIN  node_details nd ON ns.node_details_id = nd.id
        WHERE nd.node_id = ?`
        , [nodeId]);
        return rows;
    } catch (error) {
        console.error("Error in querying sprite by node ID:", error);
        throw error;
    }
}