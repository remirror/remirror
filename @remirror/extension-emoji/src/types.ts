import { BaseEmoji } from 'emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index';

export interface EmojiNodeAttrs extends Pick<BaseEmoji, 'id' | 'name' | 'native' | 'colons' | 'skin'> {
  useNative?: boolean;
}
