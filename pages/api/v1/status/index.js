import database from "infra/database.js";
import controller from "infra/controller.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString(),
    appEnv = process.env.NODE_ENV || "unknown",
    resStatus = await database.query(`
            SELECT
              current_setting('server_version') as server_version,
              current_setting('max_connections') as max_connections,
              count(*)::int as opened_connections
            FROM pg_stat_activity
          `);

  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        environment: appEnv,
        ...resStatus.rows[0],
      },
    },
  });
}
