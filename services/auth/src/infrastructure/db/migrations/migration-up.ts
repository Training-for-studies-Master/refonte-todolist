import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

async function run() {
  if (process.env.RUN_MIGRATION !== "true") {
    console.log("ℹ️ RUN_MIGRATION n'est pas défini sur 'true'. Migration ignorée.");
    return;
  }
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    multipleStatements: true,
  });

  // 1. On lit directement le dossier actuel (__dirname correspond à "migrations")
  const files = fs
    .readdirSync(__dirname)
    // 2. IMPORTANT : On ne garde QUE les fichiers qui se terminent par .sql
    // (et on ignore le fichier .down.sql si tu ne veux exécuter que les montées)
    .filter((file) => file.endsWith(".sql") && !file.endsWith(".down.sql"))
    .sort();

  if (files.length === 0) {
    console.log("ℹ️ Aucun fichier de migration SQL à exécuter.");
  }

  if (process.env.RUN_MIGRATION === "true") {
    for (const file of files) {
      // 3. On lit le fichier SQL directement dans le dossier actuel
      const sql = fs.readFileSync(path.join(__dirname, file), "utf-8");

      console.log(`🚀 Running migration: ${file}`);
      await connection.query(sql);
    }
  }

  await connection.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});