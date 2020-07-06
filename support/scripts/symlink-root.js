const fs = require('fs');
const { resolve, join } = require('path');

const targets = fs
  .readdirSync(baseDir('support', 'root'))
  // Exclude the `readme.md` file from being symlinked.
  .filter((name) => !name.endsWith('readme.md'))
  .map((filename) => ({
    original: baseDir('support', 'root', filename),
    target: baseDir(filename),
  }));

/**
 * Resolve a path relative to the base directory.
 *
 * @param {string[]} paths
 */
function baseDir(...paths) {
  return resolve(__dirname, '../..', ...paths);
}

/**
 * Safely get the stats for a file.
 *
 * @param {string} target
 */
function getFileStatSync(target) {
  try {
    return fs.lstatSync(target);
  } catch {
    return;
  }
}

/**
 * Delete a file or folder recursively.
 *
 * @param {string} path
 *
 * @returns {void}
 */
function deletePath(path) {
  const stat = getFileStatSync(path);

  if (!stat) {
    return;
  }

  if (stat.isFile()) {
    console.log('deleting file', path);
    fs.unlinkSync(path);
  }

  if (!stat.isDirectory()) {
    return;
  }

  // Delete all nested paths
  for (const file of fs.readdirSync(path)) {
    deletePath(join(path, file));
  }

  // Delete the directory
  fs.rmdirSync(path);
}

/**
 * Check that the path is linked to the target.
 *
 * @param {string} path
 * @param {string} target
 */
function isLinkedTo(path, target) {
  try {
    const checkTarget = fs.readlinkSync(path);
    return checkTarget === target;
  } catch {
    return false;
  }
}

for (const { original, target } of targets) {
  const targetStat = getFileStatSync(target);

  // Nothing to do since the path is linked correctly.
  if (isLinkedTo(target, original)) {
    continue;
  }

  // The file or directory exists but is not symlinked correctly. It should be
  // deleted.
  if (targetStat) {
    console.log('deleting path', target);
    deletePath(target);
  }

  fs.symlinkSync(original, target);
}

console.log(
  '\n\u001B[32mSuccessfully symlinked the `support/root` files to the root directory.\u001B[0m\n',
);
