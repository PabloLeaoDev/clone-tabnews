import database from "infra/database";
import controller from "infra/controller.js";
import migrationRunner from "node-pg-migrate";
import { createRouter } from "next-connect";
import { join } from "node:path";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller);

const defaultMigrationsOptions = {
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();
  try {
    const migrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });

    return response.status(201).json(migrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();
  try {
    const migrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
      dbClient,
    });

    return response.status(migrations.length > 0 ? 201 : 200).json(migrations);
  } finally {
    await dbClient.end();
  }
}
