import pool from "../../config/db.js";

export default async function getNodeEdges() {
    try {
        const [rows] = await pool.query
            (`
                SELECT 
                    nd.node_id AS id, 
                    nd2.node_id AS target_node_id,           
                    nh.path_weight,
                    
                    nd.node_name,
                    nd.type

                FROM node_hotspots nh 

                INNER JOIN node_details nd 
                    ON nd.id = nh.node_details_id

                INNER JOIN node_details nd2
                    ON nd2.id = nh.target_node_id
            `);

            // console.log("Fetched Node List:", rows);

            return rows;
    } catch (error) {
        console.error("Error in getNodeListQuery:", error);
        throw error;

    }
}

