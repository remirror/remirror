import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  Omit,
  replaceText,
  SchemaNodeTypeParams,
  SchemaParams,
} from '@remirror/core';
import { startCase } from 'lodash';
import { SuggestionsPlugin, SuggestionsPluginProps } from './suggestions';

export interface MentionNodeExtensionOptions
  extends Omit<SuggestionsPluginProps, 'command' | 'decorationsTag'> {
  mentionClassName?: string;
  /**
   * Allows for multiple mentions extensions to be registered for one editor.
   * The name becomes mention_${type}. If left blank then no type is used.
   */
  type?: string;
  readonly tag?: keyof HTMLElementTagNameMap;
  editable?: boolean;
  selectable?: boolean;
  /**
   * Inject additional attributes.
   */
  extraAttrs?: Array<string | [string, unknown]>;
}

export class MentionNode extends NodeExtension<MentionNodeExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    const { type } = this.options;
    return `mentions${type ? `${startCase(type)}` : ''}`;
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
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

  /**
   * Add the attributes provided in the extraAttrs option to the accepted properties for the mentions node.
   */
  private extraAttrs() {
    const attrs: Record<string, { default?: unknown }> = {};
    for (const item of this.options.extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: attrs[1] };
      } else {
        attrs[item] = {};
      }
    }
    return attrs;
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
        console.log(node);
        const { id, label, ...attrs } = node.attrs;
        return [
          this.options.tag,
          {
            ...attrs,
            class: mentionClassName,
            'data-mention-id': id,
          },
          `${matcher.char}${label}`,
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

  public commands = ({ schema }: SchemaParams): ExtensionCommandFunction => attrs =>
    replaceText(null, schema.nodes[this.name], attrs);

  public plugins({ type }: SchemaNodeTypeParams) {
    return [
      SuggestionsPlugin({
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
      }),
    ];
  }
}
