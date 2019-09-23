import {
  bool,
  entries,
  includes,
  isNumber,
  isPlainObject,
  keys,
  range,
  take,
  uniqueArray,
  within,
} from '@remirror/core';
import escapeStringRegex from 'escape-string-regexp';
import matchSorter from 'match-sorter';
import aliasObject from './data/aliases';
import rawEmojiObject from './data/emojis';
import {
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

export const SKIN_VARIATIONS = ['🏻', '🏼', '🏽', '🏾', '🏿'] as const;

/**
 * Check that the value is a valid skin variation index.
 */
export const isValidSkinVariation = (value: unknown): value is SkinVariation =>
  isNumber(value) && within(value, 0, 4);

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
const emoticonList = uniqueArray(
  entries(EMOTICONS).reduce((acc, [, emoticons]) => [...acc, ...emoticons], [] as string[]),
);
const emoticonSource = emoticonList.map(escapeStringRegex).join('|');
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

export const isEmojiName = (name: unknown): name is Names => includes(emojiNames, name);
export const isEmojiAliasName = (name: unknown): name is AliasNames => includes(keys(aliasObject), name);
export const isValidEmojiName = (name: unknown): name is NamesAndAliases =>
  isEmojiName(name) || isEmojiAliasName(name);
export const isValidEmojiObject = (value: unknown): value is EmojiObject =>
  bool(isPlainObject(value) && isEmojiName(value.name));
export const aliasToName = (name: AliasNames) => aliasObject[name];

export const getEmojiByName = (name: string | undefined) =>
  isEmojiName(name) ? emojiObject[name] : isEmojiAliasName(name) ? emojiObject[aliasToName(name)] : undefined;

/**
 * Retrieve the EmojiData from an emoticon.
 *
 * @param emoticon e.g. `:-)`
 */
export const getEmojiFromEmoticon = (emoticon: string) => {
  const emoticonName = Object.keys(EMOTICONS).find(name => EMOTICONS[name].includes(emoticon));
  return getEmojiByName(emoticonName);
};

/**
 * Return a list of `maxResults` length of closest matches
 */
export const sortEmojiMatches = (query: string, maxResults = -1) => {
  const results = matchSorter(emojiList, query, {
    keys: ['name', item => item.description.replace(/[^\w]/g, '')],
    threshold: matchSorter.rankings.CONTAINS,
  });

  return take(results, maxResults);
};

export const populateFrequentlyUsed = (names: NamesAndAliases[]) => {
  const frequentlyUsed: EmojiObject[] = [];
  for (const name of names) {
    const emoji = getEmojiByName(name);
    if (emoji) {
      frequentlyUsed.push(emoji);
    }
  }

  return frequentlyUsed;
};

/**
 * Return a string array of hexadecimals representing the hex code for an emoji
 */
export const getHexadecimalsFromEmoji = (emoji: string) => {
  return range(emoji.length / 2).map(index => {
    const codePoint = emoji.codePointAt(index * 2);
    return codePoint ? codePoint.toString(16) : '';
  });
};
