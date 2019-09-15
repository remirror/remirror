import { BaseExtensionOptions, Extension, plainInputRule } from '@remirror/core';
import { getEmojiByName, getEmojiFromEmoticon, spacedEmoticonRegexp } from './emoji-utils';

export interface EmojiExtensionOptions extends BaseExtensionOptions {
  /**
   * The character which will trigger the emoji suggestions popup.
   */
  suggestionCharacter?: string;
}

export class EmojiExtension extends Extension<EmojiExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  get defaultOptions() {
    return {
      suggestionCharacter: ':',
    };
  }

  public inputRules() {
    return [
      // Emoticons
      plainInputRule({
        regexp: spacedEmoticonRegexp,
        transformMatch: ([full, partial]) => {
          const emoji = getEmojiFromEmoticon(partial);
          return emoji ? full.replace(partial, emoji.char) : null;
        },
      }),

      // Emoji Names
      plainInputRule({
        regexp: /:([\w\d_-]+):$/,
        transformMatch: ([, match]) => {
          const emoji = getEmojiByName(match);
          return emoji ? emoji.char : null;
        },
      }),
    ];
  }
}
