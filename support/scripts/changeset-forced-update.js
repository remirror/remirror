const { promises: fs } = require('fs');
const { getAllDependencies, baseDir, readChangesetState, formatFiles, rm } = require('./helpers');
const writeJson = require('write-json-file');

const [, , ...args] = process.argv;
const clean = args.includes('--clean');

const FORCED_FILE_NAME = 'pre-forced-update';
const FORCED_FILE_PATH = baseDir('.changeset', `${FORCED_FILE_NAME}.md`);
const PRE_FILE_PATH = baseDir('.changeset', 'pre.json');

/** @typedef {import('@manypkg/get-packages').Package['packageJson']} PackageJSON */

/**
 * @param {PackageJSON[]} packages
 * @returns {Promise<void>}
 */
async function createForcedUpdateFile(packages) {
  const frontMatter = packages.map((pkg) => `'${pkg.name}': patch`);
  const fileContents = `---
${frontMatter.join('\n')}
---

Forced update in pre-release mode.`;

  await fs.writeFile(FORCED_FILE_PATH, fileContents);
}

async function run() {
  const { changesets, preState } = await readChangesetState();

  if (!preState) {
    return;
  }

  if (clean) {
    await rm(FORCED_FILE_PATH);
    await writeJson(PRE_FILE_PATH, {
      ...preState,
      changesets: preState.changesets.filter((name) => name !== FORCED_FILE_NAME),
    });

    await formatFiles(PRE_FILE_PATH);
    return;
  }

  /** @type {Set<string>} */
  const includedNames = new Set();

  for (const changeset of changesets) {
    changeset.releases.forEach((release) => {
      includedNames.add(release.name);
    });
  }

  const packages = (await getAllDependencies()).filter(
    (pkg) => !pkg.private && !includedNames.has(pkg.name),
  );

  if (packages.length === 0) {
    return;
  }

  await createForcedUpdateFile(packages);
  await formatFiles(FORCED_FILE_PATH);
}

run();
