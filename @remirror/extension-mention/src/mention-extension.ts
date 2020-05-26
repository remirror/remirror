import {
  convertCommand,
  DefaultExtensionOptions,
  ErrorConstant,
  getMarkRange,
  getMatchString,
  invariant,
  isElementDOMNode,
  isMarkActive,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markPasteRule,
  noop,
  object,
  RangeParameter,
  removeMark,
  replaceText,
  TransactionTransformer,
} from '@remirror/core';
import {
  escapeChar,
  getRegexPrefix,
  isInvalidSplitReason,
  isRemovedReason,
  isSplitReason,
  regexToString,
  Suggestion,
} from '@remirror/pm/suggest';

import {
  MentionExtensionAttributes,
  MentionExtensionSuggestCommand,
  MentionProperties,
  MentionSettings,
  SuggestionCommandAttributes,
} from './mention-types';
import {
  DEFAULT_MATCHER,
  getAppendText,
  getMatcher,
  isValidMentionAttributes,
} from './mention-utils';

const defaultHandler = () => false;

/**
 * The mention extension wraps mentions as a prosemirror mark. It allows for
 * very fluid and flexible social experiences to be built up.
 *
 * @remarks
 *
 * Mentions have the following features
 * - An activation character you define.
 * - A min number of characters before mentions are suggested
 * - Ability to exclude matching character
 * - Ability to wrap content in a decoration which excludes mentions from being
 *   suggested.
 * - Decorations for in progress mentions
 * - Keybindings for handling arrow keys and other more exotic commands.
 *
 * Please note, there is still a lot of work required in your view layer when
 * creating a mention and it's not at trivial (I found it quite difficult). With
 * remirror I'm hoping to reduce the cognitive strain required to set up
 * mentions in your own editor.
 */
export class MentionExtension extends MarkExtension<MentionSettings, MentionProperties> {
  public static readonly defaultOptions: DefaultExtensionOptions<MentionSettings> = {
    mentionTag: 'a' as const,
    matchers: [],
  };
  public static readonly defaultProperties: Required<MentionProperties> = {
    appendText: ' ',
    suggestTag: 'a' as const,
    onChange: defaultHandler,
    onExit: defaultHandler,
    onCharacterEntry: defaultHandler,
    keyBindings: {},
    noDecorations: false,
  };

  get name() {
    return 'mention' as const;
  }

