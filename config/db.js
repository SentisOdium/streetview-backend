import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_AWS_HOST,
    user: process.env.MYSQL_AWS_USER,
    password: process.env.MYSQL_AWS_PASSWORD,
    database: process.env.MYSQL_AWS_DATABASE,
    port: process.env.MYSQL_AWS_PORT,
    connectionLimit: 25 // Adjust the connection limit as needed
    
});

export default pool;
