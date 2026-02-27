import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkgs = JSON.parse(
  execSync("pnpm ls -r --json --depth 0", { encoding: "utf-8" }),
);
const wsNames = new Set(pkgs.map((p) => p.name).filter(Boolean));
const issues = [];

for (const pkg of pkgs) {
  const json = JSON.parse(
    readFileSync(join(pkg.path, "package.json"), "utf-8"),
  );
  for (const depType of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ]) {
    const deps = json[depType] || {};
    for (const [name, ver] of Object.entries(deps)) {
      if (String(ver).startsWith("workspace:") && !wsNames.has(name)) {
        issues.push(`${json.name} -> ${name}: ${ver}`);
      }
    }
  }
}

if (issues.length === 0) {
  console.log("OK: All workspace: refs point to actual workspace packages");
} else {
  console.log("ISSUES:");
  for (const i of issues) console.log(`  ${i}`);
}
