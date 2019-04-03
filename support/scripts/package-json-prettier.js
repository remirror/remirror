const { format } = require('prettier-package-json');
const { resolve, join } = require('path');
const { writeFileSync, readFileSync } = require('fs');
const glob = require('glob');
const chalk = require('chalk');

const baseDir = (...paths) => resolve(__dirname, '..', '..', join(...paths));

const files = glob.sync('./**/package.json', {
  cwd: baseDir(),
  ignore: ['./**/node_modules/**', './node_modules/**'],
});

console.log(chalk`{yellow Updating ${files.length} package.json files}`);

files.forEach(relativePath => {
  const path = baseDir(relativePath);
  const contents = readFileSync(path).toString('utf8');
  const json = format(JSON.parse(contents), {});
  writeFileSync(path, json);
});
