/**
 * Check styles are up to date.
 */

const diff = require('jest-diff').default;
const fs = require('fs').promises;
const globby = require('globby');
const chalk = require('chalk');
const { baseDir } = require('./helpers');
const { getOutput } = require('./linaria');
const isEqual = require('lodash.isequal');

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
  return Object.keys(output).sort();
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
      chalk`\n{yellow The generated CSS has not been updated}\n\n${
        diff(actualKeys, expectedKeys) || ''
      }\n`,
    );
  }

  if (!isEqual(actual, expected)) {
    throw new Error(
      chalk`\n{yellow The generated file contents have changed for the files.}\n\n${
        diff(actual, expected) || ''
      }\n`,
    );
  }
}

async function run() {
  const actualOutput = await readFiles();
  const expectedOutput = await getOutput();

  try {
    checkOutput(actualOutput, expectedOutput);
    console.log(chalk`\n{green The generated {bold CSS} is valid for all files.}`);
  } catch (error) {
    console.log(error.message);
    console.log(chalk`{bold.red Fix with:} {blue.italic pnpm run build:styles}`);
    process.exit(1);
  }
}

run();
