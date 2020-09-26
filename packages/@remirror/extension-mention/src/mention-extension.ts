import {
  ApplySchemaAttributes,
  bool,
  CommandFunction,
  ErrorConstant,
  extensionDecorator,
  ExtensionTag,
  FromToParameter,
  getMarkRange,
  getMatchString,
  Handler,
  InputRulesExtension,
  invariant,
  isElementDomNode,
  isMarkActive,
  isPlainObject,
  isString,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkAttributes,
  MarkExtension,
  MarkExtensionSpec,
  markPasteRule,
  pick,
  ProsemirrorAttributes,
  ProsemirrorPlugin,
  RangeParameter,
  removeMark,
  replaceText,
  ShouldSkipParameter,
  Static,
} from '@remirror/core';
import {
  createRegexFromSuggester,
  DEFAULT_SUGGESTER,
  isInvalidSplitReason,
  isRemovedReason,
  isSelectionExitReason,
  isSplitReason,
  MatchValue,
  RangeWithCursor,
  SuggestChangeHandlerParameter,
  Suggester,
} from '@remirror/pm/suggest';

/**
 * The static settings passed into a mention
 */
export interface MentionOptions
  extends Pick<
    Suggester,
    | 'invalidNodes'
    | 'validNodes'
    | 'invalidMarks'
    | 'validMarks'
    | 'isValidPosition'
    | 'disableDecorations'
  > {
  /**
   * Provide a custom tag for the mention
   */
  mentionTag?: Static<string>;

  /**
   * Provide the custom matchers that will be used to match mention text in the
   * editor.
   */
  matchers: Static<MentionExtensionMatcher[]>;

  /**
   * Text to append after the mention has been added.
   *
   * **NOTE**: If you're using whitespace characters but it doesn't seem to work
   * for you make sure you're using the css provided in `@remirror/styles`.
   *
   * The `white-space: pre-wrap;` is what allows editors to add space characters
   * at the end of a section.
   *
   * @default ''
   */
  appendText?: string;

  /**
   * Tag for the prosemirror decoration which wraps an active match.
   *
   * @default 'span'
   */
  suggestTag?: string;

  /**
   * Called whenever a suggestion becomes active or changes in any way.
   *
   * @remarks
   *
   * It receives a parameters object with the `reason` for the change for more
   * granular control.
   *
   * The second parameter is a function that can be called to handle exits
   * automatically. This is useful if you're mention can be any possible value,
   * e.g. a `#hashtag`. Call it with the optional attributes to automatically
   * create a mention.
   *
   * @default () => void
   */
  onChange?: Handler<MentionChangeHandler>;

  /**
   * A predicate check for whether the mention is valid. It proves the mention
   * mark and it's attributes as well as the text it contains.
   *
   * This is used for checking that a recent update to the document hasn't made
   * a mention invalid.
   *
   * For example a mention for `@valid` => `valid` would be considered
   * invalidating. Return false to remove the mention.
   *
   * @param attrs - the attrs for the mention
   * @param text - the text which is wrapped by the mention
   */
  isMentionValid?: (attrs: NamedMentionExtensionAttributes, text: string) => boolean;
}

/**
 * The mention extension wraps mentions as a prosemirror mark. It allows for
 * fluid social experiences to be built. The implementation was inspired by the
 * way twitter and similar social sites allows mentions to be edited after
 * they've been created.
 *
 * @remarks
 *
 * Mentions have the following features
 * - An activation character or regex pattern which you define.
 * - A min number of characters before mentions are suggested
 * - Ability to exclude matching character.
 * - Ability to wrap content in a decoration which excludes mentions from being
 *   suggested.
 * - Decorations for in-progress mentions
 */
@extensionDecorator<MentionOptions>({
  defaultOptions: {
    mentionTag: 'a' as const,
    matchers: [],
    appendText: '',
    suggestTag: 'a' as const,
    disableDecorations: false,
    invalidMarks: [],
    invalidNodes: [],
    isValidPosition: () => true,
    validMarks: null,
    validNodes: null,
    isMentionValid: isMentionValidDefault,
  },
  handlerKeys: ['onChange'],
  staticKeys: ['matchers', 'mentionTag'],
})
export class MentionExtension extends MarkExtension<MentionOptions> {
  get name() {
    return 'mention' as const;
  }

