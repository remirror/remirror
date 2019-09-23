import {
  Attrs,
  CommandMarkTypeParams,
  EditorState,
  ExtensionManagerMarkTypeParams,
  getMarkRange,
  getMatchString,
  isElementDOMNode,
  isNullOrUndefined,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markPasteRule,
  MarkType,
  Plugin,
  RangeParams,
  removeMark,
  replaceText,
  TransactionTransformer,
} from '@remirror/core';
import { MentionExtensionOptions } from './mention-types';
import {
  DEFAULT_MATCHER,
  escapeChar,
  getRegexPrefix,
  regexToString,
  isValidMentionAttrs,
} from './mention-utils';
import { createSuggestionPlugin, SuggestionState } from './suggestion-plugin';

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
      matchers: [DEFAULT_MATCHER],
      appendText: ' ',
      mentionClassName: 'mention',
      extraAttrs: [],
      tag: 'a' as 'a',
      decorationsTag: 'a' as 'a',
      suggestionClassName: 'suggestion',
      onChange: defaultHandler,
      onExit: defaultHandler,
      onCharacterEntry: defaultHandler,
      keyBindings: {},
    };
  }

  get schema(): MarkExtensionSpec {
    const dataAttributeId = 'data-mention-id';
    const { mentionClassName } = this.options;
    return {
      attrs: {
        id: {},
        label: {},
        name: { default: DEFAULT_MATCHER.name },
        ...this.extraAttrs(),
      },
      group: MarkGroup.Behavior,
      excludes: '_',
      inclusive: false,
      parseDOM: [
        {
          tag: `${this.options.tag}[${dataAttributeId}]`,
          getAttrs: node => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const label = node.innerText;
            return { id, label };
          },
        },
      ],
      toDOM: node => {
        const { label: _, id, name, ...attrs } = node.attrs;
        return [
          this.options.tag,
          {
            ...attrs,
            class: name ? `${mentionClassName} ${mentionClassName}-${name}` : mentionClassName,
            [dataAttributeId]: id,
          },
          0,
        ];
      },
    };
  }

  /**
   * A function for creating the mention for the first time.
   */
  private createMention = (type: MarkType, getState: () => EditorState, shouldUpdate = false) => (
    config?: Attrs,
  ) => {
    if (!isValidMentionAttrs(config)) {
      throw new Error('Invalid configuration attributes passed to the MentionExtension command.');
    }

    const { range, appendText, replacementType, ...attrs } = config;

    if (!attrs.name && this.options.matchers.length >= 2) {
      throw new Error(
        'The MentionExtension command must specify a name since there are multiple matchers configured',
      );
    }

    const allowedNames = this.options.matchers.map(({ name }) => name);
    if (attrs.name && !allowedNames.includes(attrs.name)) {
      throw new Error(
        `The name '${attrs.name}' specified for this command is invalid. Please choose from: ${JSON.stringify(
          allowedNames,
        )}.`,
      );
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
      attrs,
      appendText: isNullOrUndefined(appendText) ? this.options.appendText : String(appendText),
      range: range ? { from, to: replacementType === 'full' ? range.end || to : to } : undefined,
      content: attrs.label,
      startTransaction,
    });
  };

  public commands({ type, getState }: CommandMarkTypeParams) {
    return {
      createMention: this.createMention(type, getState),
      updateMention: this.createMention(type, getState, true),
      removeMention: ({ range }: Partial<RangeParams> = {}) => {
        return removeMark({ type, expand: true, range });
      },
    };
  }

  public pasteRules({ type }: ExtensionManagerMarkTypeParams) {
    return this.options.matchers.map(matcher => {
      const { startOfLine, char, supportedCharacters } = { ...DEFAULT_MATCHER, ...matcher };
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
        }),
      });
    });
  }

  public plugin(params: ExtensionManagerMarkTypeParams): Plugin<SuggestionState> {
    return createSuggestionPlugin({ extension: this, ...params });
  }
}
