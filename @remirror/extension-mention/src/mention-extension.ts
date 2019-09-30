import {
  Attrs,
  CommandMarkTypeParams,
  EditorState,
  ExtensionManagerMarkTypeParams,
  getMarkRange,
  getMatchString,
  isElementDOMNode,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markPasteRule,
  MarkType,
  RangeParams,
  removeMark,
  replaceText,
  TransactionTransformer,
  noop,
  isMarkActive,
} from '@remirror/core';
import {
  MentionExtensionOptions,
  SuggestionCommandAttrs,
  MentionExtensionSuggestCommand,
} from './mention-types';
import { DEFAULT_MATCHER, isValidMentionAttrs, getMatcher, getAppendText } from './mention-utils';
import {
  Suggester,
  isSplitReason,
  isInvalidSplitReason,
  isRemovedReason,
  getRegexPrefix,
  escapeChar,
  regexToString,
} from 'prosemirror-suggest';

const defaultHandler = () => false;

/**
 * The mention extension manages suggestions through onChange, onKeyDown, onExit and onEnter callbacks.
 * It also allows for configuration options to be passed into transforming suggestion queries into a mention
 * node.
 */
export class MentionExtension extends MarkExtension<MentionExtensionOptions> {
  get name() {
    return 'mention' as const;
  }

  /**
   * Provide the default options for this extension
   */
  get defaultOptions() {
    return {
      matchers: [],
      appendText: ' ',
      mentionClassName: 'mention',
      extraAttrs: [],
      mentionTag: 'a' as 'a',
      suggestTag: 'a' as 'a',
      onChange: defaultHandler,
      onExit: defaultHandler,
      onCharacterEntry: defaultHandler,
      keyBindings: {},
    };
  }

