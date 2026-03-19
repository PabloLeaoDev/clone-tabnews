import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

async function migrations(request, response) {
  const migrationsType = {
    pending: 201,
    applied: 200,
  };

  let dryRun = true;

  if (request.method === "GET") console.log("GET:");
  else if (request.method === "POST") {
    console.log("POST:");
    dryRun = false;
  } else return response.status(405).json({ message: "Method not allowed" });

  const migrations = await migrationRunner({
    dir: join("infra", "migrations"),
    databaseUrl: process.env.DATABASE_URL,
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
    dryRun,
  });

  return response
    .status(
      migrations.length > 0 ? migrationsType.pending : migrationsType.applied,
    )
    .json(migrations);
}

export default migrations;
