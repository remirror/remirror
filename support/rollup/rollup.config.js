import factory from './factory';
import { join } from 'path';
import { rollup, dependencies } from './config.json';
import chalk from 'chalk';

const { baseDir } = require('../scripts/helpers');

const uniqueArray = arr => Array.from(new Set(arr));

const { PACKAGES } = process.env;
const names = (PACKAGES && PACKAGES.split(',')) || [];
const entryPoints = names.map(name => {
  const config = rollup.find(config => config.name === name);

  if (!config) {
    throw new Error(
      chalk`{red You must specify a recognized package within the 'PACKAGES' environment variable}: {bold '${name}'} {red is invalid}`,
    );
  }

  return config;
});

let filtered = rollup;

const getNames = (name = '') => {
  const config = rollup.find(conf => conf.name === name);
  const arr = [name];
  if (!config) {
    return arr;
  }

  const path = baseDir(config.path);
  const pkg = require(join(path, 'package.json'));

  return ['dependencies', 'peerDependencies', 'devDependencies'].reduce((acc, key) => {
    if (pkg[key]) {
      return [
        ...acc,
        ...Object.keys(pkg[key])
          .filter(dep => dependencies[dep])
          .reduce((acc, key) => [...acc, ...getNames(key)], []),
      ];
    }

    return acc;
  }, arr);
};

if (entryPoints && entryPoints.length) {
  filtered = uniqueArray(
    entryPoints.reduce((acc, config) => [...acc, ...getNames(config.name)], []),
  )
    .map(key => rollup.find(config => config.name === key))
    .reverse();
}

const configurations = [];

filtered.forEach(config => {
  const path = baseDir(config.path);
  const packageJson = join(path, 'package.json');
  factory(require(packageJson), path).forEach(project => configurations.push(project));
});

export default configurations;
