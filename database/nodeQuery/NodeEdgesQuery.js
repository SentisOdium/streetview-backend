import pool from "../../config/db.js";

export default async function getNodeEdges() {
    try {
        const [rows] = await pool.query
            (`
                SELECT 
                    nh.node_details_id, 
                    nh.target_node_id,           
                    nh.path_weight
                    
                FROM node_hotspots nh 
                  
            `);

            // console.log("Fetched Node List:", rows);

            return rows;
    } catch (error) {
        console.error("Error in getNodeListQuery:", error);
        throw error;

    }
}

