import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const sourceDir = join(root, "userscripts", "giveaway", "src");
const outputFile = join(root, "userscripts", "giveaway", "DarkPeers_BONanza_Giveaway.user.js");

const parts = [
  "00-preamble.js",
  "01-global-constants.js",
  "02-runtime-state.js",
  "03-metadata-parsing.js",
  "04-ui-template.js",
  "05-initialization.js",
  "06-lifecycle.js",
  "07-chat-observation.js",
  "08-entry-management.js",
  "09-sponsorship-polling.js",
  "10-command-handling.js",
  "11-winner-selection-payouts.js",
  "12-utilities.js",
  "13-menu-validation.js",
  "14-internal-namespaces.js"
];

const built = parts.map((name) => readFileSync(join(sourceDir, name), "utf8")).join("");

if (process.argv.includes("--check")) {
  const committed = readFileSync(outputFile, "utf8");
  if (committed !== built) {
    console.error("BONanza bundle is out of date. Run: node scripts/build-bonanza.mjs");
    process.exit(1);
  }
  console.log(`BONanza bundle verified: ${parts.length} parts, ${Buffer.byteLength(built)} bytes.`);
  process.exit(0);
}

writeFileSync(outputFile, built, "utf8");
console.log(`Built BONanza userscript from ${parts.length} parts (${Buffer.byteLength(built)} bytes).`);
