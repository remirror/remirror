import { PlainExtension } from '@remirror/core';

export interface TemplateExtensionOptions {}

/**
 * The default text passed into the prosemirror schema.
 *
 * @core
 */
export class TemplateExtension extends PlainExtension<TemplateExtensionOptions> {
  public onSetCus = {};

  get name() {
    return 'template' as const;
  }
}
