const { execSync } = require('child_process');
const { environment } = require('../jest/helpers');
const { readProperty } = require('./helpers/read-config');

const shouldRunMacPostInstall = readProperty({ property: 'hooks.macPostInstall' });

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
