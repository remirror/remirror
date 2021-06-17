import type { FlatEmoji, Moji } from 'svgmoji';
import type { AcceptUndefined, LiteralUnion, ProsemirrorAttributes, Static } from '@remirror/core';
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
   * The fallback emoji. This is only used when `moji` is not provided or is a
   * string.
   *
   * @default ':red_question_mark:'
   */
  emojiFallback?: AcceptUndefined<string>;

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
  emojiData: FlatEmoji[];

  /**
   * The default representation for the emoji identifier.
   *
   * - `emoji` for the unicode representation of the emoji `👍`
   * - `hexcode` for the hexcode representation `1F44D`
   *
   * This is the value that is assigned to the emoji attributes and will be
   * stored in the `RemirrorJSON` output. If you're backend does not support
   * `unicode` then you should set this to `hexcode`.
   *
   * @default emoji
   */
  emojiIdentifier?: 'emoji' | 'hexcode';
}

export interface CalloutAttributes extends ProsemirrorAttributes {
  /**
   * The type of callout, for instance `info`, `warning`, `error`,  `success` or `idea`.
   *
   * @default 'info'
   */
  type?: LiteralUnion<'info' | 'warning' | 'error' | 'success' | 'idea', string>;

  /**
   * A string that uniquely identifies the emoji like
   * - unicode - `👍`
   * - hexcode - `1F44D`
   * - shortcode - `thumbs_up` | `:thumbs_up:`
   */
  code?: string;
}
