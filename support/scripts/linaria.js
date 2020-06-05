/**
 * This file contains a CLI for Linaria.
 */

const fs = require('fs');
const globby = require('globby');
const transform = require('linaria/lib/transform').default;
const path = require('path');
const groupBy = require('lodash.groupby');
const chalk = require('chalk');
const { formatFiles, baseDir } = require('./helpers');

/**
 * @param {string[]} paths
 */
const files = globby.sync(['@remirror/*/src/**/*.{ts,tsx}'], {
  cwd: baseDir(),
  ignore: [
    '**/__tests__',
    '**/__dts__',
    '**/__mocks__',
    '**/__fixtures__',
    '**/__stories__',
    '*.{test,spec}.{ts,tsx}',
    '**/*.d.ts',
    '*.d.ts',
  ],
});
const outputDirectory = baseDir('@remirror/styles');

/**
 * Regex for grouping files together.
 */
const groupingRegex = /^@remirror\/([\w-]+)\/.*/;

/**
 * The grouped files.
 */
const groupedFiles = groupBy(files, (file) => {
  const match = file.match(groupingRegex);

  if (!match || !match[1]) {
    throw new Error(`Invalid file ${file}`);
  }

  return match[1];
});

/** @type string[] */
const all = [];
/** @type string[] */
const filesToPrettify = [];
const groupedFileEntries = Object.entries(groupedFiles);

/**
 * @param {string} name
 * @param {string[]} paths
 */
function transformFilePaths(name, paths) {
  /** @type string[] */
  const css = [];
  const outputFilename = resolveOutputFilename(name);

  for (const filename of paths) {
    const { cssText } = transform(fs.readFileSync(filename).toString(), {
      filename,
      outputFilename,
      preprocessor: 'stylis',
    });

    if (!cssText) {
      continue;
    }

    css.push(`/**\n * Styles extracted from: ${filename}\n */\n${cssText}`);
  }

  if (css.length === 0) {
    return false;
  }

  const content = css.join('\n');

  all.push(content);
  filesToPrettify.push(outputFilename);
  fs.writeFileSync(outputFilename, content);

  return true;
}

async function processFiles() {
  let count = 0;

  for (const [name, paths] of groupedFileEntries) {
    const didTransform = transformFilePaths(name, paths);

    if (didTransform) {
      count++;
    }
  }

  const allCssOutputPath = resolveOutputFilename('all');

  filesToPrettify.push(allCssOutputPath);
  fs.writeFileSync(allCssOutputPath, all.join('\n'));

  await formatFiles(filesToPrettify.map((fileName) => baseDir(fileName)).join(' '), true);

  console.log(chalk`{green Successfully extracted {bold ${count}} CSS files.}`);
}

/**
 * @param {string} name
 */
function resolveOutputFilename(name) {
  return path.join(outputDirectory, `${name}.css`);
}

processFiles();
