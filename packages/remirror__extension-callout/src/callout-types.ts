import type { LiteralUnion, ProsemirrorAttributes, Static } from '@remirror/core';

/**
 * Options available to the [[`CalloutExtension`]].
 */
export interface CalloutOptions {
  /**
   * The default callout type to use when none is provided.
   *
   * It is a property so it can change during the editor's life.
   *
   * @default 'info'
   */
  defaultType?: Static<string>;

  /**
   * The valid types for the callout node.
   *
   * @default ['info', 'warning' , 'error' , 'success']
   */
  validTypes?: Static<string[]>;
}

export interface CalloutAttributes extends ProsemirrorAttributes {
  /**
   * The type of callout, for instance `info`, `warning`, `error` or `success`.
   *
   * @default 'info'
   */
  type?: LiteralUnion<'info' | 'warning' | 'error' | 'success', string>;
}
