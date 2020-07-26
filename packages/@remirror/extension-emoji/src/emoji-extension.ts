import escapeStringRegex from 'escape-string-regexp';

import {
  AddCustomHandler,
  CommandFunction,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  ErrorConstant,
  FromToParameter,
  HandlerKeyList,
  invariant,
  object,
  PlainExtension,
  plainInputRule,
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
  static readonly defaultOptions: DefaultExtensionOptions<EmojiOptions> = {
    defaultEmoji: DEFAULT_FREQUENTLY_USED,
    suggestionCharacter: ':',
    maxResults: 20,
  };

  static readonly customHandlerKeys: CustomHandlerKeyList<EmojiOptions> = ['keyBindings'];
  static readonly handlerKeys: HandlerKeyList<EmojiOptions> = ['onChange', 'onExit'];

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
  private keyBindings: EmojiSuggestionKeyBindings = {};

  /**
   * Manage input rules for emoticons.
   */
  createInputRules = () => {
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

  createCommands() {
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
      ): CommandFunction => ({ tr, dispatch }) => {
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
  }

  createHelpers = () => {
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

  protected onAddCustomHandler: AddCustomHandler<EmojiOptions> = (parameter) => {
    const { keyBindings: keyBindings } = parameter;

    if (!keyBindings) {
      return;
    }

    this.keyBindingsList = [...this.keyBindingsList, keyBindings];
    this.updateKeyBindings();

    return () => {
      this.keyBindingsList = this.keyBindingsList.filter((binding) => binding !== keyBindings);
      this.updateKeyBindings();
    };
  };

  /**
   * For now a dumb merge for the key binding command. Later entries are given priority over earlier entries.
   */
  private updateKeyBindings() {
    let newBindings: EmojiSuggestionKeyBindings = object();

    for (const binding of this.keyBindingsList) {
      newBindings = { ...newBindings, ...binding };
    }

    this.keyBindings = newBindings;
  }

  /**
   * Emojis can be selected via `:` the colon key (by default). This sets the
   * configuration using `prosemirror-suggest`
   */
  createSuggestions(): Suggestion {
    return {
      noDecorations: true,
      invalidPrefixCharacters: escapeStringRegex(this.options.suggestionCharacter),
      char: this.options.suggestionCharacter,
      name: this.name,
      appendText: '',
      suggestTag: 'span',
      keyBindings: () => this.keyBindings,
      onChange: (parameters) => {
        const query = parameters.queryText.full;
        const emojiMatches =
          query.length === 0
            ? this.frequentlyUsed
            : sortEmojiMatches(query, this.options.maxResults);
        this.options.onChange({ ...parameters, emojiMatches });
      },

      onExit: this.options.onExit,
      createCommand: (parameter) => {
        const { match } = parameter;
        const { getCommands } = this.store;
        const create = getCommands().insertEmojiByObject;

        return (emoji, skinVariation) => {
          invariant(emoji, {
            message: 'An emoji object is required when calling the emoji suggesters command',
            code: ErrorConstant.EXTENSION,
          });

          const { from, end: to } = match.range;
          create(emoji, { skinVariation, from, to });
        };
      },
    };
  }
}

export interface EmojiCommandOptions extends Partial<FromToParameter> {
  /**
   * The skin variation which is a number between `0` and `4`.
   */
  skinVariation?: SkinVariation;
}
