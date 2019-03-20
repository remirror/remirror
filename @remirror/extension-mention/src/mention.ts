import {
  ExtensionCommandFunction,
  isString,
  NodeExtension,
  NodeExtensionSpec,
  Plugin,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { createSuggestionsPlugin } from './plugin';
import { SuggestionState } from './state';
import { MentionOptions, SuggestionsCommandParams } from './types';
import { DEFAULT_MATCHER } from './utils';

/**
 * The mention extension manages suggestions through onChange, onKeyDown, onExit and onEnter callbacks.
 * It also allows for configuration options to be passed into transforming suggestion queries into a mention
 * node.
 */
export class Mention<GName extends string> extends NodeExtension<MentionOptions<GName>> {
  /**
   * The name is dynamically generated based on the passed in name.
   * It must start with 'mention'
   *
   * @readonly
   */
  get name(): GName {
    const { name } = this.options;
    if (!name.startsWith('mention')) {
      throw new Error(`The mention plugin must begin start with the word 'mention' and not ${name}`);
    }
    return name;
  }

  /**
   * Provide the default options for this extension
   *
   * @readonly
   */
  get defaultOptions() {
    return {
      matcher: DEFAULT_MATCHER,
      appendText: ' ',
      mentionClassName: 'mention',
      extraAttrs: [],
      tag: 'a' as 'a',
      decorationsTag: 'a' as 'a',
      editable: true,
      selectable: false,
      onEnter: () => false,
      onChange: () => false,
      onExit: () => false,
      onKeyDown: () => false,
      command: ({ range, attrs, appendText, schema }: SuggestionsCommandParams) =>
        replaceText(range, schema.nodes[this.name], attrs, appendText),
    };
  }

  get postFix() {
    return this.options.name.replace('mention', '').toLowerCase();
  }

  protected init() {
    super.init();
    this.options.suggestionClassName = `suggestion suggestion-${this.postFix}`;
  }

  get schema(): NodeExtensionSpec {
    const { mentionClassName = this.defaultOptions.mentionClassName } = this.options;
    const mentionClass = `${mentionClassName} ${mentionClassName}-${this.postFix}`;
    const dataAttribute = `data-mention-${this.postFix}-id`;
    return {
      attrs: {
        id: {},
        label: {},
        ...this.extraAttrs(),
      },
      group: 'inline',
      inline: true,
      selectable: this.options.selectable,
      atom: !this.options.editable,
      parseDOM: [
        {
          tag: `${this.options.tag}[${dataAttribute}]`,
          getAttrs: dom => {
            if (isString(dom)) {
              return false;
            }

            const id = (dom as Element).getAttribute(dataAttribute);
            const label = (dom as HTMLElement).innerText;
            return { id, label };
          },
        },
      ],
      toDOM: node => {
        const { id, label, ...attrs } = node.attrs;
        return [
          this.options.tag,
          {
            ...attrs,
            class: mentionClass,
            [dataAttribute]: id,
          },
          `${label}`,
        ];
      },
    };
  }

  public commands({ type }: SchemaNodeTypeParams): ExtensionCommandFunction {
    return attrs => replaceText(null, type, attrs);
  }

  /**
   * TODO: Implement a past rule using the markPaste rule for inspiration
   * ? Also create a test that uses the Clipboard event api to simulate pasting text
   */
  public pasteRules() {
    return [];
  }

  public plugin(): Plugin<SuggestionState<GName>> {
    return createSuggestionsPlugin(this);
  }
}
