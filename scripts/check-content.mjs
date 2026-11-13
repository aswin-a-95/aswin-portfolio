// Fails while Aswin's placeholders are still in /content (SPEC §12).
// A production build (VERCEL_ENV=production) always checks; otherwise pass --force.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const productionOnly = args.includes("--production-only");
const isProduction = process.env.VERCEL_ENV === "production";
if (productionOnly && !isProduction) {
  console.log("check:content skipped (not a production build). Run `pnpm check:content` to see what is left.");
  process.exit(0);
}

const MARKERS = [/TODO\(aswin\)/, /\btodo\(/];
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx|mdx|md|json)$/.test(name)) {
      readFileSync(path, "utf8").split("\n").forEach((line, i) => {
        if (MARKERS.some((m) => m.test(line))) hits.push(`${path}:${i + 1}`);
      });
    }
  }
}

walk("content");
if (hits.length) {
  console.error(`check:content: ${hits.length} placeholder(s) left for Aswin to fill in:`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log("check:content: no placeholders left.");
