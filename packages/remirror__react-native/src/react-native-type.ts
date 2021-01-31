export interface CommandWebViewMessage {
  type: 'command';
  /**
   * The name of the command.
   */
  name: string;

  /**
   * The args to pass through to the command.
   */
  args: unknown[];
}
