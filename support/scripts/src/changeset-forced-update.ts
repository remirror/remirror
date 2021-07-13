import { getDependentsGraph } from '@changesets/get-dependents-graph';
import { getPackages } from '@manypkg/get-packages';
import { promises as fs } from 'fs';
import writeJson from 'write-json-file';

import {
  baseDir,
  formatFiles,
  getAllDependencies,
  Package,
  readChangesetState,
  rm,
} from './helpers';

const [, , ...args] = process.argv;
const clean = args.includes('--clean');

const FORCED_FILE_NAME = 'pre-forced-update';
const FORCED_FILE_PATH = baseDir('.changeset', `${FORCED_FILE_NAME}.md`);
const PRE_FILE_PATH = baseDir('.changeset', 'pre.json');

/**
 * Create a changeset file which implements all the forced updates.
 */
async function createForcedUpdateFile(packages: Package[]): Promise<void> {
  const frontMatter = packages.map((pkg) => `'${pkg.name}': patch`);
  const fileContents = `---
${frontMatter.join('\n')}
---

Forced update in pre-release mode.`;

  await fs.writeFile(FORCED_FILE_PATH, fileContents);
}

/**
 * Run the command.
 */
async function run() {
  const { changesets, preState } = await readChangesetState();

  // This should only be active when the release mode is `pre-release`.
  if (!preState) {
    return;
  }

  // Remove the generated file and the entry from the list of available
  // changesets.
  if (clean) {
    await rm(FORCED_FILE_PATH);
    await writeJson(PRE_FILE_PATH, {
      ...preState,
      changesets: preState.changesets.filter((name) => name !== FORCED_FILE_NAME),
    });

    await formatFiles(PRE_FILE_PATH);
    return;
  }

  const nameList: string[] = [];
  const graph = getDependentsGraph(await getPackages(baseDir()));

  for (const changeset of changesets) {
    for (const release of changeset.releases) {
      nameList.push(release.name);
      const dependents = graph.get(release.name) ?? [];

      // Add all the dependent packages to the included names since they will
      // automatically be updated and don't need a forced update.
      nameList.push(release.name, ...dependents);
    }
  }

  const nameSet = new Set(...nameList);
  const packages = (await getAllDependencies()).filter(
    (pkg) => !pkg.private && !nameSet.has(pkg.name),
  );

  if (packages.length === 0) {
    return;
  }

  await createForcedUpdateFile(packages);
  await formatFiles(FORCED_FILE_PATH);
}

run();
