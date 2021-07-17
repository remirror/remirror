import type { FlatEmoji, Moji } from 'svgmoji';
import { Blobmoji, Notomoji, Openmoji, Twemoji } from 'svgmoji';
import type {
  AcceptUndefined,
  FromToProps,
  Handler,
  PrimitiveSelection,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';

export interface EmojiOptions {
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
  identifier?: 'emoji' | 'hexcode';

  /**
   * The fallback emoji. This is only used when `moji` is not provided or is a
   * string.
   *
   * @default ':red_question_mark:'
   */
  fallback?: AcceptUndefined<string>;

  /**
   * When true, emoji will be rendered as plain text instead of atom nodes.
   *
   * This is a static property and can only be set at the creation of the emoji
   * extension.
   *
   * @default false
   */
  plainText?: Static<boolean>;

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
   * The character which will activate the suggestion query callback.
   *
   * @default ':'
   */
  suggestionCharacter?: string;

  /**
   * A handler which will be called when the suggestions are activated.
   */
  suggestEmoji?: Handler<EmojiSuggestHandler>;
}

export interface EmojiSuggestHandlerProps {
  /**
   * The query value after the activation character.
   */
  query: string;

  /**
   * The full text value of the queried match.
   */
  text: string;

  /**
   * A function that takes the current suggested area and applies the command
   * for the current range.
   */
  apply: EmojiSuggestHandlerCommand;

  /**
   * The range of the matching suggestion.
   */
  range: FromToProps;

  /**
   * The `Moji` instance which can be used for searching for relevant emoji or
   * finding an emoji that matches the constraints of the user.
   */
  moji: Moji;

  /**
   * `true` when this change was triggered by an exit. Both `exit` and `change`
   * can be true when jumping between matching suggestion positions in the
   * document.
   */
  exit: boolean;

  /**
   * `true` when the update to the suggestion was caused by a change to the
   * query, or cursor position in the matching position.
   *
   * This can be true while `exit` is true if a change was caused by jumping
   * between matching suggestion positions.
   */
  change: boolean;
}

export type EmojiSuggestHandler = (props: EmojiSuggestHandlerProps) => void;

/**
 * The emoji command. Pass in the unique identifier which can either be a
 * shortcode, hexcode, emoji etc and it find the matching emoji for you.
 */
export type EmojiSuggestHandlerCommand = (emoji: string) => void;

export const DefaultMoji = {
  /**
   * The google emoji library.
   */
  noto: Notomoji,

  /**
   * The openmoji library.
   */
  openmoji: Openmoji,

  /**
   * The Twitter emoji library,
   */
  twemoji: Twemoji,

  /**
   * The blob emoji library previously developed by google. Now a community project.
   */
  blob: Blobmoji,
} as const;

export type NamedMojiType = keyof typeof DefaultMoji;

export const EMOJI_DATA_ATTRIBUTE = 'data-remirror-emoji';

export type EmojiAttributes = ProsemirrorAttributes<{
  /**
   * A string that uniquely identifies the emoji like
   * - unicode - `👍`
   * - hexcode - `1F44D`
   * - shortcode - `thumbs_up` | `:thumbs_up:`
   */
  code: string;
}>;

export interface AddEmojiCommandOptions {
  selection?: PrimitiveSelection;
}

export type { FlatEmoji } from 'svgmoji';
