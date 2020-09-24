/**
 * Check styles are up to date.
 */

const diff = require('jest-diff').default;
const fs = require('fs').promises;
const globby = require('globby');
const chalk = require('chalk');
const { baseDir } = require('./helpers');
const { getOutput, writeOutput, removeGeneratedFiles, copyFilesToRemirror } = require('./linaria');
const isEqual = require('lodash.isequal');
const path = require('path');

const [, , ...args] = process.argv;
const force = args.includes('--force');
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
    .map((name) => path.relative(process.cwd(), name));
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
    const relativeName = path.relative(process.cwd(), name);

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

async function run() {
  const actualOutput = await readFiles();
  const { css, ts } = await getOutput();

  try {
    checkOutput(actualOutput, css);
    console.log(chalk`\n{green The generated {bold CSS} is valid for all files.}`);

    if (!force) {
      return;
    }

    console.log(chalk`\n\nForcing update: {yellow \`--force\`} flag applied.\n\n`);
  } catch (error) {
    console.log(error.message);
  }

  if (shouldFix || force) {
    await removeGeneratedFiles();
    await writeOutput(css);
    await writeOutput(ts);
    await copyFilesToRemirror();

    return;
  }

  console.log(chalk`\n{bold.red To fix this issue run:} {blue.italic pnpm fix:css}\n`);
  process.exit(1);
}

run();
