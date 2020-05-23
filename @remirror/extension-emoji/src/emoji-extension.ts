import escapeStringRegex from 'escape-string-regexp';

import {
  CommandFunction,
  DefaultExtensionSettings,
  FromToParameter,
  isNullOrUndefined,
  noop,
  object,
  PlainExtension,
  plainInputRule,
} from '@remirror/core';
import { Suggestion } from '@remirror/pm/suggest';

import {
  EmojiObject,
  EmojiProperties,
  EmojiSettings,
  NamesAndAliases,
  SkinVariation,
} from './emoji-types';
import {
  DEFAULT_FREQUENTLY_USED,
  emoticonRegex,
  getEmojiByName,
  getEmojiFromEmoticon,
  populateFrequentlyUsed,
  SKIN_VARIATIONS,
  sortEmojiMatches,
} from './emoji-utils';

interface Data {
  frequentlyUsed: EmojiObject[];
}

export class EmojiExtension extends PlainExtension<EmojiSettings, EmojiProperties> {
  public static readonly defaultSettings: DefaultExtensionSettings<EmojiSettings> = {
    defaultEmoji: DEFAULT_FREQUENTLY_USED,
    suggestionCharacter: ':',
  };

  public static readonly defaultProperties: Required<EmojiProperties> = {
    maxResults: 20,
    onSuggestionChange: noop,
    onSuggestionExit: noop,
    suggestionKeyBindings: {},
  };

  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji';
  }

  /**
   * Keep track of the frequently used list.
   */
  private frequentlyUsed: EmojiObject[] = populateFrequentlyUsed(this.settings.defaultEmoji);

  public createInputRules = () => {
    return [
      // Emoticons
      plainInputRule({
        regexp: emoticonRegex,
        transformMatch: ([full, partial]) => {
          const emoji = getEmojiFromEmoticon(partial);
          return emoji ? full.replace(partial, emoji.char) : null;
        },
      }),

      // Emoji Names
      plainInputRule({
        regexp: /:([\w-]+):$/,
        transformMatch: ([, match]) => {
          const emoji = getEmojiByName(match);
          return emoji ? emoji.char : null;
        },
      }),
    ];
  };

  public createCommands = () => {
    const commands = {
      /**
       * Insert an emoji into the document at the requested location by name
       *
       * The range is optional and if not specified the emoji will be inserted
       * at the current selection.
       *
       * @param name - the emoji to insert
       * @param [options] - the options when inserting the emoji.
       */
      insertEmojiByName: (
        name: string,
        options: EmojiCommandOptions = object(),
      ): CommandFunction => (parameter) => {
        const emoji = getEmojiByName(name);
        if (!emoji) {
          console.warn('invalid emoji name passed into emoji insertion');
          return false;
        }

        return commands.insertEmojiByObject(emoji, options)(parameter);
      },

      /**
       * Insert an emoji into the document at the requested location.
       *
       * The range is optional and if not specified the emoji will be inserted
       * at the current selection.
       *
       * @param emoji - the emoji object to use.
       * @param [range] - the from/to position to replace.
       */
      insertEmojiByObject: (
        emoji: EmojiObject,
        { from, to, skinVariation }: EmojiCommandOptions = object(),
      ): CommandFunction => ({ state, dispatch }) => {
        const { tr } = state;
        const emojiChar = skinVariation ? emoji.char + SKIN_VARIATIONS[skinVariation] : emoji.char;
        tr.insertText(emojiChar, from, to);

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },

      /**
       * Inserts the suggestion character into the current position in the
       * editor in order to activate the suggestion popup.
       */
      suggestEmoji: ({ from, to }: Partial<FromToParameter> = object()): CommandFunction => ({
        state,
        dispatch,
      }) => {
        if (dispatch) {
          dispatch(state.tr.insertText(this.settings.suggestionCharacter, from, to));
        }

        return true;
      },
    };

    return commands;
  };

  public createHelpers = () => {
    return {
      /**
       * Update the emoji which are displayed to the user when the query is not
       * specific enough.
       */
      updateFrequentlyUsed: (names: NamesAndAliases[]) => {
        this.frequentlyUsed = populateFrequentlyUsed(names);
      },
    };
  };

  /**
   * Emojis can be selected via `:` the colon key (by default). This sets the
   * configuration using `prosemirror-suggest`
   */
  public createSuggestions = (): Suggestion => {
    // const fn = debounce(100, sortEmojiMatches);

    return {
      noDecorations: true,
      invalidPrefixCharacters: escapeStringRegex(this.settings.suggestionCharacter),
      char: this.settings.suggestionCharacter,
      name: this.name,
      appendText: '',
      suggestTag: 'span',
      keyBindings: () => this.properties.suggestionKeyBindings,
      onChange: (parameters) => {
        const query = parameters.queryText.full;
        const emojiMatches =
          query.length === 0
            ? this.frequentlyUsed
            : sortEmojiMatches(query, this.properties.maxResults);
        this.properties.onSuggestionChange({ ...parameters, emojiMatches });
      },
      onExit: (parameter) => this.properties.onSuggestionExit(parameter),
      createCommand: (parameter) => {
        const { match } = parameter;
        const { getCommands } = this.store;
        const create = getCommands().insertEmojiByObject;

        return (emoji, skinVariation) => {
          if (isNullOrUndefined(emoji)) {
            throw new Error(
              'An emoji object is required when calling the emoji suggesters command',
            );
          }

          const { from, end: to } = match.range;
          create(emoji, { skinVariation, from, to });
        };
      },
    };
  };
}

export interface EmojiCommandOptions extends Partial<FromToParameter> {
  /**
   * The skin variation which is a number between `0` and `4`.
   */
  skinVariation?: SkinVariation;
}
