import { entries, includes, keys } from '@remirror/core';
import escapeStringRegex from 'escape-string-regexp';
import aliasObject from './data/aliases';
import rawEmojiObject from './data/emojis';
import { AliasNames, EmojiObjectRecord, Names, NamesAndAliases } from './emoji-types.js';

/* Taken from https://github.com/tommoor/react-emoji-render/blob/bb67d5e344bb2b91a010461d84184052b1eb4212/data/asciiAliases.js  and emojiIndex.emoticons */
export const emoticons: Record<string, string[]> = {
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
  monkey_face: [':o)', ':o)'],
  kissing_heart: [':*', ':*', ':-*'],
  slightly_smiling_face: [':)', ':)', '(:', ':-)'],
  stuck_out_tongue_winking_eye: [';p', ';p', ';-p', ';b', ';-b', ';P', ';-P'],
  disappointed: ['):', '):', ':(', ':-('],
  anguished: ['D:', 'D:'],
};

export const SKIN_VARIATIONS = ['🏻', '🏼', '🏽', '🏾', '🏿'] as const;

const emotionRegexpSource = `(${entries(emoticons)
  .reduce((acc, [, emoticonList]) => [...acc, ...emoticonList.map(escapeStringRegex)], [] as string[])
  .join('|')})`;

export const spacedEmoticonRegexp = new RegExp(`${emotionRegexpSource}[\\s]$`);
export const emoticonRegexp = new RegExp(`${emotionRegexpSource}$`);

const emojiObject: EmojiObjectRecord = rawEmojiObject as EmojiObjectRecord;
const aliasNames = entries(aliasObject as Record<AliasNames, Names>);
for (const [alias, name] of aliasNames) {
  emojiObject[alias] = { ...emojiObject[name], name: alias };
}

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

export const isEmojiName = (name: unknown): name is NamesAndAliases => includes(emojiNames, name);

export const getEmojiByName = (name: string | undefined) =>
  isEmojiName(name) ? emojiObject[name] : undefined;

/**
 * Retrieve the EmojiData from an emoticon.
 *
 * @param emoticon e.g. `:-)`
 */
export const getEmojiFromEmoticon = (emoticon: string) => {
  const emoticonName = Object.keys(emoticons).find(name => emoticons[name].includes(emoticon));
  return getEmojiByName(emoticonName);
};
