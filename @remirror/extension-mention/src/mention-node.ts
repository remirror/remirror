import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  Omit,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { startCase } from 'lodash';
import { createSuggestionsPlugin, defaultMatcher, SuggestionsPluginProps } from './create-suggestions-plugin';

export interface MentionNodeExtensionOptions
  extends Omit<SuggestionsPluginProps, 'command' | 'decorationsTag'>,
    NodeExtensionOptions {
  mentionClassName?: string;
  /**
   * Allows for multiple mentions extensions to be registered for one editor.
   * The name becomes mention_${type}. If left blank then no type is used.
   */
  type?: string;
  readonly tag?: keyof HTMLElementTagNameMap;
  editable?: boolean;
  selectable?: boolean;
}

export class MentionNode extends NodeExtension<MentionNodeExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    const { type } = this.options;
    return `mentions${type ? `${startCase(type)}` : ''}`;
  }

  /**
   * Provide the default options for this extension
   */
  get defaultOptions() {
    return {
      matcher: defaultMatcher,
      appendText: ' ',
      mentionClassName: 'mention',
      extraAttrs: [],
      tag: 'a' as 'a',
      editable: true,
      selectable: true,
    };
  }

  protected init() {
    super.init();
    this.options.suggestionClassName = `suggestion suggestion-${this.options.type}`;
  }

  get schema(): NodeExtensionSpec {
    const {
      mentionClassName = this.defaultOptions.mentionClassName,
      matcher = this.defaultOptions.matcher,
    } = this.options;
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
      toDOM: node => {
        console.log('inside mention node');
        const { id, label, ...attrs } = node.attrs;
        return [
          this.options.tag,
          {
            ...attrs,
            class: mentionClassName,
            'data-mention-id': id,
          },
          `${label}`,
        ];
      },
      parseDOM: [
        {
          tag: `${this.options.tag}[data-mention-id]`,
          getAttrs: dom => {
            if (typeof dom === 'string') {
              return false; // string only received when type is a style
            }

            const id = (dom as Element).getAttribute('data-mention-id');
            const label = (dom as HTMLElement).innerText.split(matcher.char).join('');
            return { id, label };
          },
        },
      ],
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs =>
    replaceText(null, type, attrs);

  public plugin({ type }: SchemaNodeTypeParams) {
    return createSuggestionsPlugin({
      key: this.pluginKey,
      command: ({ range, attrs }) => replaceText(range, type, attrs),
      appendText: this.options.appendText,
      matcher: this.options.matcher,
      onEnter: this.options.onEnter,
      onChange: this.options.onChange,
      onExit: this.options.onExit,
      onKeyDown: this.options.onKeyDown,
      suggestionClassName: this.options.suggestionClassName,
      decorationsTag: this.options.tag,
    });
  }
}