  /**
   * Tag this as a behavior influencing mark.
   */
  readonly tags = [ExtensionTag.Behavior, ExtensionTag.ExcludeInputRules];

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
      excludes: '_',
      inclusive: false,
      parseDOM: [
        {
          tag: `${this.options.mentionTag}[${dataAttributeId}]`,
          getAttrs: (element) => {
            if (!isElementDomNode(element)) {
              return false;
            }

            const id = element.getAttribute(dataAttributeId);
            const name = element.getAttribute(dataAttributeName);
            const label = element.textContent;
            return { ...extra.parse(element), id, label, name };
          },
        },
      ],
      toDOM: (mark) => {
        const {
          label: _,
          id,
          name,
          replacementType,
          range,
          ...attributes
        } = mark.attrs as Required<NamedMentionExtensionAttributes>;
        const matcher = this.options.matchers.find((matcher) => matcher.name === name);

        const mentionClassName = matcher
          ? matcher.mentionClassName ?? DEFAULT_MATCHER.mentionClassName
          : DEFAULT_MATCHER.mentionClassName;

        return [
          this.options.mentionTag,
          {
            ...extra.dom(mark),
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

  onCreate(): void {
    // Add the `shouldSkip` predicate check to this extension.
    this.store
      .getExtension(InputRulesExtension)
      .addHandler('shouldSkipInputRule', this.shouldSkipInputRule.bind(this));
  }

  private shouldSkipInputRule(parameter: ShouldSkipParameter) {
    const { ruleType, state, end, start } = parameter;

    if (ruleType === 'node') {
      return false;
    }

    if (
      // Check if the mark for this mention is active anywhere in the captured
      // input rule group.
      isMarkActive({ trState: state, type: this.type, from: start, to: end }) ||
      // Check whether the suggester is active and it's name is one of the
      // registered matchers.
      this.isMatcherActive(start, end)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check whether the mark is active within the provided start and end range.
   */
  private isMatcherActive(start: number, end: number): boolean {
    const suggestState = this.store.helpers.getSuggestState();
    const names = new Set(this.options.matchers.map(({ name }) => name));
    const activeName = suggestState.match?.suggester.name;

    return (
      this.options.matchers.some((matcher) => activeName === matcher.name) ||
      suggestState.decorationSet.find(start, end, ({ name }) => names.has(name)).length > 0
    );
  }

  createCommands() {
    const commands = {
      /**
       * This is the command which can be called from the `onChange` handler to
       * automatically handle exits for you. It decides whether a mention should
       * be updated, removed or created and also handles invalid splits.
       *
       * It does nothing for changes and only acts when an exit occurred.
       *
       * @param handler - the parameter that was passed through to the
       * `onChange` handler.
       * @param attrs - the options which set the values that will be used (in
       * case you want to override the defaults).
       */
      mentionExitHandler: (
        handler: SuggestChangeHandlerParameter,
        attrs: MentionChangeHandlerCommandAttributes = {},
      ): CommandFunction => (parameter) => {
        const reason = handler.exitReason ?? handler.changeReason;

        // Get boolean flags of the reason for this exit.
        const isInvalid = isInvalidSplitReason(reason);
        const isRemoved = isRemovedReason(reason);

        if (isInvalid || isRemoved) {
          handler.setMarkRemoved();

          try {
            // This might fail when a deletion has taken place.
            return isInvalid && commands.removeMention({ range: handler.range })(parameter);
          } catch {
            // This happens when removing the mention failed. If you select the
            // whole document and delete while there are mentions active then
            // this catch block will activate. It's not harmful, just prevents
            // you seeing `RangeError: Position X out of range`. I'll leave it
            // like this until more is known about the impact. Please create an
            // issue if this blocks you in some way.
            //
            // TODO test if this still fails.
            return true;
          }
        }

        const { tr } = parameter;
        const { range, text, query, name } = handler;
        const { from, to } = range;

        // Check whether the mention marks is currently active at the provided
        // for the command.
        const isActive = isMarkActive({ from, to, type: this.type, trState: tr });

        // Use the correct command, either update when currently active or
        // create when not active.
        const command = isActive ? commands.updateMention : commands.createMention;

        // Destructure the `attrs` and using the defaults.
        const {
          replacementType = isSplitReason(reason) ? 'partial' : 'full',
          id = query[replacementType],
          label = text[replacementType],
          appendText = this.options.appendText,
          ...rest
        } = attrs;

        // Make sure to preserve the selection, if the reason for the exit was a
        // cursor movement and not due to text being added to the document.
        const keepSelection = isSelectionExitReason(reason);

        return command({
          name,
          id,
          label,
          appendText,
          replacementType,
          range,
          keepSelection,
          ...rest,
        })(parameter);
      },
      /**
       * Create a new mention
       */
      createMention: (
        config: NamedMentionExtensionAttributes & KeepSelectionParameter,
      ): CommandFunction => this.createMention(false)(config),

      /**
       * Update an existing mention.
       */
      updateMention: (
        config: NamedMentionExtensionAttributes & KeepSelectionParameter,
      ): CommandFunction => this.createMention(true)(config),

      /**
       * Remove the mention(s) at the current selection or provided range.
       */
      removeMention: ({ range }: Partial<RangeParameter> = {}): CommandFunction => {
        const value = removeMark({ type: this.type, expand: true, range });

        return value;
      },
    };

    return commands;
  }

  /**
   * Manages the paste rules for the mention.
   *
   * It creates regex tests for each of the configured matchers.
   */
  createPasteRules(): ProsemirrorPlugin[] {
    return this.options.matchers.map((matcher) => {
      const { startOfLine, char, supportedCharacters, name, matchOffset } = {
        ...DEFAULT_MATCHER,
        ...matcher,
      };

      const regexp = new RegExp(
        `(${
          createRegexFromSuggester({
            char,
            matchOffset,
            startOfLine,
            supportedCharacters,
            captureChar: true,
            caseInsensitive: false,
            multiline: false,
          }).source
        })`,
        'g',
      );

      return markPasteRule({
        regexp,
        type: this.type,
        getAttributes: (string) => ({
          id: getMatchString(string.slice(string[2].length, string.length)),
          label: getMatchString(string),
          name,
        }),
      });
    });
  }

  /**
   * Create the suggesters from the matchers that were passed into the editor.
   */
  createSuggesters(): Suggester[] {
    let cachedRange: FromToParameter | undefined;

    const options = pick(this.options, [
      'invalidMarks',
      'invalidNodes',
      'isValidPosition',
      'validMarks',
      'validNodes',
      'suggestTag',
      'disableDecorations',
    ]);

    return this.options.matchers.map<Suggester>((matcher) => {
      return {
        ...DEFAULT_MATCHER,
        ...options,
        ...matcher,
        onChange: (parameter) => {
          const { mentionExitHandler } = this.store.commands;

          function command(attrs: MentionChangeHandlerCommandAttributes = {}) {
            mentionExitHandler(parameter, attrs);
          }

          this.options.onChange(parameter, command);
        },
        checkNextValidSelection: ($pos, tr) => {
          const range = getMarkRange($pos, this.type);

          if (!range || (range.from === cachedRange?.from && range.to === cachedRange?.to)) {
            return;
          }

          const text = $pos.doc.textBetween(
            range.from,
            range.to,
            LEAF_NODE_REPLACING_CHARACTER,
            ' ',
          );

          const isValidMention =
            isValidMentionAttributes(range.mark.attrs) &&
            this.options.isMentionValid(range.mark.attrs, text);

          if (isValidMention) {
            return;
          }

          // Cache the range value to avoid duplicating the update and preventing
          // the history plugin from working.
          cachedRange = range;

          // Remove the mention since it is not valid
          this.store.chain.custom(tr).removeMention({ range }).restore();
        },
      };
    });
  }

  /**
   * The factory method for mention commands to update and create new mentions.
   */
  private createMention(shouldUpdate: boolean) {
    return (config: NamedMentionExtensionAttributes & KeepSelectionParameter): CommandFunction => {
      invariant(isValidMentionAttributes(config), {
        code: ErrorConstant.EXTENSION,
        message: 'Invalid configuration attributes passed to the MentionExtension command.',
      });

      const { range, appendText, replacementType, keepSelection, name, ...attributes } = config;

      const allowedNames = this.options.matchers.map(({ name }) => name);
      const matcher = getMatcher(name, this.options.matchers);

      invariant(allowedNames.includes(name) && matcher, {
        code: ErrorConstant.EXTENSION,
        message: `The name '${name}' specified for this command is invalid. Please choose from: ${JSON.stringify(
          allowedNames,
        )}.`,
      });

      return (parameter) => {
        const { tr } = parameter;
        const { from, to } = {
          from: range?.from ?? tr.selection.from,
          to: range?.cursor ?? tr.selection.to,
        };

        if (shouldUpdate) {
          // Remove mark at previous position
          let { oldFrom, oldTo } = { oldFrom: from, oldTo: range ? range.to : to };
          const $oldTo = tr.doc.resolve(oldTo);

          ({ from: oldFrom, to: oldTo } = getMarkRange($oldTo, this.type) ?? {
            from: oldFrom,
            to: oldTo,
          });

          tr.removeMark(oldFrom, oldTo, this.type).setMeta('addToHistory', false);

          // Remove mark at current position
          const $newTo = tr.selection.$from;
          const { from: newFrom, to: newTo } = getMarkRange($newTo, this.type) ?? {
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
          range: range ? { from, to: replacementType === 'full' ? range.to || to : to } : undefined,
          content: attributes.label,
        })(parameter);
      };
    };
  }
}

export interface OptionalMentionExtensionParameter {
  /**
   * The text to append to the replacement.
   *
   * @default ''
   */
  appendText?: string;

  /**
   * The range of the requested selection.
   */
  range?: RangeWithCursor;

  /**
   * Whether to replace the whole match (`full`) or just the part up until the
   * cursor (`partial`).
   */
  replacementType?: keyof MatchValue;
}

interface KeepSelectionParameter {
  /**
   * Whether to preserve the original selection after the replacement has
   * occurred.
   */
  keepSelection?: boolean;
}

/**
 * The attrs that will be added to the node. ID and label are plucked and used
 * while attributes like href and role can be assigned as desired.
 */
export type MentionExtensionAttributes = MarkAttributes<
  OptionalMentionExtensionParameter & {
    /**
     * A unique identifier for the suggesters node
     */
    id: string;

    /**
     * The text to be placed within the suggesters node
     */
    label: string;
  }
>;

export type NamedMentionExtensionAttributes = MarkAttributes<
  OptionalMentionExtensionParameter & {
    /**
     * A unique identifier for the suggesters node
     */
    id: string;

    /**
     * The text to be placed within the suggesters node
     */
    label: string;
  } & {
    /**
     * The identifying name for the active matcher. This is stored as an
     * attribute on the HTML that will be produced
     */
    name: string;
  }
>;

/**
 * The options for the matchers which can be created by this extension.
 */
export interface MentionExtensionMatcher
  extends Pick<
    Suggester,
    | 'char'
    | 'name'
    | 'startOfLine'
    | 'supportedCharacters'
    | 'validPrefixCharacters'
    | 'invalidPrefixCharacters'
    | 'matchOffset'
    | 'suggestClassName'
  > {
  /**
   * Provide customs class names for the completed mention
   */
  mentionClassName?: string;

  /**
   * Text to append after the suggestion has been added.
   *
   * @default ''
   */
  appendText?: string;
}

export type MentionChangeHandlerCommand = (attrs?: MentionChangeHandlerCommandAttributes) => void;

/**
 * A handler that will be called whenever the the active matchers are updated or
 * exited. The second argument which is the exit command is a function which is
 * only available when the matching suggester has been exited.
 */
export type MentionChangeHandler = (
  handlerState: SuggestChangeHandlerParameter,
  command: (attrs?: MentionChangeHandlerCommandAttributes) => void,
) => void;

/**
 * The dynamic properties used to change the behavior of the mentions created.
 */
export type MentionChangeHandlerCommandAttributes = ProsemirrorAttributes<
  Partial<Pick<MentionExtensionAttributes, 'appendText' | 'replacementType'>> & {
    /**
     * The ID to apply the mention.
     *
     * @default query.full
     */
    id?: string;

    /**
     * The text that is displayed within the mention bounds.
     *
     * @default text.full
     */
    label?: string;
  }
>;

/**
 * The default matcher to use when none is provided in options
 */
const DEFAULT_MATCHER = {
  ...pick(DEFAULT_SUGGESTER, [
    'startOfLine',
    'supportedCharacters',
    'validPrefixCharacters',
    'invalidPrefixCharacters',
    'suggestClassName',
  ]),
  appendText: '',
  matchOffset: 1,
  mentionClassName: 'mention',
};

/**
 * Check that the attributes exist and are valid for the mention update command
 * method.
 */
function isValidMentionAttributes(
  attributes: unknown,
): attributes is NamedMentionExtensionAttributes {
  return bool(
    attributes &&
      isPlainObject(attributes) &&
      attributes.id &&
      isString(attributes.id) &&
      attributes.label &&
      isString(attributes.label) &&
      attributes.name &&
      isString(attributes.name),
  );
}

/**
 * Gets the matcher from the list of matchers if it exists.
 *
 * @param name - the name of the matcher to find
 * @param matchers - the list of matchers to search through
 */
function getMatcher(name: string, matchers: MentionExtensionMatcher[]) {
  const matcher = matchers.find((matcher) => matcher.name === name);
  return matcher ? { ...DEFAULT_MATCHER, ...matcher } : undefined;
}

/**
 * Get the append text value which needs to be handled carefully since it can
 * also be an empty string.
 */
function getAppendText(preferred: string | undefined, fallback: string | undefined) {
  if (isString(preferred)) {
    return preferred;
  }

  if (isString(fallback)) {
    return fallback;
  }

  return DEFAULT_MATCHER.appendText;
}

/**
 * Checks whether the mention is valid and hasn't been edited since being
 * created.
 */
export function isMentionValidDefault(
  attrs: NamedMentionExtensionAttributes,
  text: string,
): boolean {
  return attrs.label === text;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      mention: MentionExtension;
    }
  }
}
