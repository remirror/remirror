import { extension, PlainExtension } from '@remirror/core';

export interface TemplateOptions {}

/**
 * TEMPLATE_DESCRIPTION
 */
@extension<TemplateOptions>({})
export class TemplateExtension extends PlainExtension<TemplateOptions> {
  get name() {
    return 'template' as const;
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      template: TemplateExtension;
    }
  }
}
