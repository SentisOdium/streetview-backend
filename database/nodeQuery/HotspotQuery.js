//reconfigure the error handling message later

import pool from "../../config/db.js";
export default async function getHotspotById(hostspotId) {

    try {
        const [rows] = await pool.query(
           `
            SELECT 
                n.id, 
                nd.node_name, 
                nc.coordinates, 
                nh.target_node_id, 
                nh.direction, 
                
                nd2.node_name, 
                nc2.coordinates
                
            FROM node n
                INNER JOIN node_details nd 
                    ON n.id = nd.node_id
                INNER JOIN node_coordinates nc 
                    ON nd.id = nc.node_details_id
                INNER JOIN node_hotspots nh 
                    ON nd.id = nh.node_details_id

                INNER JOIN node n2 
                    ON nh.target_node_id  = n2.id
                INNER JOIN node_details nd2 
                    ON nh.target_node_id = nd2.id
                INNER JOIN node_coordinates nc2 
                    ON nh.target_node_id = nc2.id

            WHERE n.id = ?
            `, [hostspotId]);

            return rows;
    } catch (error) {
        console.error("Error in getHotspotById:", error);
        throw error;
    }
}