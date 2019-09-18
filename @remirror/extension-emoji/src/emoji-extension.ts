import {
  CommandFunction,
  CommandParams,
  Extension,
  ExtensionManagerParams,
  FromToParams,
  noop,
  plainInputRule,
} from '@remirror/core';
import { Suggester } from 'prosemirror-suggest';
import {
  EmojiExtensionOptions,
  EmojiObject,
  EmojiSuggestCommand,
  NamesAndAliases,
  SkinVariation,
} from './emoji-types';
import {
  ambiguousEmoticonRegex,
  DEFAULT_FREQUENTLY_USED,
  getEmojiByName,
  getEmojiFromEmoticon,
  populateFrequentlyUsed,
  SKIN_VARIATIONS,
  sortEmojiMatches,
  unambiguousEmoticonRegex,
} from './emoji-utils';

export class EmojiExtension extends Extension<EmojiExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  get defaultOptions() {
    return {
      defaultEmoji: DEFAULT_FREQUENTLY_USED,
      suggestionCharacter: ':',
      onSuggestionChange: noop,
      onSuggestionExit: noop,
      suggestionKeyBindings: {},
    };
  }

  private frequentlyUsed!: EmojiObject[];

  protected init() {
    this.frequentlyUsed = populateFrequentlyUsed(this.options.defaultEmoji);
  }

  public inputRules() {
    return [
      // Emoticons
      plainInputRule({
        regexp: unambiguousEmoticonRegex,
        transformMatch: ([match]) => {
          const emoji = getEmojiFromEmoticon(match);
          return emoji ? emoji.char : null;
        },
      }),

      // Ambiguous Emoticons (require a space at the end)
      plainInputRule({
        regexp: ambiguousEmoticonRegex,
        transformMatch: ([full, partial]) => {
          const emoji = getEmojiFromEmoticon(partial);
          return emoji ? full.replace(partial, emoji.char) : null;
        },
      }),

      // Emoji Names
      plainInputRule({
        regexp: /:([\w\d_-]+):$/,
        transformMatch: ([, match]) => {
          const emoji = getEmojiByName(match);
          return emoji ? emoji.char : null;
        },
      }),
    ];
  }

  public commands({  }: CommandParams) {
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
      insertEmojiByName: (name: string, options: EmojiCommandOptions = {}): CommandFunction => (...args) => {
        const emoji = getEmojiByName(name);
        if (!emoji) {
          console.warn('invalid emoji name passed into emoji insertion');
          return false;
        }

        return commands.insertEmojiByObject(emoji, options)(...args);
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
        { from, to, skinVariation }: EmojiCommandOptions = {},
      ): CommandFunction => (state, dispatch) => {
        const { tr } = state;
        const emojiChar = skinVariation ? emoji.char + SKIN_VARIATIONS[skinVariation] : emoji.char;
        console.log(emojiChar, from, to);
        tr.insertText(emojiChar, from, to);

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },
    };

    return commands;
  }

  public helpers() {
    return {
      /**
       * Update the emoji which are displayed to the user when the query is not
       * specific enough.
       */
      updateFrequentlyUsed: (names: NamesAndAliases[]) => {
        this.frequentlyUsed = populateFrequentlyUsed(names);
      },
    };
  }

  public suggesters({ getActions }: ExtensionManagerParams): Suggester<EmojiSuggestCommand> {
    const {
      suggestionCharacter,
      suggestionKeyBindings,
      maxResults,
      onSuggestionChange,
      onSuggestionExit,
    } = this.options;

    return {
      ignoreDecorations: true,
      char: suggestionCharacter,
      name: this.name,
      appendText: '',
      decorationsTag: 'span',
      keyBindings: suggestionKeyBindings,
      onChange: params => {
        const query = params.query.full;
        const emojiMatches =
          query.length <= 1 ? this.frequentlyUsed : sortEmojiMatches({ query, maxResults });
        onSuggestionChange({ ...params, emojiMatches });
      },
      onExit: onSuggestionExit,
      createCommand: ({ match }) => {
        const create = getActions('insertEmojiByObject');

        return (emoji, skinVariation) => {
          if (!emoji) {
            throw new Error('An emoji object is required when calling the emoji suggestions command');
          }

          const { from, end: to } = match.range;
          console.log(match);
          create(emoji, { skinVariation, from, to });
        };
      },
    };
  }
}

export interface EmojiCommandOptions extends Partial<FromToParams> {
  /**
   * The skin variation which is a number between `0` and `4`.
   */
  skinVariation?: SkinVariation;
}
