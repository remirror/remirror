import escapeStringRegex from 'escape-string-regexp';
import { matchSorter } from 'match-sorter';

import {
  bool,
  CommandFunction,
  entries,
  ErrorConstant,
  extensionDecorator,
  FromToParameter,
  Handler,
  includes,
  InputRule,
  invariant,
  isNumber,
  isPlainObject,
  keys,
  object,
  PlainExtension,
  plainInputRule,
  range,
  take,
  Value,
  values,
  within,
} from '@remirror/core';
import type { SuggestChangeHandlerParameter, Suggester } from '@remirror/pm/suggest';

import type AliasData from './data/aliases';
import aliasObject from './data/aliases';
import type CategoryData from './data/categories';
import type EmojiData from './data/emojis';
import rawEmojiObject from './data/emojis';

export const DEFAULT_FREQUENTLY_USED: Names[] = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'scream',
  'disappointed',
  'unamused',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'poop',
];

@extensionDecorator<EmojiOptions>({
  defaultOptions: {
    defaultEmoji: DEFAULT_FREQUENTLY_USED,
    suggestionCharacter: ':',
    maxResults: 20,
  },
  handlerKeys: ['onChange'],
})
export class EmojiExtension extends PlainExtension<EmojiOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  /**
   * Keep track of the frequently used list.
   */
  private frequentlyUsed: EmojiObject[] = populateFrequentlyUsed(this.options.defaultEmoji);

  /**
   * Manage input rules for emoticons.
   */
  createInputRules(): InputRule[] {
    return [
      // Emoticons
      plainInputRule({
        regexp: emoticonRegex,
        transformMatch: ([full, partial]) => {
          console.log('emoji transforms');
          const emoji = getEmojiFromEmoticon(partial);
          return emoji ? full.replace(partial, emoji.char) : null;
        },
      }),
      plainInputRule({
        regexp: /(\[)/,
        transformMatch: ([full, partial]) => {
          console.log('amazing', { full, partial });
          const emoji = getEmojiFromEmoticon(partial);
          return emoji ? full.replace(partial, emoji.char) : null;
        },
      }),

      // Emoji Names
      plainInputRule({
        regexp: /:([\w-]+):$/,
        transformMatch: ([, match]) => {
          const emoji = getEmojiByName(match);
          return emoji ? emoji.char : null;
        },
      }),
    ];
  }

  /**
   * Add the commands which are used to manage the creation of emojis and
   * insertion into the editor.
   */
  createCommands() {
    const commands = {
      /**
       * Insert an emoji into the document at the requested location by name
       *
       * The range is optional and if not specified the emoji will be inserted
       * at the current selection.
       *
       * @param name - the emoji to insert
       * @param [options] - the options when inserting the emoji.
       */
      insertEmojiByName: (
        name: string,
        options: EmojiCommandOptions = object(),
      ): CommandFunction => (parameter) => {
        const emoji = getEmojiByName(name);

        if (!emoji) {
          return false;
        }

        return commands.insertEmojiByObject(emoji, options)(parameter);
      },

      /**
       * Insert an emoji into the document at the requested location.
       *
       * The range is optional and if not specified the emoji will be inserted
       * at the current selection.
       *
       * @param emoji - the emoji object to use.
       * @param [range] - the from/to position to replace.
       */
      insertEmojiByObject: (
        emoji: EmojiObject,
        { from, to, skinVariation }: EmojiCommandOptions = object(),
      ): CommandFunction => ({ tr, dispatch }) => {
        const emojiChar = skinVariation ? emoji.char + SKIN_VARIATIONS[skinVariation] : emoji.char;
        tr.insertText(emojiChar, from, to);

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },

      /**
       * Inserts the suggestion character into the current position in the
       * editor in order to activate the suggestion popup.
       */
      suggestEmoji: ({ from, to }: Partial<FromToParameter> = object()): CommandFunction => ({
        state,
        dispatch,
      }) => {
        if (dispatch) {
          dispatch(state.tr.insertText(this.options.suggestionCharacter, from, to));
        }

        return true;
      },
    };

    return commands;
  }

  /**
   * Manage the creation of helpers for this extension.
   */
  createHelpers() {
    return {
      /**
       * Update the emoji which are displayed to the user when the query is not
       * specific enough.
       */
      updateFrequentlyUsed: (names: NamesAndAliases[]) => {
        this.frequentlyUsed = populateFrequentlyUsed(names);
      },
    };
  }

  /**
   * Emojis can be selected via `:` the colon key (by default). This sets the
   * configuration using `prosemirror-suggest`
   */
  createSuggesters(): Suggester {
    return {
      disableDecorations: true,
      invalidPrefixCharacters: `${escapeStringRegex(this.options.suggestionCharacter)}|\\w`,
      char: this.options.suggestionCharacter,
      name: this.name,
      suggestTag: 'span',
      onChange: (parameter) => {
        const { range, query } = parameter;

        const emojiMatches =
          query.full.length === 0
            ? this.frequentlyUsed
            : sortEmojiMatches(query.full, this.options.maxResults);

        const create = this.store.commands.insertEmojiByObject;

        const command = (emoji: EmojiObject, skinVariation?: SkinVariation) => {
          invariant(emoji, {
            message: 'An emoji object is required when calling the emoji suggesters command',
            code: ErrorConstant.EXTENSION,
          });

          const { from, to } = range;
          create(emoji, { skinVariation, from, to });
        };

        this.options.onChange({ ...parameter, emojiMatches }, command);
      },
    };
  }
}

