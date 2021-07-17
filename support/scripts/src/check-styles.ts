/**
 * @script
 *
 * A script to check if generated css styles are up to date.
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import globby from 'globby';

import { baseDir, cliArgs, compareOutput, log, watchFiles } from './helpers';
import { copyFilesToRemirror, getOutput, removeGeneratedFiles, writeOutput } from './linaria';

const force: boolean = cliArgs.force;
const shouldFix: boolean = cliArgs.fix;
const watch: boolean = cliArgs.watch;

const inputFiles = globby.sync(['packages/remirror__theme/src/*.ts'], { cwd: baseDir() });
const outputFiles = globby.sync(['packages/remirror__styles/*.css'], { cwd: baseDir() });

/**
 * Read all the style files.
 */
async function readOutputFiles() {
  const output: Record<string, string> = {};

  for (const file of outputFiles) {
    output[baseDir(file)] = (await fs.readFile(file)).toString();
  }

  return output;
}

/**
 * Run the script.
 * @returns has error
 */
async function run(): Promise<boolean> {
  log.info(chalk`\n{green Checking styles.}`);

  const actualOutput = await readOutputFiles();
  const { css, ts } = await getOutput();

  try {
    compareOutput(actualOutput, css);
    log.info(chalk`\n{green The generated {bold CSS} is valid for all files.}`);

    if (!force) {
      return false;
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

    return false;
  }

  console.log(chalk`\n{bold.red To fix this issue run:} {blue.italic pnpm fix:css}\n`);
  return true;
}

async function main() {
  if (watch) {
    log.info(chalk`\n{green Start watching styles.}`);
    watchFiles(inputFiles, () => {
      try {
        run();
      } catch (error) {
        console.log('error:', error);
      }
    });
  } else {
    const hasError = await run();

    if (hasError) {
      process.exit(1);
    }
  }
}

main();
