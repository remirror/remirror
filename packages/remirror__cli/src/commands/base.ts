import { Command } from 'clipanion';
import dargs from 'dargs';
import { isAbsolute, resolve } from 'path';
import type { ConditionalPick } from 'type-fest';

import type { BaseCommandProps, CommandContext } from '../types';

export abstract class BaseCommand extends Command<CommandContext> implements BaseCommandProps {
  /**
   * Wrap the specified command to be attached to the given path on the command
   * line. The first path thus attached will be considered the "main" one, and
   * all others will be aliases.
   * @param path The command path.
   */
  static Path(command: keyof RemirrorCli.Commands): ReturnType<typeof Command.Path> {
    return Command.Path(...command.split(' '));
  }

  /**
   * Set the current working directory from the command line.
   */
  @Command.String('--cwd', { hidden: true })
  private readonly _cwd: string = process.cwd();

  /**
   * Get the current working directory for this command.
   */
  get cwd(): CommandString {
    return this._cwd ? (isAbsolute(this._cwd) ? this._cwd : resolve(this._cwd)) : process.cwd();
  }

  /**
   * Set whether the command should use verbose logging from the command line.
   */
  @Command.Boolean('--verbose')
  public verbose: CommandBoolean = false;

  /**
   * Run the a sub command with the command line arguments transformed
   * automatically.
   */
  public async run<Cmd extends keyof RemirrorCli.Commands>(
    command: Cmd,
    { positional = [], ...other }: RunSubCommandParams<RemirrorCli.Commands[Cmd]>,
  ): Promise<number> {
    const _ = [...(command ? command.split(' ') : []), ...positional];
    const args = dargs({ _, verbose: this.verbose, cwd: this.cwd, ...other }, {});

    return this.cli.run(args, { internal: true });
  }
}

export interface FlaggedCommand {
  __cmdProperty?: never;
}

type Annotate<Type> = Type & FlaggedCommand;

export type CommandString = Annotate<string>;
export type CommandBoolean = Annotate<boolean>;
export type CommandArray<Type = string> = Annotate<Type[]>;
export type CommandEnum<Type extends string> = Annotate<Type>;

export type GetShapeOfCommandData<Cmd extends BaseCommand> = ConditionalPick<Cmd, FlaggedCommand>;

export type RunSubCommandParams<CommandData extends GetShapeOfCommandData<BaseCommand>> = {
  positional?: string[];
} & Partial<CommandData>;

declare global {
  namespace RemirrorCli {
    interface Commands {}
  }
}
