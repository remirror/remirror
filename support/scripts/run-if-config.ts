/**
 * @script
 *
 * Run the provided script based on the status of the property of the config
 * file. This used to decided whether husky hooks should be run.
 *
 * `babel-node support/scripts/run-if-config.ts hooks.preCommit lint`
 */

import { execSync } from 'child_process';

import { readProperty } from './helpers/read-config';

const [, , property, ...args] = process.argv;
const command = args.join(' ');

// Check for property
const value = readProperty(property);

if (value) {
  console.log('Opted into husky checks... 😋');
  execSync(command, { stdio: 'inherit' });
} else {
  console.log('Ignoring checks');
  process.exit(0);
}
