import pool from "../../config/db.js";

export default async function getNodeById(nodeId) {
    try {
        const [rows] = await pool.query(`
        
        SELECT 
            n.id, 
            nd.node_name, 
            nc.coordinates, 

            ni.src, 
            ni.alt

        FROM node n
        
            LEFT JOIN node_details nd 
                ON n.id = nd.node_id
            LEFT JOIN node_coordinates nc 
                ON nd.id = nc.node_details_id
            LEFT JOIN node_img ni 
                ON nd.id = ni.node_details_id

        WHERE n.id = ?`,
         [nodeId]);
        return rows[0] || null;
    } catch (error) {
        console.error("Error in getNodeById:", error);
        throw error;
    }
}