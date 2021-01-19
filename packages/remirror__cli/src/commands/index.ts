import { Command } from 'clipanion';

import { BaseCommand, GetShapeOfCommandData } from './base';

export class HelpCommand extends BaseCommand {
  @Command.Path('-h')
  @Command.Path('--help')
  public async execute(): Promise<void> {
    this.context.stdout.write(this.cli.usage(null, { detailed: this.verbose }));
  }
}

export class VersionCommand extends BaseCommand {
  @Command.Path('-v')
  @Command.Path('--version')
  public async execute(): Promise<void> {
    const { version, name, stdout } = this.context;

    if (this.verbose) {
      stdout.write(
        `${name}: ${version}\nnode: ${process.version}\nos: ${process.platform} ${process.arch}}\n`,
      );
    } else {
      stdout.write(`${version}\n`);
    }
  }
}

export { BundleCommand } from './bundle';
export { CreateCommand } from './create';

declare global {
  namespace RemirrorCli {
    interface Commands {
      '--version': GetShapeOfCommandData<VersionCommand>;
      '-v': GetShapeOfCommandData<VersionCommand>;
      '--help': GetShapeOfCommandData<HelpCommand>;
      '-h': GetShapeOfCommandData<HelpCommand>;
    }
  }
}
