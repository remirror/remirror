import AliasData from './data/aliases';
import CategoryData from './data/categories';
import EmojiData from './data/emojis';

export type Names = keyof typeof EmojiData;
export type AliasNames = keyof typeof AliasData;
export type Category = keyof typeof CategoryData;
export type NamesAndAliases = Names | AliasNames;

export interface EmojiObject {
  keywords: string[];
  char: string;
  category: Category;
  name: NamesAndAliases;
  description: string;
  skinVariations: boolean;
}

export type EmojiObjectRecord = Record<NamesAndAliases, EmojiObject>;
