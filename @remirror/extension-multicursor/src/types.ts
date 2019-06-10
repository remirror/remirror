import { BaseExtensionOptions } from '@remirror/core';

export interface MulticursorExtensionOptions extends BaseExtensionOptions {
  /**
   * This determines the character that will be used to represent the cursor.
   *
   * @default '|'
   */
  cursor?: string;

  /**
   * The class name of the decoration span used to mark the blinking cursor
   *
   * @default 'multicursor-blinking'
   */
  cursorClassName?: string;

  /**
   * The color of the cursor
   *
   * @default 'black'
   */
  cursorColor?: string;

  /**
   * The activation key which sets a keypress as
   *
   * @default 'metaKey'
   */
  clickActivationKey?: 'altKey' | 'metaKey' | 'ctrlKey';
}
