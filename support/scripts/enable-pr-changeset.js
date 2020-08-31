/**
 * This script edits the `/.changeset/config.json` file so that it doesn't need
 * the GITHUB_TOKEN to be available in order to build the changeset.
 *
 * This allows PR's which don't have access to the `GITHUB_TOKEN` to still pass.
 *
 * @packageDocumentation
 */

const writeJson = require('write-json-file');
const chalk = require('chalk');
const { baseDir } = require('./helpers');

async function main() {
  if (!process.env.CI) {
    console.log(
      chalk`{red Attempted to edit the changeset config in a non CI environment.} Exiting...`,
    );

    return;
  }

  const changesetConfig = require('../../.changeset/config.json');
  delete changesetConfig.changelog;
  await writeJson(baseDir('.changeset', 'config.json'), changesetConfig);

  console.log(chalk`{green Successfully updated the CI configuration. }`);
}

main();
