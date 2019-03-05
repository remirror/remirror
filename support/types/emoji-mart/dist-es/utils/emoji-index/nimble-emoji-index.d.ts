import { Data } from '../data';

export type EmojiSkin = 1 | 2 | 3 | 4 | 5 | 6;

export interface BaseEmoji {
  id: string;
  name: string;
  colons: string;
  /** Reverse mapping to keyof emoticons */
  emoticons: string[];
  unified: string;
  skin: EmojiSkin | null;
  native: string;
}

export interface CustomEmoji {
  // id is overridden by short_names[0]
  id?: string;
  // colons is overridden by :id:
  colons?: string;
  name: string;
  /** Must contain at least one name. The first name is used as the unique id. */
  short_names: string[];
  emoticons?: string[];
  keywords?: string[];
  imageUrl: string;
}

export type EmojiData = BaseEmoji | CustomEmoji;

export default class NimbleEmojiIndex {
  constructor(data: Data);
  public search(query: ''): null;
  public search(query: string): EmojiData[] | null;
  public emojis: { [emoji: string]: EmojiData };
  /** Mapping of string to keyof emojis */
  public emoticons: { [emoticon: string]: string };
}
