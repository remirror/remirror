const { baseDir } = require('./helpers');
const { promises: fs } = require('fs');

async function main() {
  try {
    require('../website/sidebars');
  } catch {
    await fs.writeFile(
      baseDir('support/website/sidebars.js'),
      'module.exports = { typedocSidebar: {} };',
    );
  }
}

main();
