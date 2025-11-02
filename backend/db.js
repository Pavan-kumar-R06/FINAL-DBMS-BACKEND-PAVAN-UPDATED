import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "PavaN@06",
    database: "ams_db"
});

console.log("Database connected");

export default db;

