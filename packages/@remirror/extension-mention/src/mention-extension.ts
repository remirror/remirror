import {
  AddCustomHandler,
  ApplySchemaAttributes,
  CommandFunction,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  ErrorConstant,
  getMarkRange,
  getMatchString,
  HandlerKeyList,
  invariant,
  isElementDomNode,
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
  StaticKeyList,
} from '@remirror/core';
import {
  escapeChar,
  getRegexPrefix,
  isInvalidSplitReason,
  isRemovedReason,
  isSelectionExitReason,
  isSplitReason,
  regexToString,
  SuggestCharacterEntryMethod,
  Suggestion,
} from '@remirror/pm/suggest';

import {
  MentionCharacterEntryMethod,
  MentionExtensionAttributes,
  MentionExtensionSuggestCommand,
  MentionKeyBinding,
  MentionOptions,
  SuggestionCommandAttributes,
} from './mention-types';
import {
  DEFAULT_MATCHER,
  getAppendText,
  getMatcher,
  isValidMentionAttributes,
} from './mention-utils';

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
export class MentionExtension extends MarkExtension<MentionOptions> {
  static readonly defaultOptions: DefaultExtensionOptions<MentionOptions> = {
    mentionTag: 'a' as const,
    matchers: [],
    appendText: ' ',
    suggestTag: 'a' as const,
    noDecorations: false,
  };

  static readonly staticKeys: StaticKeyList<MentionOptions> = ['matchers', 'mentionTag'];
  static readonly handlerKeys: HandlerKeyList<MentionOptions> = ['onChange', 'onExit'];
  static readonly customHandlerKeys: CustomHandlerKeyList<MentionOptions> = [
    'keyBindings',
    'onCharacterEntry',
  ];

  get name() {
    return 'mention' as const;
  }

  private characterEntryMethods: Array<
    SuggestCharacterEntryMethod<MentionExtensionSuggestCommand>
  > = [];

  private keyBindingsList: MentionKeyBinding[] = [];

  /**
   * The compiled keybindings.
   */
  private keyBindings: MentionKeyBinding = {};

  protected onAddCustomHandler: AddCustomHandler<MentionOptions> = (parameter) => {
    const { keyBindings, onCharacterEntry } = parameter;

    if (keyBindings) {
      this.keyBindingsList = [...this.keyBindingsList, keyBindings];
      this.updateKeyBindings();

      return () => {
        this.keyBindingsList = this.keyBindingsList.filter((binding) => binding !== keyBindings);
        this.updateKeyBindings();
      };
    }

    if (onCharacterEntry) {
      this.characterEntryMethods = [...this.characterEntryMethods, onCharacterEntry];

      return () => {
        this.characterEntryMethods = this.characterEntryMethods.filter(
          (method) => method !== onCharacterEntry,
        );
      };
    }

    return;
  };

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    const dataAttributeId = 'data-mention-id';
    const dataAttributeName = 'data-mention-name';

    return {
      attrs: {
        ...extra.defaults(),
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
            if (!isElementDomNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const name = node.getAttribute(dataAttributeName);
            const label = node.textContent;
            return { ...extra.parse(node), id, label, name };
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
            ...extra.dom(node),
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

  createCommands = () => {
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
      removeMention: ({ range }: Partial<RangeParameter> = object()) =>
        removeMark({ type: this.type, expand: true, range }),
    };
  };

  createPasteRules = () => {
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

  createSuggestions = () => {
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

        keyBindings: () => this.keyBindings,
        onCharacterEntry: this.onCharacterEntry,
        onChange: this.options.onChange,
        onExit: this.options.onExit,

        createCommand: ({ match, reason, setMarkRemoved }) => {
          const { range, suggester } = match;
          const { name } = suggester;
          const createMention = this.store.getCommands().createMention;
          const updateMention = this.store.getCommands().updateMention;
          const removeMention = this.store.getCommands().removeMention;
          const isActive = isMarkActive({
            from: range.from,
            to: range.end,
            type: this.type,
            stateOrTransaction: this.store.getState(),
          });

          const method = isActive ? updateMention : createMention;
          const isSplit = isSplitReason(reason);
          const isInvalid = isInvalidSplitReason(reason);
          const isRemoved = isRemovedReason(reason);
          const isSelectionExit = isSelectionExitReason(reason);

          const remove = () => {
            setMarkRemoved();

            try {
              // This might fail when a deletion has taken place.
              isInvalid ? removeMention({ range }) : noop();
            } catch {
              // This sometimes fails and it's best to ignore until more is
              // known about the impact. Please create an issue if this blocks
              // you in some way.
            }
          };

          const update = ({
            replacementType = isSplit ? 'partial' : 'full',
            id = match.queryText[replacementType],
            label = match.matchText[replacementType],
            appendText = this.options.appendText,
            ...attributes
          }: SuggestionCommandAttributes) => {
            method({
              id,
              label,
              appendText,
              replacementType,
              name,
              range,
              keepSelection: isSelectionExit,
              ...attributes,
            });
          };

          const command: MentionExtensionSuggestCommand = isInvalid || isRemoved ? remove : update;

          return command;
        },
      };
    });
  };

  /**
   * The factory method for mention commands to update and create new mentions.
   */
  private createMention({ shouldUpdate }: CreateMentionParameter) {
    return (config: MentionExtensionAttributes & { keepSelection?: boolean }): CommandFunction => {
      invariant(isValidMentionAttributes(config), {
        message: 'Invalid configuration attributes passed to the MentionExtension command.',
      });

      const { range, appendText, replacementType, keepSelection, ...attributes } = config;
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

      return (parameter) => {
        const { tr } = parameter;
        const { from, to } = range ?? tr.selection;

        if (shouldUpdate) {
          // Remove mark at previous position
          let { oldFrom, oldTo } = { oldFrom: from, oldTo: range ? range.end : to };
          const $oldTo = tr.doc.resolve(oldTo);

          ({ from: oldFrom, to: oldTo } = getMarkRange($oldTo, this.type) || {
            from: oldFrom,
            to: oldTo,
          });

          tr.removeMark(oldFrom, oldTo, this.type).setMeta('addToHistory', false);

          // Remove mark at current position
          const $newTo = tr.selection.$from;
          const { from: newFrom, to: newTo } = getMarkRange($newTo, this.type) || {
            from: $newTo.pos,
            to: $newTo.pos,
          };

          tr.removeMark(newFrom, newTo, this.type).setMeta('addToHistory', false);
        }

        return replaceText({
          keepSelection,
          type: this.type,
          attrs: { ...attributes, name },
          appendText: getAppendText(appendText, matcher.appendText),
          range: range
            ? { from, to: replacementType === 'full' ? range.end || to : to }
            : undefined,
          content: attributes.label,
        })(parameter);
      };
    };
  }

  /**
   * Create the `onCharacterEntry` method.
   */
  private readonly onCharacterEntry = (
    parameter: Parameters<MentionCharacterEntryMethod>[0],
  ): boolean => {
    for (const method of this.characterEntryMethods) {
      if (method(parameter)) {
        return true;
      }
    }

    return false;
  };

  /**
   * For now a dumb merge for the key binding command. Later entries are given priority over earlier entries.
   */
  private updateKeyBindings() {
    let newBindings: MentionKeyBinding = object();

    for (const binding of this.keyBindingsList) {
      newBindings = { ...newBindings, ...binding };
    }

    this.keyBindings = newBindings;
  }
}

interface CreateMentionParameter {
  /**
   * Whether the mention command should handle updates.
   */
  shouldUpdate: boolean;
}
