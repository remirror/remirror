/**
 * @script
 *
 * Only run the provided script if the git status is clean.
 *
 * `pnpm ts support/scripts/run-if-clean publish` -> `publish` only runs if the
 * repository is in a clean state.
 */
import { execSync } from 'child_process';

const [, , ...args] = process.argv;
const command = args.join(' ');

// Check if git status is dirty right now
const status = execSync('git status -s').toString();

if (status) {
  console.error(
    '\nThis git repository is currently dirty.',
    `\n\nPlease commit or stash your changes to proceed with the command:  '${command}'\n\n`,
  );
  process.exit(1);
}

execSync(command, { stdio: 'inherit' });
