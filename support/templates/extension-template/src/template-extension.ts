import { extensionDecorator, PlainExtension } from '@remirror/core';

export interface TemplateOptions {}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extensionDecorator<TemplateOptions>({})
export class TemplateExtension extends PlainExtension<TemplateOptions> {
  get name() {
    return 'template' as const;
  }
}
