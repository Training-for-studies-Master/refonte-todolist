// migrate-down.ts
import fs from "fs";
import mysql from "mysql2/promise";

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  });

  const sql = fs.readFileSync(
    "./migrations/001-add-birthday.down.sql",
    "utf8"
  );

  if (process.env.RUN_MIGRATION == "true")
  {
    await connection.query(sql);
  }
  

  console.log("Rollback OK");
  await connection.end();
}

run();