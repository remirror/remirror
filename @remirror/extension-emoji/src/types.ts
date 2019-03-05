import { BaseEmoji } from 'emoji-mart';

export interface EmojiNodeAttrs extends Pick<BaseEmoji, 'id' | 'name' | 'native' | 'colons' | 'skin'> {
  useNative?: boolean;
}
