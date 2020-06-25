import {
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  HandlerKeyList,
  PlainExtension,
  StaticKeyList,
} from '@remirror/core';

export interface YjsOptions {}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class YjsExtension extends PlainExtension<YjsOptions> {
  static readonly staticKeys: StaticKeyList<YjsOptions> = [];
  static readonly handlerKeys: HandlerKeyList<YjsOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<YjsOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<YjsOptions> = {};

  get name() {
    return 'yjs' as const;
  }
}
