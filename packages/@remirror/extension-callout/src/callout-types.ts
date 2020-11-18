import type { LiteralUnion } from 'type-fest';

import type { ProsemirrorAttributes } from '@remirror/core';

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
  defaultType?: string;
}

export interface CalloutAttributes extends ProsemirrorAttributes {
  /**
   * The type of callout, for instance `info`, `warning`, `error` or `success`.
   *
   * @default 'info'
   */
  type?: LiteralUnion<'info' | 'warning' | 'error' | 'success', string>;
}
