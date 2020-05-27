import escapeStringRegex from 'escape-string-regexp';

import {
  CommandFunction,
  CustomKeyList,
  DefaultExtensionOptions,
  FromToParameter,
  HandlerKeyList,
  isNullOrUndefined,
  noop,
  object,
  PlainExtension,
  plainInputRule,
  SetCustomOption,
} from '@remirror/core';
import { Suggestion } from '@remirror/pm/suggest';

import {
  EmojiObject,
  EmojiOptions,
  EmojiSuggestionKeyBindings,
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

export class EmojiExtension extends PlainExtension<EmojiOptions> {
  public static readonly defaultOptions: DefaultExtensionOptions<EmojiOptions> = {
    defaultEmoji: DEFAULT_FREQUENTLY_USED,
    suggestionCharacter: ':',
    maxResults: 20,
    suggestionKeyBindings: {},
  };

  public static readonly customKeys: CustomKeyList<EmojiOptions> = ['suggestionKeyBindings'];
  public static readonly handlerKeys: HandlerKeyList<EmojiOptions> = [
    'onSuggestionChange',
    'onSuggestionExit',
  ];

  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji';
  }

  /**
   * Keep track of the frequently used list.
   */
  private frequentlyUsed: EmojiObject[] = populateFrequentlyUsed(this.options.defaultEmoji);

  /**
   * The custom keybindings added for the emoji plugin.
   */
  private keyBindingsList: EmojiSuggestionKeyBindings[] = [];

  /**
   * The compiled keybindings.
   */
  private suggestionKeyBindings: EmojiSuggestionKeyBindings = {};

  /**
   * Manage input rules for emoticons.
   */
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
          dispatch(state.tr.insertText(this.options.suggestionCharacter, from, to));
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

  public onSetCustomOption: SetCustomOption<EmojiOptions> = (key, value) => {
    switch (key) {
      case 'suggestionKeyBindings':
        this.keyBindingsList = [...this.keyBindingsList, value];
        this.updateKeyBindings();

        return () => {
          this.keyBindingsList = this.keyBindingsList.filter((binding) => binding !== value);
          this.updateKeyBindings();
        };

        return noop;

      default:
        return noop;
    }
  };

  /**
   * For now a dumb merge for the key binding command. Later entries are given priority over earlier entries.
   */
  private updateKeyBindings() {
    let newBindings: EmojiSuggestionKeyBindings = object();

    for (const binding of this.keyBindingsList) {
      newBindings = { ...newBindings, ...binding };
    }

    this.suggestionKeyBindings = newBindings;
  }

  /**
   * Emojis can be selected via `:` the colon key (by default). This sets the
   * configuration using `prosemirror-suggest`
   */
  public createSuggestions = (): Suggestion => {
    // const fn = debounce(100, sortEmojiMatches);

    return {
      noDecorations: true,
      invalidPrefixCharacters: escapeStringRegex(this.options.suggestionCharacter),
      char: this.options.suggestionCharacter,
      name: this.name,
      appendText: '',
      suggestTag: 'span',
      keyBindings: () => this.suggestionKeyBindings,
      onChange: (parameters) => {
        const query = parameters.queryText.full;
        const emojiMatches =
          query.length === 0
            ? this.frequentlyUsed
            : sortEmojiMatches(query, this.options.maxResults);
        this.options.onSuggestionChange({ ...parameters, emojiMatches });
      },

      onExit: this.options.onSuggestionExit,
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
