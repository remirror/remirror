import { extension, PlainExtension } from '@remirror/core';

export interface SupOptions {}

/**
 * Wrap selected text in a sup tag for a superscript style.
 */
@extension<SupOptions>({})
export class SupExtension extends PlainExtension<SupOptions> {
  get name() {
    return 'sup' as const;
  }
}
