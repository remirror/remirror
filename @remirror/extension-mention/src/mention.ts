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
export class Mention extends NodeExtension<MentionOptions> {
  /**
   * The name is dynamically generated based on the passed in name.
   * It must start with 'mention'
   *
   * @readonly
   */
  get name(): 'mention' {
    return 'mention';
  }

  /**
   * Provide the default options for this extension
   *
   * @readonly
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

  get schema(): NodeExtensionSpec {
    const dataAttribute = 'data-mention-id';
    const { mentionClassName } = this.options;
    return {
      attrs: {
        id: {},
        label: {},
        name: { default: DEFAULT_MATCHER.name },
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
        const { id, label, name, ...attrs } = node.attrs;
        return [
          this.options.tag,
          {
            ...attrs,
            class: name ? `${mentionClassName} ${mentionClassName}-${name}` : mentionClassName,
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

  public plugin(): Plugin<SuggestionState> {
    return createSuggestionsPlugin(this);
  }
}
