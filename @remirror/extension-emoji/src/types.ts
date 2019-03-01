import { BaseEmoji } from 'emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index';

export type EmojiNodeAttrs = Pick<BaseEmoji, 'id' | 'name' | 'native'>;