export interface EmojiCommandOptions extends Partial<FromToParameter> {
  /**
   * The skin variation which is a number between `0` and `4`.
   */
  skinVariation?: SkinVariation;
}

export type Names = keyof typeof EmojiData;
export type AliasNames = keyof typeof AliasData;
export type Category = keyof typeof CategoryData;
export type NamesAndAliases = Names | AliasNames;

export interface EmojiObject {
  keywords: string[];
  char: string;
  category: string;
  name: string;
  description: string;
  skinVariations: boolean;
}

export interface EmojiChangeHandlerParameter extends SuggestChangeHandlerParameter {
  /**
   * The currently matching objects
   *
   * @deprecated This will be replaced with a new way of using emojis.
   */
  emojiMatches: EmojiObject[];
}

export type SkinVariation = 0 | 1 | 2 | 3 | 4;

export type EmojiCommand = (emoji: EmojiObject, skinVariation?: SkinVariation) => void;
export type EmojiChangeHandler = (
  parameter: EmojiChangeHandlerParameter,
  command: EmojiCommand,
) => void;

export interface EmojiOptions {
  /**
   * The character which will trigger the emoji suggesters popup.
   */
  suggestionCharacter?: string;

  /**
   * A list of the initial (frequently used) emoji displayed to the user.
   * These are used when the query typed is less than two characters long.
   */
  defaultEmoji?: NamesAndAliases[];

  /**
   * Called whenever the suggestion value is updated.
   */
  onChange?: Handler<EmojiChangeHandler>;

  /**
   * The maximum results to show when searching for matching emoji.
   *
   * @default 15
   */
  maxResults?: number;
}

export type EmojiObjectRecord = Record<Names, EmojiObject>;

