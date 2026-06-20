#!/usr/bin/env node
/** @deprecated Use `npm run sync:providers` instead. */
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("node", ["scripts/sync-providers.mjs", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: root,
});
process.exit(result.status ?? 1);
