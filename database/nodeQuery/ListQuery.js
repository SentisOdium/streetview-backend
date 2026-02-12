import pool from "../../config/db.js";

export default async function getNodeListQuery() {
    try {
        const [rows] = await pool.query
            (`
                SELECT 
                    nd.node_details_id, 
                    nd.target_node_id,
                    nd.path_weight
                FROM node_hotspots nd 
            `);

            // console.log("Fetched Node List:", rows);

            return rows;
    } catch (error) {
        console.error("Error in getNodeListQuery:", error);
        throw error;

    }
}

