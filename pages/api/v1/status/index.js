import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

async function status(request, response) {
  try {
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
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.error(publicErrorObject);
    return response
      .status(publicErrorObject.statusCode)
      .json(publicErrorObject);
  }
}

export default status;
