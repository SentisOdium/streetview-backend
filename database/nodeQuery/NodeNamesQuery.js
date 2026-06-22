import pool from "../../config/db.js";

export default async function getAllNodes(){
    try {
        const [rows] = await pool.query(`
                SELECT 
                    n.id AS id, 
                    nd.node_name,
                    nd.type,
                    nc.coordinates,
                    nc.floor AS coordinate_floor
                FROM node n
                    INNER JOIN node_details nd ON n.id = nd.node_id
                    LEFT JOIN node_coordinates nc ON nd.id = nc.node_details_id
            `)

            return rows
    } catch (error) {
        console.error("Error in Fetching Locations: ", error);
        throw error;
    }
}