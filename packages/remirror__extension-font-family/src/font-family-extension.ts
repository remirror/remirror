import { extension, PlainExtension } from '@remirror/core';

export interface FontFamilyOptions {}

/**
 * Add a font family to selected text, or text within the provided range.
 */
@extension<FontFamilyOptions>({})
export class FontFamilyExtension extends PlainExtension<FontFamilyOptions> {
  get name() {
    return 'fontFamily' as const;
  }
}
