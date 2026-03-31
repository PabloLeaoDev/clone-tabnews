const { exec } = require("node:child_process");
const os = require("node:os");

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

async function waitForDocker({ timeoutMs = 60000, intervalMs = 2000 } = {}) {
  const start = Date.now(),
    platform = os.platform();

  console.log("🐳 Starting Docker!\n\n");

  switch (platform) {
    case "linux":
      exec("sudo systemctl start docker");
      break;
    case "win32":
      exec('"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"');
      break;
    default: // macOS
      exec("open -a Docker");
  }

  process.stdout.write("⏳ Waiting Docker");

  while (true) {
    try {
      await execAsync("docker info");
      return;
    } catch (err) {
      if (Date.now() - start > timeoutMs) {
        console.log("\n🔴 Timeout waiting for Docker\n");
        throw new Error("Docker did not start in time");
      }

      process.stdout.write(".");
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

(async () => {
  try {
    await waitForDocker({ timeoutMs: 90000 });

    console.log("\n\n🚀 Docker is ready");
  } catch (err) {
    console.log("\n\n🔴 Docker is down");
    console.error(err.message);
    process.exit(1);
  }
})();