  public createMarkSpec(): MarkExtensionSpec {
    const dataAttributeId = 'data-mention-id';
    const dataAttributeName = 'data-mention-name';

    return {
      attrs: {
        id: {},
        label: {},
        name: {},
      },
      group: MarkGroup.Behavior,
      excludes: '_',
      inclusive: false,
      parseDOM: [
        {
          tag: `${this.options.mentionTag}[${dataAttributeId}]`,
          getAttrs: (node) => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const name = node.getAttribute(dataAttributeName);
            const label = node.textContent;
            return { id, label, name };
          },
        },
      ],
      toDOM: (node) => {
        const {
          label: _,
          id,
          name,
          replacementType,
          range,
          ...attributes
        } = node.attrs as Required<MentionExtensionAttributes>;
        const matcher = this.options.matchers.find((matcher) => matcher.name === name);

        const mentionClassName = matcher
          ? matcher.mentionClassName ?? DEFAULT_MATCHER.mentionClassName
          : DEFAULT_MATCHER.mentionClassName;

        return [
          this.options.mentionTag,
          {
            ...attributes,
            class: name ? `${mentionClassName} ${mentionClassName}-${name}` : mentionClassName,
            [dataAttributeId]: id,
            [dataAttributeName]: name,
          },
          0,
        ];
      },
    };
  }

  public createCommands = () => {
    return {
      /**
       * Create a new mention
       */
      createMention: this.createMention({ shouldUpdate: false }),

      /**
       * Update an existing mention.
       */
      updateMention: this.createMention({ shouldUpdate: true }),

      /**
       * Remove the mention(s) at the current selection or provided range.
       */
      removeMention: ({ range }: Partial<RangeParameter> = object()) => {
        return convertCommand(removeMark({ type: this.type, expand: true, range }));
      },
    };
  };

  public createPasteRules = () => {
    return this.options.matchers.map((matcher) => {
      const { startOfLine, char, supportedCharacters, name } = {
        ...DEFAULT_MATCHER,
        ...matcher,
      };

      const regexp = new RegExp(
        `(${getRegexPrefix(startOfLine)}${escapeChar(char)}${regexToString(supportedCharacters)})`,
        'g',
      );

      return markPasteRule({
        regexp,
        type: this.type,
        getAttributes: (string) => ({
          id: getMatchString(string.slice(char.length, string.length)),
          label: getMatchString(string),
          name,
        }),
      });
    });
  };

  public createSuggestions = () => {
    return this.options.matchers.map<Suggestion<MentionExtensionSuggestCommand>>((matcher) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const extension = this;

      return {
        ...DEFAULT_MATCHER,
        ...matcher,

        // The following properties are provided as getter so that the
        // prosemirror-suggest plugin always references the latest version of
        // the suggestion. This is not a good idea and should be fixed in a
        // better way soon.
        get noDecorations() {
          return extension.options.noDecorations;
        },

        get suggestTag() {
          return extension.options.suggestTag;
        },

        get onChange() {
          return extension.options.onChange;
        },

        get onExit() {
          return extension.options.onExit;
        },

        get keyBindings() {
          return extension.options.keyBindings;
        },

        get onCharacterEntry() {
          return extension.options.onCharacterEntry;
        },

        createCommand: ({ match, reason, setMarkRemoved }) => {
          const { range, suggester } = match;
          const { name } = suggester;
          const create = this.store.getCommands().createMention;
          const update = this.store.getCommands().updateMention;
          const remove = this.store.getCommands().removeMention;

          const isActive = isMarkActive({
            from: range.from,
            to: range.end,
            type: this.type,
            stateOrTransaction: this.store.getState(),
          });

          const fn = isActive ? update : create;
          const isSplit = isSplitReason(reason);
          const isInvalid = isInvalidSplitReason(reason);
          const isRemoved = isRemovedReason(reason);

          const removeCommand = () => {
            setMarkRemoved();
            try {
              // This might fail when a deletion has taken place.
              isInvalid ? remove({ range }) : noop();
            } catch {
              // This sometimes fails and it's best to ignore until more is
              // known about the impact. Please create an issue if this blocks
              // you in some way.
            }
          };

          const createCommand = ({
            replacementType = isSplit ? 'partial' : 'full',
            id = match.queryText[replacementType],
            label = match.matchText[replacementType],
            appendText,
            ...attributes
          }: SuggestionCommandAttributes) => {
            fn({ id, label, appendText, replacementType, name, range, ...attributes });
          };

          const command: MentionExtensionSuggestCommand =
            isInvalid || isRemoved ? removeCommand : createCommand;

          return command;
        },
      };
    });
  };

  /**
   * The factory method for mention commands to update and create new mentions.
   */
  private createMention({ shouldUpdate }: CreateMentionParameter) {
    return (config: MentionExtensionAttributes) => {
      invariant(isValidMentionAttributes(config), {
        message: 'Invalid configuration attributes passed to the MentionExtension command.',
      });

      const { range, appendText, replacementType, ...attributes } = config;
      let name = attributes.name;

      if (!name) {
        invariant(this.options.matchers.length < 2, {
          code: ErrorConstant.EXTENSION,
          message:
            'The MentionExtension command must specify a name since there are multiple matchers configured',
        });

        name = this.options.matchers[0].name;
      }

      const allowedNames = this.options.matchers.map(({ name }) => name);

      invariant(allowedNames.includes(name), {
        code: ErrorConstant.EXTENSION,
        message: `The name '${name}' specified for this command is invalid. Please choose from: ${JSON.stringify(
          allowedNames,
        )}.`,
      });

      const matcher = getMatcher(name, this.options.matchers);

      invariant(matcher, {
        code: ErrorConstant.EXTENSION,
        message: `Mentions matcher not found for name ${name}.`,
      });

      const { from, to } = range ?? this.store.getState().selection;
      let startTransaction: TransactionTransformer | undefined;

      if (shouldUpdate) {
        // Remove all currently active marks before proceeding.
        startTransaction = (tr, state) => {
          // Remove mark at previous position
          let { oldFrom, oldTo } = { oldFrom: from, oldTo: range ? range.end : to };
          const $oldTo = state.doc.resolve(oldTo);

          ({ from: oldFrom, to: oldTo } = getMarkRange($oldTo, this.type) || {
            from: oldFrom,
            to: oldTo,
          });

          tr.removeMark(oldFrom, oldTo, this.type);
          tr.setMeta('addToHistory', false);

          // Remove mark at current position
          const $newTo = tr.selection.$from;
          const { from: newFrom, to: newTo } = getMarkRange($newTo, this.type) || {
            from: $newTo.pos,
            to: $newTo.pos,
          };

          tr.removeMark(newFrom, newTo, this.type);

          return tr.setMeta('addToHistory', false);
        };
      }

      return convertCommand(
        replaceText({
          type: this.type,
          attrs: { ...attributes, name },
          appendText: getAppendText(appendText, matcher.appendText),
          range: range
            ? { from, to: replacementType === 'full' ? range.end || to : to }
            : undefined,
          content: attributes.label,
          startTransaction,
        }),
      );
    };
  }
}

interface CreateMentionParameter {
  /**
   * Whether the mention command should handle updates.
   */
  shouldUpdate: boolean;
}
