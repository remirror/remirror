// #!/usr/bin/env node

import { Builtins, Cli } from 'clipanion';
import { getVersion, loadPackageJson } from 'json.macro';

import type { CommandContext } from './cli-types';
import { BundleCommand, CreateCommand } from './commands';

const version = getVersion();
const description = loadPackageJson('description') ?? '';
const name = loadPackageJson('name') ?? '';

const cli = new Cli<CommandContext>({
  binaryLabel: description,
  binaryName: `remirror`,
  binaryVersion: version,
});

cli.register(CreateCommand);
cli.register(BundleCommand);
cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2), {
  version,
  description,
  name,
  internal: false,
  cwd: process.cwd(),
  ...Cli.defaultContext,
});