/* Taken from
https://github.com/tommoor/react-emoji-render/blob/bb67d5e344bb2b91a010461d84184052b1eb4212/data/asciiAliases.js
and emojiIndex.emoticons */
export const EMOTICONS: Record<string, string[]> = {
  angry: ['>:(', '>:-('],
  blush: [':")', ':-")'],
  broken_heart: ['</3', '<\\3'],
  confused: [':/', ':-/', ':\\', ':-\\'],
  cry: [":'(", ":'-(", ':,(', ':,-('],
  frowning: [':(', ':-('],
  heart: ['<3'],
  imp: [']:(', ']:-('],
  innocent: ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
  joy: [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
  kissing: [':*', ':-*'],
  laughing: ['x-)', 'X-)', ':>', ':->'],
  neutral_face: [':|', ':-|'],
  open_mouth: [':o', ':-o', ':O', ':-O'],
  rage: [':@', ':-@'],
  smile: [':D', ':-D', 'C:', 'c:'],
  smiley: [':)', ':-)', '=)', '=-)'],
  smiling_imp: [']:)', ']:-)'],
  sob: [":,'(", ":,'-(", ';(', ';-('],
  stuck_out_tongue: [':P', ':-P', ':p', ':-p', ':b', ':-b'],
  sunglasses: ['8-)', 'B-)', '8)'],
  sweat: [',:(', ',:-('],
  sweat_smile: [',:)', ',:-)'],
  unamused: [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
  wink: [';)', ';-)'],
  monkey_face: [':o)'],
  kissing_heart: [':*', ':*', ':-*'],
  slightly_smiling_face: [':)', ':)', '(:', ':-)'],
  stuck_out_tongue_winking_eye: [';p', ';p', ';-p', ';b', ';-b', ';P', ';-P'],
  disappointed: ['):', '):', ':(', ':-('],
  anguished: ['D:', 'D:'],
};

/**
 * The different skin variations supported.
 */
export const SKIN_VARIATIONS = ['🏻', '🏼', '🏽', '🏾', '🏿'] as const;

/**
 * Check that the value is a valid skin variation index.
 *
 * Perhaps a controversial name...
 */
export function isValidSkinVariation(value: unknown): value is SkinVariation {
  return isNumber(value) && within(value, 0, 4);
}

const emojiObject: EmojiObjectRecord = rawEmojiObject as EmojiObjectRecord;
const emoticonSet = new Set<string>();

for (const emoticons of values(EMOTICONS)) {
  emoticons.forEach((emoticon) => emoticon && emoticonSet.add(emoticon));
}

const emoticonSource = [...emoticonSet].map(escapeStringRegex).join('|');
export const emoticonRegex = new RegExp(`(${emoticonSource})[\\s]$`);
export const emojiNames = keys(emojiObject);
export const emojiList = entries(emojiObject).map(([, entry]) => entry);
export const emojiCategories = [
  'symbols',
  'people',
  'animals_and_nature',
  'food_and_drink',
  'activity',
  'travel_and_places',
  'objects',
  'flags',
] as const;

/**
 * Verifies that this is a valid and supported emoji name.
 */
export function isEmojiName(name: unknown): name is Names {
  return includes(emojiNames, name);
}

/**
 * Verifies that the provided names is an alias name.
 */
export function isEmojiAliasName(name: unknown): name is AliasNames {
  return includes(keys(aliasObject), name);
}

/**
 * Verifies that the name is either and alias or valid emoji name.
 */
export function isValidEmojiName(name: unknown): name is NamesAndAliases {
  return isEmojiName(name) || isEmojiAliasName(name);
}

/**
 * Verify that this is a valid emoji object
 */
export function isValidEmojiObject(value: unknown): value is EmojiObject {
  return bool(isPlainObject(value) && isEmojiName(value.name));
}

/**
 * Convert an alias to the correct name.
 */
export function aliasToName(name: AliasNames): Value<typeof aliasObject> {
  return aliasObject[name];
}

export function getEmojiByName(name: string | undefined): EmojiObject | undefined {
  return isEmojiName(name)
    ? emojiObject[name]
    : isEmojiAliasName(name)
    ? emojiObject[aliasToName(name)]
    : undefined;
}

/**
 * Retrieve the EmojiData from an emoticon.
 *
 * @param emoticon e.g. `:-)`
 */
export function getEmojiFromEmoticon(emoticon: string): EmojiObject | undefined {
  const emoticonName = Object.keys(EMOTICONS).find((name) => EMOTICONS[name].includes(emoticon));
  return getEmojiByName(emoticonName);
}

/**
 * Return a list of `maxResults` length of closest matches
 */
export function sortEmojiMatches(query: string, maxResults = -1): EmojiObject[] {
  const results = matchSorter(emojiList, query, {
    keys: ['name', (item) => item.description.replace(/\W/g, '')],
    threshold: matchSorter.rankings.CONTAINS,
  });

  return take(results, maxResults);
}

/**
 * Keeps track of the frequently used list. Eventually restore this
 * automatically from an async localStorage.
 */
export function populateFrequentlyUsed(names: NamesAndAliases[]): EmojiObject[] {
  const frequentlyUsed: EmojiObject[] = [];

  for (const name of names) {
    const emoji = getEmojiByName(name);

    if (emoji) {
      frequentlyUsed.push(emoji);
    }
  }

  return frequentlyUsed;
}

/**
 * Return a string array of hexadecimals representing the hex code for an emoji
 */
export function getHexadecimalsFromEmoji(emoji: string): string[] {
  return range(emoji.length / 2).map((index) => {
    const codePoint = emoji.codePointAt(index * 2);
    return codePoint ? codePoint.toString(16) : '';
  });
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      emoji: EmojiExtension;
    }
  }
}
