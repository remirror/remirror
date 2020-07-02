const fs = require('fs');
const { baseDir } = require('./helpers');

const targets = fs
  .readdirSync(baseDir('support', 'root'))
  .map((filename) => ({ original: baseDir('support', 'root', filename), target: baseDir(filename) }));

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

for (const { original, target } of targets) {
  const targetStat = getFileStatSync(target);
  const originalStat = getFileStatSync(original);

  // Both files exist and the target is newer than the original.
  if (targetStat && originalStat && targetStat.mtimeMs >= originalStat.mtimeMs) {
    continue;
  }

  // The original has been changed more recently than the target.
  if (targetStat && targetStat.isFile()) {
    fs.unlinkSync(target);
  }

  // Copy the file over.
  fs.copyFileSync(original, target);
}

console.log('\n\u001B[32mSuccessfully copied the `support/root` files to the root directory.\n');
