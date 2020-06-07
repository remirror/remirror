import {
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  HandlerKeyList,
  PlainExtension,
  StaticKeyList,
} from '@remirror/core';

export interface TemplateOptions {}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class TemplateExtension extends PlainExtension<TemplateOptions> {
  static readonly staticKeys: StaticKeyList<TemplateOptions> = [];
  static readonly handlerKeys: HandlerKeyList<TemplateOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<TemplateOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<TemplateOptions> = {};

  get name() {
    return 'template' as const;
  }
}
