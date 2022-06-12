import { Command } from 'commander';

import { build } from './commands/build';

export async function main() {
  const program = new Command();

  program.name('remirror-cli').description('CLI for internal development in the remirror monorepo');

  program
    .command('build')
    .description(
      `Build all NPM packages in current monorepo.

Notice that this command will not bundle .d.ts files for you nor check TypeScript typings. You will need to run "pnpm -w typecheck" to do that.`,
    )
    .action(build);

  program.parse();
}
