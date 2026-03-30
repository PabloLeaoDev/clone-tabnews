const { exec } = require("node:child_process");

function checkPostgres() {
  const handleReturn = (stderr, stdout) => {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres is ready and accepting connections!");
  };

  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
}

process.stdout.write("\n\n🔴 Waiting for Postgres to accept connections");
checkPostgres();
