import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(201).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  return response
    .status(migratedMigrations.length > 0 ? 201 : 200)
    .json(migratedMigrations);
}
