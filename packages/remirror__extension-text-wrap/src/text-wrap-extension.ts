import { extension, PlainExtension } from '@remirror/core';

export interface TextWrapOptions {}

/**
 * Wrap text based on character input.
 */
@extension<TextWrapOptions>({})
export class TextWrapExtension extends PlainExtension<TextWrapOptions> {
  get name() {
    return 'textWrap' as const;
  }
}
