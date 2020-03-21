const { mkdirSync, statSync } = require('fs');

const [, , arg] = process.argv;

if (!arg) {
  console.error('Please provide a directory name to create.');
  process.exit(1);
}

const directory = arg;

const directoryExists = (path) => {
  try {
    return statSync(path).isDirectory;
  } catch {
    return false;
  }
};

if (!directoryExists(directory)) {
  console.log(`Creating directory for caching: ${directory}`);
  mkdirSync(directory);
}
