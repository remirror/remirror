const fs = require('fs');
const { baseDir } = require('./helpers');

const targets = fs.readdirSync(baseDir('support', 'root')).map((filename) => ({
  original: baseDir('support', 'root', filename),
  target: baseDir(filename),
}));

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

  if (isLinkedTo(target, original)) {
    continue;
  }

  if (targetStat && targetStat.isSymbolicLink()) {
    fs.unlinkSync(target);
  }

  fs.symlinkSync(original, target);
}

console.log('\n\u001B[32mSuccessfully symlinked the `support/root` files to the root directory.\n');
