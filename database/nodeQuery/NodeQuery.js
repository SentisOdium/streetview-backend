import pool from "../../config/db.js";

export default async function getNodeById({id, location, list}) {
    try {
        let params = []; 

        let sql = `
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
            
            `;

        if (id) {
            sql += " WHERE n.id = ?";
            params.push(id);
        } else if (location) {
            sql += " WHERE nd.node_name LIKE ?";
            params.push(`%${location}%`);
        } else {
            throw new Error("Either id or location  must be provided");
        }

        const [rows] = await pool.query(sql, params);

        return rows[0] || null;
    } catch (error) {
        console.error("Error in getNodeById:", error);
        throw error;
    }
}