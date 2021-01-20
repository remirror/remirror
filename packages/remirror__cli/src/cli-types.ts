import type { BaseContext } from 'clipanion';

export interface CommandContext extends BaseContext {
  /**
   * The current working directory.
   */
  cwd: string;

  /**
   * The CLI version
   */
  version: string;

  /**
   * The CLI description
   */
  description: string;

  /**
   * The cli name as defined in the package.json.
   */
  name: string;

  /**
   * - `false` when this command is being run directly from the command line
   * - `true` when it is run from another command.
   *
   * @default false
   */
  internal: boolean;
}

export interface BaseCommandProps {
  verbose?: boolean;
  cwd?: string;
}
