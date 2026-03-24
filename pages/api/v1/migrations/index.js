import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const migrationsType = {
    pending: 201,
    applied: 200,
  };

  let dryRun = true,
    allowedMethods = ["GET", "POST"],
    dbClient = await database.getNewClient();

  try {
    if (allowedMethods.includes(request.method)) {
      if (request.method == "POST") dryRun = false;
      console.log(request.method);
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
    console.error(e.message);
  } finally {
    await dbClient.end();
  }
}

export default migrations;
