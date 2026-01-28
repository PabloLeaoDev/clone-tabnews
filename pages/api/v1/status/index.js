import database from "/infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const resVersion = await database.query("SHOW server_version;"),
    version = resVersion.rows[0].server_version;

  const resMaxConn = await database.query("SHOW max_connections;"),
    maxConn = resMaxConn.rows[0].max_connections;

  const resUsedConn = await database.query(
      "SELECT count(*)::int FROM pg_stat_activity WHERE state = 'active'",
    ),
    usedConn = resUsedConn.rows[0].count;

  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConn),
        opened_connections: usedConn,
      },
    },
  });
}

export default status;
