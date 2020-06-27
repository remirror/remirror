/// <reference types="node" />

const fs = require('fs').promises;
const globby = require('globby');
const transform = require('linaria/lib/transform').default;
const path = require('path');
const groupBy = require('lodash.groupby');
const chalk = require('chalk');
const { baseDir } = require('./helpers');
const prettier = require('prettier');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const precss = require('precss');

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

/**
 * Place all styles into the styles package.
 */
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

/** The `TS` files to check grouped by their package name */
const groupedFileEntries = Object.entries(groupedFiles);

/**
 * All the styles grouped together.
 * @type string[]
 */
const all = [];

/** @type Record<string, string> */
const output = {};

/**
 * @param {string} name
 * @param {string} contents
 */
async function addToOutput(name, contents) {
  const options = await prettier.resolveConfig(baseDir());
  const formattedContents = prettier.format(contents, { ...options, parser: 'css' });

  output[name] = formattedContents;
}

/**
 * @param {string} css - the untransformed css text
 * @param {string?} [from] - the path being transformed
 * @param {string?} [to] - the output path for the transformation
 */
async function processCss(css, from, to) {
  const result = await postcss([precss, autoprefixer]).process(css, { from, to });
  return result.css;
}

/**
 * @param {string} name
 * @param {string[]} paths
 */
async function transformFilePaths(name, paths) {
  /** @type string[] */
  const css = [];
  const outputFilename = resolveOutputFilename(name);

  for (const filename of paths) {
    const fileContents = await fs.readFile(filename);
    const { cssText: rawCssText } = transform(fileContents.toString(), {
      filename,
      outputFilename,
      preprocessor: 'none',
    });

    if (!rawCssText) {
      continue;
    }

    const cssText = await processCss(rawCssText);

    css.push(`/**\n * Styles extracted from: ${filename}\n */\n${cssText}`);
  }

  if (css.length === 0) {
    return;
  }

  const content = css.join('\n');

  all.push(content);
  await addToOutput(outputFilename, content);
}

/**
 * @param {string} name
 */
function resolveOutputFilename(name) {
  return path.join(outputDirectory, `${name}.css`);
}

if (!module) {
  processFiles();
}

async function processFiles() {
  for (const [name, paths] of groupedFileEntries) {
    await transformFilePaths(name, paths);
  }

  const allCssOutputPath = resolveOutputFilename('all');
  await addToOutput(allCssOutputPath, all.join('\n'));

  return output;
}

async function writeOutput() {
  const entries = Object.entries(output);

  for (const [filename, contents] of entries) {
    await fs.writeFile(filename, contents);
  }

  console.log(chalk`{green Successfully extracted {bold ${entries.length}} CSS files.}`);
}

async function run() {
  await processFiles();
  await writeOutput();
}

if (!module.parent) {
  run().then(() => process.exit());
}

exports.getOutput = processFiles;
