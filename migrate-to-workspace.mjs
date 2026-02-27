import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Collect all workspace package names
const pnpmOutput = execSync("pnpm ls -r --json --depth 0", {
  encoding: "utf-8",
});
const packages = JSON.parse(pnpmOutput);
const workspaceNames = new Set(packages.map((p) => p.name).filter(Boolean));

console.log(`Found ${workspaceNames.size} workspace packages`);

/**
 * Convert a version string to the appropriate workspace: specifier,
 * preserving the original prefix.
 */
function toWorkspaceSpecifier(version) {
  if (version.startsWith("^")) return "workspace:^";
  if (version.startsWith("~")) return "workspace:~";
  // Exact version (e.g. "3.0.0") or anything else
  return "workspace:*";
}

/**
 * Process a dependency map, replacing workspace package versions.
 * Returns true if any changes were made.
 */
function processDeps(deps) {
  if (!deps) return false;
  let changed = false;
  for (const [name, version] of Object.entries(deps)) {
    if (workspaceNames.has(name)) {
      const newVersion = toWorkspaceSpecifier(version);
      if (deps[name] !== newVersion) {
        deps[name] = newVersion;
        changed = true;
      }
    }
  }
  return changed;
}

// Process each workspace package
let totalChanged = 0;
for (const pkg of packages) {
  const pkgJsonPath = join(pkg.path, "package.json");
  const content = readFileSync(pkgJsonPath, "utf-8");
  const json = JSON.parse(content);

  let changed = false;
  changed = processDeps(json.dependencies) || changed;
  changed = processDeps(json.devDependencies) || changed;
  changed = processDeps(json.peerDependencies) || changed;

  if (changed) {
    writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2) + "\n");
    totalChanged++;
    console.log(`  Updated: ${json.name}`);
  }
}

console.log(`\nDone. Updated ${totalChanged} package.json files.`);
