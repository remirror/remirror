import { Command } from 'commander';

import { build } from './commands/build';
import { watch } from './commands/watch';
import { colors } from './utils/colors';

export async function main() {
  const program = new Command();

  program
    .name('remirror-cli')
    .description(
      'CLI for internal development in the remirror monorepo.\n' +
        `(Set the environment variable ${colors.yellow('DEBUG')} as ` +
        `${colors.yellow('yes')} to see more information.)`,
    );

  program.command('build').description(`Build all NPM packages in current monorepo.`).action(build);

  program
    .command('watch')
    .option('--skip-build', 'Skip build before watching.')
    .description(`Watch files and build NPM packages when files change in current monorepo.`)
    .action(watch);

  program.parse();
}
