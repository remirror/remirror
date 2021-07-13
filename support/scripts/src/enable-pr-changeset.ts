/**
 * @script
 *
 * This script edits the `/.changeset/config.json` file so that it doesn't need
 * the GITHUB_TOKEN to be available in order to build the changeset.
 *
 * This allows PR's which don't have access to the `GITHUB_TOKEN` to still pass.
 */

import chalk from 'chalk';
import loadJson from 'load-json-file';
import writeJson from 'write-json-file';

import { baseDir } from './helpers';

const changesetConfig: object = loadJson.sync(baseDir('.changeset', 'config.json'));

async function main() {
  if (!process.env.CI) {
    console.log(
      chalk`{red Attempted to edit the changeset config in a non CI environment.} Exiting...`,
    );

    return;
  }

  Reflect.deleteProperty(changesetConfig, 'changelog');
  await writeJson(baseDir('.changeset', 'config.json'), changesetConfig);

  console.log(chalk`{green Successfully updated the CI configuration. }`);
}

main();
