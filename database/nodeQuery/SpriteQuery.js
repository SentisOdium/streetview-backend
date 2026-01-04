import pool from "../../config/db.js";

export default async function getSpriteByNodeId(nodeId) {
    try {
        const [rows] = await pool.query(`
        SELECT 
            n.id,
            ns.room_number, 
            ns.room_type, 
            ns.room_img, 
            ns.room_description
            
        FROM  node n 
            
            LEFT JOIN node_sprite ns 
                ON n.id = ns.node_details_id
        
        WHERE n.id = ?`
        , [nodeId]);
        return rows;
    } catch (error) {
        console.error("Error in querying sprite by node ID:", error);
        throw error;
    }
}