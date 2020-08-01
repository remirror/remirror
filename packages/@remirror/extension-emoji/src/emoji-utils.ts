import escapeStringRegex from 'escape-string-regexp';
import matchSorter from 'match-sorter';

import {
  bool,
  entries,
  includes,
  isNumber,
  isPlainObject,
  keys,
  range,
  take,
  values,
  within,
} from '@remirror/core';

import aliasObject from './data/aliases';
import rawEmojiObject from './data/emojis';
import type {
  AliasNames,
  EmojiObject,
  EmojiObjectRecord,
  Names,
  NamesAndAliases,
  SkinVariation,
} from './emoji-types.js';

/* Taken from https://github.com/tommoor/react-emoji-render/blob/bb67d5e344bb2b91a010461d84184052b1eb4212/data/asciiAliases.js  and emojiIndex.emoticons */
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
export function aliasToName(name: AliasNames) {
  return aliasObject[name];
}

export function getEmojiByName(name: string | undefined) {
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
export function getEmojiFromEmoticon(emoticon: string) {
  const emoticonName = Object.keys(EMOTICONS).find((name) => EMOTICONS[name].includes(emoticon));
  return getEmojiByName(emoticonName);
}

/**
 * Return a list of `maxResults` length of closest matches
 */
export function sortEmojiMatches(query: string, maxResults = -1) {
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
export function getHexadecimalsFromEmoji(emoji: string) {
  return range(emoji.length / 2).map((index) => {
    const codePoint = emoji.codePointAt(index * 2);
    return codePoint ? codePoint.toString(16) : '';
  });
}
