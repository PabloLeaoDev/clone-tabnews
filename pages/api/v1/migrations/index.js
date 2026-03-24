import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { error } from "node:console";

async function migrations(request, response) {
  const migrationsType = {
    pending: 201,
    applied: 200,
  };
  
  let 
    dryRun = true,
    dbClient = await database.getNewClient();

  try {
    if (request.method === "GET") 
      console.log("GET:");
    else if (request.method === "POST") {
      console.log("POST:");
      dryRun = false;
    } else return response.status(405).json({ message: "Method not allowed" });
  
    const migrations = await migrationRunner({
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,  
      migrationsTable: "pgmigrations",
      dryRun,
      dbClient,
    });
    
    return response
    .status(
      migrations.length > 0 ? migrationsType.pending : migrationsType.applied,
    )
    .json(migrations);
  } catch (e) {
    console.error(error.message);
  } finally {
    await dbClient.end();
  }
}

export default migrations;
