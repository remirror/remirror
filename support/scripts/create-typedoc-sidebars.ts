/**
 * @script
 *
 * This script creates the API sidebars with `typedoc` on the documentation site.
 */

import fs from 'fs/promises';

import { baseDir } from './helpers';

/**
 * Create a fresh sidebar file for the docs api.
 */
function createFile() {
  return fs.writeFile(
    baseDir('support/website/sidebars.js'),
    'module.exports = { typedocSidebar: {} };',
  );
}

/**
 * Reset the sidebar file for the docs.
 */
async function main() {
  try {
    require('../website/sidebars');
    await fs.unlink(baseDir('support/website/sidebars.js'));
    await createFile();
  } catch {
    await createFile();
  }
}

main();
