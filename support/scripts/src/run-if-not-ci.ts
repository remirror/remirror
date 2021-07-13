/**
 * @script
 *
 * Run the command when not within a `CI` environment.
 */

import { execSync } from 'child_process';

const [, , ...args] = process.argv;
const command = args.join(' ');
const { CI } = process.env;

if (CI === 'true') {
  console.log(`CI='true' - skipping command: '${command}'\n\n`);
  process.exit(0);
}

execSync(command, { stdio: 'inherit' });
