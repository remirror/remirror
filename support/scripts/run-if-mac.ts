/**
 * @script
 *
 * Run the command if this is a mac.
 */

import { execSync } from 'child_process';

import { environment } from '../jest/helpers';
import { readProperty } from './helpers/read-config';

const shouldRunMacPostInstall = readProperty('hooks.macPostInstall');

const [, , ...args] = process.argv;
const command = args.join(' ');

if (!environment.isMacOS || environment.isCI) {
  console.log(`Skipping mac specific command: '${command}'`);
  process.exit(0);
}

if (!shouldRunMacPostInstall) {
  console.log(
    'Mac specific commands are being ignored.\n' +
      'Set `hooks.macPostInstall` to `true`\n' +
      'in `.config.json` if you want to reactivate.',
  );
  process.exit(0);
}

console.log('Setting up your machine for mac development');
execSync(command, { stdio: 'inherit' });
