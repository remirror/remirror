import { bool, Cast } from '@remirror/core';
import { BaseEmoji, CustomEmoji, Data, NimbleEmojiIndex } from 'emoji-mart';
import { emoticonMap } from './emoticons';

/**
 * Checks that the emoji received was an actual base emoji and not custom.
 * Currently custom emoji are not supported.
 *
 * @param emoji
 */
export const isBaseEmoji = (emoji: BaseEmoji | CustomEmoji | undefined): emoji is BaseEmoji => {
  return bool(emoji && Cast(emoji).native);
};

/**
 * Retrieve the EmojiData from a native emoji string
 *
 * @param nativeString the native emoji utf8 string
 */
export const getEmojiDataByNativeString = (nativeString: string, data: Data) => {
  const emojiIndex = new NimbleEmojiIndex(data);
  const skinTones = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

  let skin = null;
  let baseNativeString = nativeString;

  skinTones.forEach(skinTone => {
    baseNativeString = baseNativeString.replace(skinTone, '');
    if (nativeString.indexOf(skinTone) > 0) {
      skin = skinTones.indexOf(skinTone) + 1;
    }
  });

  // For some reason the gender string for ball players causes problems on macOS.
  if (baseNativeString === '⛹‍♀️') {
    baseNativeString = '⛹️‍♀️';
  } else if (baseNativeString === '⛹‍️♂️') {
    baseNativeString = '⛹️‍♂️';
  }

  const emojiData = Object.values(emojiIndex.emojis)
    .filter(isBaseEmoji)
    .find(item => item.native === baseNativeString);

  if (emojiData) {
    emojiData.skin = skin;
  }

  return emojiData;
};

/**
 * Retrieve the EmojiData from an emoticon.
 *
 * @param emoticon e.g. `:-)`
 */
export const getEmojiDataByEmoticon = (emoticon: string, data: Data) => {
  const emojiIndex = new NimbleEmojiIndex(data);
  let emojiData: BaseEmoji | undefined;
  const emoticonName = Object.keys(emoticonMap).find(name => emoticonMap[name].includes(emoticon));

  if (emoticonName) {
    emojiData = Object.values(emojiIndex.emojis)
      .filter(isBaseEmoji)
      .find(item => item.name === emoticonName);
  }

  return emojiData;
};

/**
 * Retrieve emoji data from id
 *
 * @param id the string identifier for the emoji
 */
export const getEmojiDataById = (id: string, data: Data) => {
  const emojiIndex = new NimbleEmojiIndex(data);
  return Object.values(emojiIndex.emojis)
    .filter(isBaseEmoji)
    .find(item => item.id === id);
};
