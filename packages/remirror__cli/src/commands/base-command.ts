import { Command, Option } from 'clipanion';
import type { ConditionalPick, PickPartial } from '@remirror/core-types';

import type { BaseCommandProps, CommandContext } from '../cli-types';

export abstract class BaseCommand extends Command<CommandContext> implements BaseCommandProps {
  /**
   * Set the current working directory from the command line.
   */
  cwd: CommandString = Option.String('--cwd', process.cwd(), {
    description: 'Set the current working directory from which the command should be run',
    hidden: true,
  });

  /**
   * Set whether the command should use verbose logging from the command line.
   */
  verbose: CommandBoolean =
    Option.Boolean('--verbose', {
      description: 'Set logging to verbose.',
    }) ?? false;
}

export interface FlaggedCommand {
  __cmdProperty?: never;
}

type Annotate<Type> = Type & FlaggedCommand;

export type CommandString = Annotate<string>;
export type CommandBoolean = Annotate<boolean>;
export type CommandArray<Type = string> = Annotate<Type[]>;
export type CommandEnum<Type extends string> = Annotate<Type>;

/**
 * Remove the helper annotation.
 */
type RemoveAnnotation<Type> = Type extends Annotate<infer T> ? T : Type;
type RemoveAnnotations<Type> = {
  [Key in keyof Type]: RemoveAnnotation<Type[Key]>;
};

export type GetShapeOfCommandData<Cmd extends BaseCommand> = RemoveAnnotations<
  ConditionalPick<Cmd, FlaggedCommand> & Partial<ConditionalPick<PickPartial<Cmd>, FlaggedCommand>>
>;

export type RunSubCommandParams<CommandData extends GetShapeOfCommandData<BaseCommand>> = {
  positional?: string[];
} & Partial<CommandData>;

declare global {
  namespace RemirrorCli {
    interface Commands {}
  }
}
