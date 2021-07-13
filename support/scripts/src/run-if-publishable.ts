/**
 * @script
 *
 * Run the command when the repo is in a publishable state.
 */

import { exec, readChangesetState } from './helpers';

const [, , ...args] = process.argv;
const command = args.join(' ');
const FIFTY_MB_BUFFER_SIZE = 1024 * 1024 * 50;

async function run() {
  const { changesets, preState } = await readChangesetState();
  const shouldSkipCommand = changesets.length > 0;
  let tag = 'latest';

  if (preState) {
    tag = preState.tag;
  }

  const publishCommand = `${command}:${tag}`;

  if (shouldSkipCommand) {
    console.log(
      `\u001B[33mUnmerged changesets found. Skipping publish command: '${publishCommand}'\u001B[0m`,
    );

    return;
  }

  await exec(publishCommand, {
    // @ts-expect-error
    stdio: 'inherit',

    // Added so that publishing still succeeds on CI with large publish payloads.
    maxBuffer: FIFTY_MB_BUFFER_SIZE,
  });
}

run();
