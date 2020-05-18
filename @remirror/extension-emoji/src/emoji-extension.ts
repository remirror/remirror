import escapeStringRegex from 'escape-string-regexp';

import {
  CommandFunction,
  createTypedExtension,
  FromToParameter,
  isNullOrUndefined,
  noop,
  object,
  plainInputRule,
} from '@remirror/core';

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

export const EmojiExtension = createTypedExtension<EmojiSettings, EmojiProperties>().plain({
  /**
   * The name is dynamically generated based on the passed in type.
   */
  name: 'emoji',
  defaultSettings: {
    defaultEmoji: DEFAULT_FREQUENTLY_USED,
    suggestionCharacter: ':',
    maxResults: 20,
  },
  defaultProperties: {
    onSuggestionChange: noop,
    onSuggestionExit: noop,
    suggestionKeyBindings: {},
  },

  setInitialData(parameter): Data {
    return {
      frequentlyUsed: populateFrequentlyUsed(parameter.settings.defaultEmoji),
    };
  },
  createInputRules() {
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
  },

  createCommands({ extension }) {
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
       * Inserts the suggestion character into the current position in the editor
       * in order to activate the suggestion popup..
       */
      suggestEmoji: ({ from, to }: Partial<FromToParameter> = object()): CommandFunction => ({
        state,
        dispatch,
      }) => {
        if (dispatch) {
          dispatch(state.tr.insertText(extension.settings.suggestionCharacter, from, to));
        }

        return true;
      },
    };

    return commands;
  },

  createHelpers({ extension }) {
    return {
      /**
       * Update the emoji which are displayed to the user when the query is not
       * specific enough.
       */
      updateFrequentlyUsed: (names: NamesAndAliases[]) => {
        extension.setData<Data>({ frequentlyUsed: populateFrequentlyUsed(names) });
      },
    };
  },

  createSuggestions(parameter) {
    const { extension, getCommands } = parameter;
    // const fn = debounce(100, sortEmojiMatches);

    return {
      noDecorations: true,
      invalidPrefixCharacters: escapeStringRegex(extension.settings.suggestionCharacter),
      char: extension.settings.suggestionCharacter,
      name: this.name,
      appendText: '',
      suggestTag: 'span',
      keyBindings: () => extension.properties.suggestionKeyBindings,
      onChange: (parameters) => {
        const { frequentlyUsed } = parameter.extension.getData<Data>();
        const query = parameters.queryText.full;
        const emojiMatches =
          query.length === 0
            ? frequentlyUsed
            : sortEmojiMatches(query, extension.settings.maxResults);
        extension.properties.onSuggestionChange({ ...parameters, emojiMatches });
      },
      onExit: (parameter) => extension.properties.onSuggestionExit(parameter),
      createCommand: ({ match }) => {
        const create = getCommands<typeof extension>().insertEmojiByObject;

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
  },
});

export interface EmojiCommandOptions extends Partial<FromToParameter> {
  /**
   * The skin variation which is a number between `0` and `4`.
   */
  skinVariation?: SkinVariation;
}
