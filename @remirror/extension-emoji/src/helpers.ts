import { Cast } from '@remirror/core';
import { emojiIndex } from 'emoji-mart';
import { BaseEmoji, CustomEmoji } from 'emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index';
import { emoticonMap } from './emoticons';

export const isBaseEmoji = (emoji: BaseEmoji | CustomEmoji | undefined): emoji is BaseEmoji => {
  return Boolean(emoji && Cast(emoji).native);
};

/**
 * Retrieve the EmojiData from a native emoji string
 *
 * @param nativeString
 */
export const getEmojiDataByNativeString = (nativeString: string) => {
  const skinTones = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

  let skin = null;
  let baseNativeString = nativeString;

  skinTones.forEach(skinTone => {
    baseNativeString = baseNativeString.replace(skinTone, '');
    if (nativeString.indexOf(skinTone) > 0) {
      skin = skinTones.indexOf(skinTone) + 1;
    }
  });

  // For some reason the gender string for this ball players is broken.
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
export const getEmojiDataByEmoticon = (emoticon: string) => {
  let emojiData: BaseEmoji | undefined;
  const emoticonName = Object.keys(emoticonMap).find(name => emoticonMap[name].includes(emoticon));

  if (emoticonName) {
    emojiData = Object.values(emojiIndex.emojis)
      .filter(isBaseEmoji)
      .find(item => item.name === emoticonName);
  }

  return emojiData;
};
