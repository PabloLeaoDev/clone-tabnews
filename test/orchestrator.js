import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import { requester } from "test/requester";

async function waitForAllServices() {
  const fetchStatusPage = async () => {
    try {
      const response = await requester("/api/v1/status");
      if (!response.ok) throw Error(`HTTP Error ${response.status}`);
      await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const waitForWebServer = async () => {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (err, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page: ${err.message}`,
        );
      },
    });
  };

  await waitForWebServer();
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  const migratedMigrations = await migrator.runPendingMigrations();
  return migratedMigrations;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};

export default orchestrator;
