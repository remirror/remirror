import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  Omit,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { createSuggestionsPlugin, defaultMatcher, SuggestionsPluginProps } from './plugin';

export interface MentionOptions<GName extends string>
  extends Omit<SuggestionsPluginProps, 'command' | 'decorationsTag'>,
    NodeExtensionOptions {
  /**
   * Allows for multiple mentions extensions to be registered for one editor.
   *
   * The name must begin with 'mention' so as not to pollute the namespaces.
   */
  name: GName;
  mentionClassName?: string;
  readonly tag?: keyof HTMLElementTagNameMap;
  editable?: boolean;
  selectable?: boolean;
}

export class Mention<GName extends string> extends NodeExtension<MentionOptions<GName>> {
  /**
   * The name is dynamically generated based on the passed in type.
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
   */
  get defaultOptions() {
    return {
      matcher: defaultMatcher,
      appendText: ' ',
      mentionClassName: 'mention',
      extraAttrs: [],
      tag: 'a' as 'a',
      editable: true,
      selectable: false,
    };
  }

  protected init() {
    super.init();
    this.options.suggestionClassName = `suggestion suggestion-${this.options.name}`;
  }

  get schema(): NodeExtensionSpec {
    const {
      name,
      mentionClassName = this.defaultOptions.mentionClassName,
      matcher = this.defaultOptions.matcher,
    } = this.options;
    const mentionClass = `${mentionClassName} ${mentionClassName}-${name}`;
    const dataAttribute = `data-mention-${name.replace('mention', '').toLowerCase()}-id`;
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
            if (typeof dom === 'string') {
              return false; // string only received when type is a style
            }

            const id = (dom as Element).getAttribute(dataAttribute);
            const label = (dom as HTMLElement).innerText.split(matcher.char).join('');
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

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs =>
    replaceText(null, type, attrs);

  public plugin({ type }: SchemaNodeTypeParams) {
    return createSuggestionsPlugin({
      key: this.pluginKey,
      command: ({ range, attrs, appendText }) => replaceText(range, type, attrs, appendText),
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
