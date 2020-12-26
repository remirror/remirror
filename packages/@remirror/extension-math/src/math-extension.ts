import { extension, PlainExtension } from '@remirror/core';

export interface MathOptions {}

/**
 * Add math support to your remirror editor with mathjax
 */
@extension<MathOptions>({})
export class MathExtension extends PlainExtension<MathOptions> {
  get name() {
    return 'math' as const;
  }
}
