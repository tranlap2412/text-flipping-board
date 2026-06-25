/**
 * Post-build step for Next.js standalone output.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
 *
 * After `next build`, copy assets the minimal server.js does not include:
 *   cp -r public .next/standalone/
 *   cp -r .next/static .next/standalone/.next/
 */
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const standaloneDir = join(root, ".next/standalone");
const distDir = join(root, "dist");

if (!existsSync(standaloneDir)) {
  console.error("Missing .next/standalone — run `next build` with output: 'standalone' first.");
  process.exit(1);
}

cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });
mkdirSync(join(standaloneDir, ".next/static"), { recursive: true });
cpSync(join(root, ".next/static"), join(standaloneDir, ".next/static"), {
  recursive: true,
});

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version ?? "0.0.0";
const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const archiveBase = `${pkg.name}-v${version}-${date}`;
const archivePath = join(distDir, `${archiveBase}.zip`);

mkdirSync(distDir, { recursive: true });

const zip = spawnSync("zip", ["-rq", archivePath, "standalone"], {
  cwd: join(root, ".next"),
  stdio: "inherit",
});

if (zip.status !== 0) {
  console.error("Failed to create archive — is `zip` available?");
  process.exit(zip.status ?? 1);
}

console.log("");
console.log("Standalone ready:  .next/standalone/");
console.log(`Deploy archive:    dist/${archiveBase}.zip`);
console.log("Run locally:");
console.log("  node .next/standalone/server.js");
console.log("On VPS after unzip:");
console.log("  cd standalone");
console.log("  PORT=3000 HOSTNAME=0.0.0.0 node server.js");
