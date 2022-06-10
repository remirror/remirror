import { Command } from 'commander';

import { foo } from './commands/foo';

export async function main() {
  const program = new Command();

  program.name('remirror-cli').description('CLI for internal development in the remirror monorepo');

  program
    .command('foo')
    .description('Split a string into substrings and display as an array')
    .argument('<string>', 'string to split')
    .option('--first', 'display just the first substring')
    .option('-s, --separator <char>', 'separator character', ',')
    .action(foo);

  program.parse();
}
