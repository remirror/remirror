const { existsSync, readFileSync } = require('fs');
const { resolve, join } = require('path');

/**
 * Resolve a filename or path to the base of this project
 *
 * @param  {...string} path
 */
function base(...path) {
  return resolve(__dirname, '../../..', join(...path));
}

const configFilePath = base('.config.json');

function readJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    console.log('Invalid JSON data in file .config.json');
    return {};
  }
}

function readConfigFile() {
  if (!existsSync(configFilePath)) {
    console.log('No .config.json file');
    return {};
  }

  const fileContents = readFileSync(configFilePath).toString();
  return readJSON(fileContents);
}

exports.readConfigFile = readConfigFile;

function readProperty({ property = '', config = exports.readConfigFile() }) {
  let item = config;

  if (!property || !config) {
    return;
  }

  const keys = property.split('.');

  for (const key of keys) {
    if (key in item) {
      item = item[key];
    } else {
      return;
    }
  }

  return item;
}

exports.readProperty = readProperty;
