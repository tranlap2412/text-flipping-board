import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const standaloneDir = join(root, ".next/standalone");
const distDir = join(root, "dist");

if (!existsSync(standaloneDir)) {
  console.error("Missing .next/standalone — run `next build` first.");
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
console.log("Standalone bundle: .next/standalone/");
console.log(`Archive:           dist/${archiveBase}.zip`);
console.log("Deploy:");
console.log(`  unzip ${archiveBase}.zip`);
console.log("  cd standalone && PORT=3000 node server.js");
