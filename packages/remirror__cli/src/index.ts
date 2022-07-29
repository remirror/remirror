import { Command } from 'commander';

import { build } from './commands/build';
import { watch } from './commands/watch';

export async function main() {
  const program = new Command();

  program
    .name('remirror-cli')
    .description(
      'CLI for internal development in the remirror monorepo.\n' +
        '(Set the environment variable DEBUG as `yes` to see more log',
    );

  program.command('build').description(`Build all NPM packages in current monorepo.`).action(build);

  program
    .command('watch')
    .description(`Watch files and build NPM packages when files change in current monorepo.`)
    .action(watch);

  program.parse();
}
