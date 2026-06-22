import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_AWS_HOST,
    user: process.env.MYSQL_AWS_USER,
    password: process.env.MYSQL_AWS_PASSWORD,
    database: process.env.MYSQL_AWS_DATABASE,
    port: Number(process.env.MYSQL_AWS_PORT),
  });

  const [rows] = await connection.query(`
    SELECT 
      nh.id AS edge_id,
      nd1.node_name AS source_name,
      nd1.node_id AS source_id,
      nd2.node_name AS target_name,
      nd2.node_id AS target_id,
      nh.direction,
      nh.path_weight
    FROM node_hotspots nh
    INNER JOIN node_details nd1 ON nh.node_details_id = nd1.id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
    ORDER BY nd1.node_name ASC
  `);

  console.log("EDGES_DUMP_START");
  console.log(JSON.stringify(rows, null, 2));
  console.log("EDGES_DUMP_END");
  await connection.end();
}

main().catch(console.error);
