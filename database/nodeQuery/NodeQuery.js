import pool from "../../config/db.js";

export async function getNodeById(nodeId) {
    try {
        const [rows] = await pool.query(`
        
        SELECT 
            n.id, 
            nd.node_name, 
            nc.coordinates, 

            ni.src, 
            ni.alt, 
            
            ns.room_number, 
            ns.room_type, 
            ns.room_img, 
            ns.room_description

        FROM node n
        
            LEFT JOIN node_details nd 
                ON n.id = nd.node_id
            LEFT JOIN node_coordinates nc 
                ON nd.id = nc.node_details_id
            LEFT JOIN node_img ni 
                ON nd.id = ni.node_details_id
            LEFT JOIN node_sprite ns 
                ON nd.id = ns.node_details_id

        WHERE n.id = ?

        `, [nodeId]);
        return rows[0];
    } catch (error) {
          console.error("Error in getNodeById:", error);
        throw error;
    }
}