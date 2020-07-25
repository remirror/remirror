/**
 * Check styles are up to date.
 */

const diff = require('jest-diff').default;
const fs = require('fs').promises;
const globby = require('globby');
const chalk = require('chalk');
const { baseDir } = require('./helpers');
const { getOutput, writeOutput } = require('./linaria');
const isEqual = require('lodash.isequal');
const { relative } = require('path');
const cpy = require('cpy');
const rimraf = require('util').promisify(require('rimraf'));

const [, , ...args] = process.argv;
const shouldFix = args.includes('--fix');

const diffOptions = {
  contextLines: 1,
  expand: false,
  aAnnotation: 'Original',
  aColor: chalk.red,
  bAnnotation: 'Generated',
  bColor: chalk.green,
  includeChangeCounts: true,
};

/**
 * @param {string[]} paths
 */
const files = globby.sync(['packages/@remirror/styles/*.css'], { cwd: baseDir() });

async function readFiles() {
  /** @type Record<string, string> */
  const output = {};

  for (const file of files) {
    output[baseDir(file)] = (await fs.readFile(file)).toString();
  }

  return output;
}

/**
 * @param {Record<string, string>} output
 */
function orderOutputKeys(output) {
  return Object.keys(output)
    .sort()
    .map((name) => relative(process.cwd(), name));
}

/**
 * Check that the actual output and the expected output are identical. When css is
 * changed it should be updated.
 *
 * @param {Record<string, string>} actual
 * @param {Record<string, string>} expected
 */
function checkOutput(actual, expected) {
  const actualKeys = orderOutputKeys(actual);
  const expectedKeys = orderOutputKeys(expected);

  if (!isEqual(actualKeys, expectedKeys)) {
    throw new Error(
      chalk`\n{yellow The generated files are not identical to the original files.}\n\n${
        diff(actualKeys, expectedKeys, diffOptions) || ''
      }\n`,
    );
  }

  /** @type {string[]} */
  const errorMessages = [];

  for (const [name, actualContents] of Object.entries(actual)) {
    const expectedContents = expected[name];
    const relativeName = relative(process.cwd(), name);

    if (isEqual(actualContents, expectedContents)) {
      continue;
    }

    errorMessages.push(
      chalk`{grey ${relativeName}}\n${diff(actualContents, expected[name], diffOptions)}`,
    );
  }

  if (errorMessages.length > 0) {
    throw new Error(
      chalk`\n{bold.yellow The generated CSS file contents differ from current content.}\n\n${errorMessages.join(
        '\n\n',
      )}\n`,
    );
  }
}

async function cleanCss() {
  await rimraf('packages/@remirror/styles/*.css packages/remirror/styles/*.css');
}

async function run() {
  const actualOutput = await readFiles();
  const expectedOutput = await getOutput();

  try {
    checkOutput(actualOutput, expectedOutput);
    console.log(chalk`\n{green The generated {bold CSS} is valid for all files.}`);
    return;
  } catch (error) {
    console.log(error.message);
  }

  if (shouldFix) {
    await cleanCss();
    await writeOutput();
    await cpy(['packages/@remirror/styles/*.css'], 'packages/remirror/styles/');

    return;
  }

  console.log(chalk`\n{bold.red To fix this issue run:} {blue.italic pnpm fix:css}\n`);
  process.exit(1);
}

run();
