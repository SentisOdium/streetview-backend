import pool from "../../config/db.js";

export default async function getAllNodes(){
    try {
        const [rows] = await pool.query(`
                SELECT 
                    n.id, 
                    nd.node_name,
                    nd.type
                FROM node n
                    INNER JOIN node_details nd ON n.id = nd.node_id
            `)

            return rows
    } catch (error) {
        console.error("Error in Fetching Locations: ", error);
        throw error;
    }
}