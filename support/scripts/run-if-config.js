const { execSync } = require('child_process');
const { readProperty } = require('./helpers/read-config');

const [, , property, ...args] = process.argv;
const command = args.join(' ');

// Check for property
const value = readProperty({ property });

if (value === undefined || value === false) {
  execSync(command, { stdio: 'inherit' });
} else {
  console.log(
    `Skipping ${command} due to .config.json containing ${property}: ${value.toString()}`,
  );
}
