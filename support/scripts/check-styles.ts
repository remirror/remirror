/**
 * @script
 *
 * A script to check if generated css styles are up to date.
 */

import chalk from 'chalk';
import fs from 'fs/promises';
import globby from 'globby';

import { baseDir, cliArgs, compareOutput, log } from './helpers';
import { copyFilesToRemirror, getOutput, removeGeneratedFiles, writeOutput } from './linaria';

const force: boolean = cliArgs.force;
const shouldFix: boolean = cliArgs.fix;

const files = globby.sync(['packages/@remirror/styles/*.css'], { cwd: baseDir() });

/**
 * Read all the style files.
 */
async function readFiles() {
  const output: Record<string, string> = {};

  for (const file of files) {
    output[baseDir(file)] = (await fs.readFile(file)).toString();
  }

  return output;
}

/**
 * Run the script.
 */
async function run() {
  const actualOutput = await readFiles();
  const { css, ts } = await getOutput();

  try {
    compareOutput(actualOutput, css);
    log.info(chalk`\n{green The generated {bold CSS} is valid for all files.}`);

    if (!force) {
      return;
    }

    log.info(chalk`\n\nForcing update: {yellow \`--force\`} flag applied.\n\n`);
  } catch (error) {
    log.error(error.message);
  }

  if (shouldFix || force) {
    log.info('Forcing a fix!');
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