  get schema(): MarkExtensionSpec {
    const dataAttributeId = 'data-mention-id';
    const dataAttributeName = 'data-mention-name';
    return {
      attrs: {
        id: {},
        label: {},
        name: {},
        ...this.extraAttrs(),
      },
      group: MarkGroup.Behavior,
      excludes: '_',
      inclusive: false,
      parseDOM: [
        {
          tag: `${this.options.mentionTag}[${dataAttributeId}]`,
          getAttrs: node => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const name = node.getAttribute(dataAttributeName);
            const label = node.innerText;
            return { id, label, name };
          },
        },
      ],
      toDOM: node => {
        const { label: _, id, name, ...attrs } = node.attrs;
        const matcher = this.options.matchers.find(matcher => matcher.name === name);
        const mentionClassName = matcher
          ? matcher.mentionClassName || DEFAULT_MATCHER.mentionClassName
          : DEFAULT_MATCHER.mentionClassName;

        return [
          this.options.mentionTag,
          {
            ...attrs,
            class: name ? `${mentionClassName} ${mentionClassName}-${name}` : mentionClassName,
            [dataAttributeId]: id,
            [dataAttributeName]: name,
          },
          0,
        ];
      },
    };
  }

  /**
   * A function for creating the mention for the first time.
   */
  private readonly createMention = (type: MarkType, getState: () => EditorState, shouldUpdate = false) => (
    config?: Attrs,
  ) => {
    if (!isValidMentionAttrs(config)) {
      throw new Error('Invalid configuration attributes passed to the MentionExtension command.');
    }

    const { range, appendText, replacementType, ...attrs } = config;
    let name = attrs.name;
    if (!name) {
      if (this.options.matchers.length >= 2) {
        throw new Error(
          'The MentionExtension command must specify a name since there are multiple matchers configured',
        );
      }

      name = this.options.matchers[0].name;
    }

    const allowedNames = this.options.matchers.map(({ name }) => name);
    if (!allowedNames.includes(name)) {
      throw new Error(
        `The name '${name}' specified for this command is invalid. Please choose from: ${JSON.stringify(
          allowedNames,
        )}.`,
      );
    }

    const matcher = getMatcher(name, this.options.matchers);

    if (!matcher) {
      throw new Error(`Mentions matcher not found for name ${name}.`);
    }

    const { from, to } = range || getState().selection;

    let startTransaction: TransactionTransformer | undefined;

    if (shouldUpdate) {
      // Remove all currently active marks before proceeding.
      startTransaction = (tr, state) => {
        // Remove mark at previous position
        let { oldFrom, oldTo } = { oldFrom: from, oldTo: range ? range.end : to };
        const $oldTo = state.doc.resolve(oldTo);
        ({ from: oldFrom, to: oldTo } = getMarkRange($oldTo, type) || { from: oldFrom, to: oldTo });
        tr.removeMark(oldFrom, oldTo, type);
        tr.setMeta('addToHistory', false);

        // Remove mark at current position
        const $newTo = tr.selection.$from;
        const { from: newFrom, to: newTo } = getMarkRange($newTo, type) || {
          from: $newTo.pos,
          to: $newTo.pos,
        };
        tr.removeMark(newFrom, newTo, type);
        return tr.setMeta('addToHistory', false);
      };
    }

    return replaceText({
      type,
      attrs: { ...attrs, name },
      appendText: getAppendText(appendText, matcher.appendText),
      range: range ? { from, to: replacementType === 'full' ? range.end || to : to } : undefined,
      content: attrs.label,
      startTransaction,
    });
  };

  public commands({ type, getState }: CommandMarkTypeParams) {
    return {
      createMention: this.createMention(type, getState),
      updateMention: this.createMention(type, getState, true),
      removeMention: ({ range }: Partial<RangeParams> = Object.create(null)) => {
        return removeMark({ type, expand: true, range });
      },
    };
  }

  public pasteRules({ type }: ExtensionManagerMarkTypeParams) {
    return this.options.matchers.map(matcher => {
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
        type,
        getAttrs: str => ({
          id: getMatchString(str.slice(char.length, str.length)),
          label: getMatchString(str),
          name,
        }),
      });
    });
  }

  public suggestions({ getActions, type, getState }: ExtensionManagerMarkTypeParams): Suggester[] {
    const {
      matchers,
      onChange,
      onExit,
      noDecorations,
      keyBindings,
      onCharacterEntry,
      suggestTag,
    } = this.options;
    return matchers.map<Suggester<MentionExtensionSuggestCommand>>(matcher => {
      return {
        ...DEFAULT_MATCHER,
        ...matcher,
        noDecorations,
        suggestTag,
        onChange,
        onExit,
        keyBindings,
        onCharacterEntry,
        createCommand: ({ match, reason, setMarkRemoved }) => {
          const {
            suggester: { name },
            range,
          } = match;
          const create = getActions('createMention');
          const update = getActions('updateMention');
          const remove = getActions('removeMention');
          const isActive = isMarkActive({
            from: match.range.from,
            to: match.range.end,
            type: type,

            state: getState(),
          });

          const fn = isActive ? update : create;
          const isSplit = isSplitReason(reason);
          const isInvalid = isInvalidSplitReason(reason);
          const isRemoved = isRemovedReason(reason);

          const removeCommand = () => {
            setMarkRemoved();
            try {
              // This might fail when a deletion has taken place.
              isInvalid ? remove({ range: match.range }) : noop();
            } catch {
              // This sometimes fails and it's best to ignore until more is
              // known about the impact.
            }
          };

          const createCommand = ({
            replacementType = isSplit ? 'partial' : 'full',
            id = match.queryText[replacementType],
            label = match.matchText[replacementType],
            appendText,
            ...attrs
          }: SuggestionCommandAttrs) => {
            fn({ id, label, appendText, replacementType, name, range, ...attrs });
          };

          const command: MentionExtensionSuggestCommand =
            isInvalid || isRemoved ? removeCommand : createCommand;

          return command;
        },
      };
    });
  }
}
