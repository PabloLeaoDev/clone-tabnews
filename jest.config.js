const nextJestConfig = require("next/jest");

const TIMEOUT_IN_MILLISECONDS = 60_000,
  MAX_WORKERS = 4;

const createJestConfig = nextJestConfig(),
  jestConfig = createJestConfig({
    moduleDirectories: ["node_modules", "<rootDir>"],
    setupFiles: ["<rootDir>/jest.setup.js"],
    testTimeout: TIMEOUT_IN_MILLISECONDS,
    maxWorkers: MAX_WORKERS,
    cache: true,
  });

module.exports = jestConfig;
