import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    ".next/**",
    ".github/**",
    ".swc/**",
    "out/**",
    "dist/**",
    "build/**",
  ]),
  {
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off",
    },
  },
]);
