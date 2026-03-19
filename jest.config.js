const nextJestConfig = require("next/jest");

const createJestConfig = nextJestConfig(),
  jestConfig = createJestConfig({
    moduleDirectories: ["node_modules", "<rootDir>"],
    setupFiles: ["<rootDir>/jest.setup.js"],
  });

module.exports = jestConfig;
