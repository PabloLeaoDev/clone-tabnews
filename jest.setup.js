const dotenv = require("dotenv"),
  dotenvExpand = require("dotenv-expand"),
  envConfig = dotenv.config({ path: ".env.development" });
dotenvExpand.expand(envConfig);
