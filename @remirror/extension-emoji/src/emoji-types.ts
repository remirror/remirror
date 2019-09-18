import { BaseExtensionOptions } from '@remirror/core';
import {
  SuggestChangeHandlerParams,
  SuggestExitHandlerParams,
  SuggestKeyBindingMap,
} from 'prosemirror-suggest';
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
  name: Names;
  description: string;
  skinVariations: boolean;
}

export interface EmojiSuggestionChangeHandlerParams extends SuggestChangeHandlerParams<EmojiSuggestCommand> {
  /**
   * The currently matching objects
   */
  emojiMatches: EmojiObject[];
}

export type SkinVariation = 0 | 1 | 2 | 3 | 4;

export type EmojiSuggestCommand = (emoji: EmojiObject, skinVariation?: SkinVariation) => void;
export type EmojiSuggestionKeyBindings = SuggestKeyBindingMap<EmojiSuggestCommand>;
export type EmojiSuggestionChangeHandler = (params: EmojiSuggestionChangeHandlerParams) => void;
export type EmojiSuggestionExitHandler = (params: SuggestExitHandlerParams) => void;

export interface EmojiExtensionOptions extends BaseExtensionOptions {
  /**
   * The character which will trigger the emoji suggestions popup.
   */
  suggestionCharacter?: string;

  /**
   * Key bindings for suggestions.
   */
  suggestionKeyBindings?: EmojiSuggestionKeyBindings;

  /**
   * Called whenever the suggestion value is updated.
   */
  onSuggestionChange?: EmojiSuggestionChangeHandler;

  /**
   * Called when the suggestion exits.
   * This is useful for cleaning up local state when emoji is set.
   */
  onSuggestionExit?: EmojiSuggestionExitHandler;

  /**
   * A list of the initial (frequently used) emoji displayed to the user.
   * These are used when the query typed is less than two characters long.
   */
  defaultEmoji?: NamesAndAliases[];

  /**
   * The maximum results to show when searching for matching emoji.
   *
   * @default 15
   */
  maxResults?: number;
}

export type EmojiObjectRecord = Record<Names, EmojiObject>;
