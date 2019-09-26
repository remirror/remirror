const { execSync } = require('child_process');
const { readProperty } = require('./helpers/read-config');

const [, , property, ...args] = process.argv;
const command = args.join(' ');

// Check for property
const value = readProperty({ property });

if (value) {
  console.log('Opted into husky checks... 😋');
  execSync(command, { stdio: 'inherit' });
} else {
  console.log('Ignoring checks');
  process.exit(0);
}
