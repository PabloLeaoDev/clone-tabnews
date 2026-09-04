import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
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

async function createUser(userObject) {
  const createdUser = await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
  });

  return createdUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
