const { existsSync, readFileSync } = require('fs');
const { resolve, join } = require('path');

/**
 * Resolve a filename or path to the base of this project
 *
 * @param  {...string} path
 */
const base = (...path) => resolve(__dirname, '../../..', join(...path));

const configFilePath = base('.config.json');

const readJSON = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log('Invalid JSON data in file .config.json');
    return {};
  }
};

exports.readConfigFile = () => {
  if (!existsSync(configFilePath)) {
    console.log('No .config.json file');
    return {};
  }

  const fileContents = readFileSync(configFilePath).toString();
  return readJSON(fileContents);
};

exports.readProperty = ({ property = '', config = exports.readConfigFile() }) => {
  let item = config;
  if (!property || !config) return undefined;
  const keys = property.split('.');
  for (const key of keys) {
    if (key in item) {
      item = item[key];
    } else {
      return undefined;
    }
  }

  return item;
};
