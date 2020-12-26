import { extension, PlainExtension } from '@remirror/core';

export interface TextCaseOptions {}

/**
 * Formatting for text casing in your editor.
 */
@extension<TextCaseOptions>({})
export class TextCaseExtension extends PlainExtension<TextCaseOptions> {
  get name() {
    return 'textCase' as const;
  }
}
