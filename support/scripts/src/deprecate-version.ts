/**
 * @script
 *
 * Deprecates all the packages with the matching version. Using the given
 * message.
 */

import execa from 'execa';
import os from 'os';
import pLimit from 'p-limit';

import { cliArgs, getAllDependencies, log } from './helpers';

const version: string = cliArgs.version;
const message: string = cliArgs.message ?? '';

if (!version) {
  log.error('\nPlease supply a version that should be deprecated.');
  process.exit(1);
}

if (message) {
  log.info('\nNo message provided, this command will now un-deprecated');
}

const limit = pLimit(os.cpus().length);

async function run() {
  const promises: Array<Promise<void>> = [];

  const packages = await getAllDependencies({ excludeDeprecated: true, excludeSupport: true });

  for (const pkg of packages) {
    if (pkg.private || pkg.version?.startsWith('0.0.0') || !pkg.name) {
      continue;
    }

    promises.push(
      limit(async () => {
        try {
          const target = `${pkg.name}@${version}`;
          log.debug('Deprecating', target);

          const { stdout, stderr } = await execa('npm', ['deprecate', target, message]);

          if (stderr) {
            console.error(stderr);
          }

          if (stdout) {
            console.info(stdout);
          }
        } catch (error) {
          log.fatal(error);
        }
      }),
    );
  }

  await Promise.all(promises);
}

run();
