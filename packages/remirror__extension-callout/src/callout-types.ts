import type { FlatEmoji, Moji } from 'svgmoji';
import type { LiteralUnion, ProsemirrorAttributes, Static } from '@remirror/core';
import { NamedMojiType } from '@remirror/extension-emoji';

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
   * @default ['info', 'warning' , 'error' , 'success', 'idea']
   */
  validTypes?: Static<string[]>;

  /**
   * Under the hood the `EmojiExtension` use `svgmoji` to manage the custom
   * emoji assets.
   *
   * The available options are `'noto'` | `'openmoji'` | `'twemoji'` | `'blob'`
   *
   * @default 'noto'
   */
  moji?: NamedMojiType | Moji;

  /**
   * The list of emoji data to make available to the user. This is used to
   * create the underlying instance of the `Moji` which is used for searching
   * and generating CDN urls.
   *
   * If you provide your own `Moji` instance then you can set this to an empty
   * array `[]`.
   *
   * ```ts
   * import data from 'svgmoji/emoji.json';
   *
   * const emojiExtension = new EmojiExtension({ data, moji: 'noto' });
   * ```
   */
  data: FlatEmoji[];
}

export interface CalloutAttributes extends ProsemirrorAttributes {
  /**
   * The type of callout, for instance `info`, `warning`, `error`,  `success` or `idea`.
   *
   * @default 'info'
   */
  type?: LiteralUnion<'info' | 'warning' | 'error' | 'success' | 'idea', string>;
}
