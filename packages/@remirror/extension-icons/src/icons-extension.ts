import { extension, PlainExtension } from '@remirror/core';

export interface IconsOptions {}

/**
 * Add support for icons to your extensions.
 */
@extension<IconsOptions>({})
export class IconsExtension extends PlainExtension<IconsOptions> {
  get name() {
    return 'icons' as const;
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      icons: IconsExtension;
    }
  }
}
