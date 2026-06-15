const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const cliPath = join(__dirname, "..", "dist", "cli.js");

if (!existsSync(cliPath)) {
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [cliPath, "install", "--from-postinstall"],
  {
    stdio: "inherit",
    env: process.env,
  },
);

process.exit(result.status ?? 1);
