import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

import { getAllDependencies } from './helpers';

const NAME = 'CHANGELOG.md';

/**
 * Read a file.
 *
 * @param {string} filePath - the filePath
 */
async function readFile(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return;
  }
}

/**
 * Get the release date
 *
 * @param date - the date to use
 */
function getDate(date: Date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * Check if the file has changed.
 *
 * @param filePath - the file path to check.
 */
function hasFileChanged(filePath: string) {
  const isUntracked = !execSync(`git ls-files ${filePath}`).toString().trim();

  if (isUntracked) {
    return true;
  }

  return !!execSync(`git --no-pager diff --name-only ${filePath}`).toString().trim();
}

/**
 * Add dates to all updated changelog files.
 */
async function run() {
  const packages = await getAllDependencies({ excludeDeprecated: false });

  for (const pkg of packages) {
    const filePath = path.join(pkg.location, NAME);
    const contents = await readFile(filePath);

    if (!contents) {
      continue;
    }

    const updatedContent = contents.replace(
      /## (\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+[\dA-Za-z-]+)?$/m,
      `$&\n\n> ${getDate()}`,
    );

    if (contents === updatedContent) {
      continue;
    }

    if (!hasFileChanged(filePath)) {
      continue;
    }

    await fs.writeFile(filePath, updatedContent);

    console.log(`\u001B[32mAdded date to changelog: ${filePath}`);
  }
}

run();
