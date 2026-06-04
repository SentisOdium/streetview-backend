//reconfigure the error handling message later

import pool from "../../config/db.js";
export default async function getHotspotById(hostspotId) {
    try {
        const [rows] = await pool.query(
           `
            SELECT 
                    n.id AS source_node_id,
                    nd.node_name,
                    nc.coordinates,

                    nh.id AS hotspot_record_id,
                    nh.direction,

                    nd2.node_id AS destination_node_id,
                    nd2.node_name AS target_name,
                    nc2.coordinates AS target_coordinates

                FROM node n

                INNER JOIN node_details nd
                    ON n.id = nd.node_id

                INNER JOIN node_coordinates nc
                    ON nd.id = nc.node_details_id

                INNER JOIN node_hotspots nh
                    ON nd.id = nh.node_details_id

                INNER JOIN node_details nd2
                    ON nh.target_node_id = nd2.id

                INNER JOIN node_coordinates nc2
                    ON nd2.id = nc2.node_details_id

            WHERE n.id = ?;
            `, [hostspotId]);

            return rows;
    } catch (error) {
        console.error("Error in getHotspotById:", error);
        throw error;
    }
}                                                           