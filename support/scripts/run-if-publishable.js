const { readPreState } = require('@changesets/pre');
const readChangesets = require('@changesets/read').default;
const { execSync } = require('child_process');

const [, , ...args] = process.argv;
const command = args.join(' ');

/**
 * @typedef { Object } ChangesetState
 * @property { import("@changesets/types").PreState | undefined } preState
 * @property { import("@changesets/types").NewChangeset[] } changesets
 */

/**
 * @param { string } [cwd]
 * @returns { Promise<ChangesetState> }
 */
async function readChangesetState(cwd = process.cwd()) {
  const preState = await readPreState(cwd);
  const isInPreMode = preState !== undefined && preState.mode === 'pre';

  let changesets = await readChangesets(cwd);

  if (isInPreMode) {
    const changesetsToFilter = new Set(preState.changesets);
    changesets = changesets.filter((x) => !changesetsToFilter.has(x.id));
  }

  return {
    preState: isInPreMode ? preState : undefined,
    changesets,
  };
}

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

  execSync(publishCommand, { stdio: 'inherit' });
}

run();
