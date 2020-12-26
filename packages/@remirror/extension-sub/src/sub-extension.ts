import { extension, PlainExtension } from '@remirror/core';

export interface SubOptions {}

/**
 * Wrap selected text in a sub tag for a subscript style.
 */
@extension<SubOptions>({})
export class SubExtension extends PlainExtension<SubOptions> {
  get name() {
    return 'sub' as const;
  }
}
