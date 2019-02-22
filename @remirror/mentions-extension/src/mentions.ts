import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  replaceText,
  SchemaParams,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { startCase } from 'lodash';
import { SuggestionsPlugin, SuggestionsPluginProps } from './suggestions';

export interface MentionsNodeExtensionOptions extends SuggestionsPluginProps {
  mentionClassName?: string;
  /**
   * Allows for multiple mentions extensions to be registered for one editor.
   * The name becomes mention_${type}. If left blank then no type is used.
   */
  type?: string;
  tag?: keyof HTMLElementTagNameMap;
  editable?: boolean;
  selectable?: boolean;
}

export class Mentions extends NodeExtension<MentionsNodeExtensionOptions> {
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
      tag: 'a' as 'a',
      editable: true,
      selectable: true,
    };
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
      },
      group: 'inline',
      inline: true,
      selectable: this.options.selectable,
      atom: !this.options.editable,
      toDOM: node => [
        this.options.tag,
        {
          class: mentionClassName,
          'data-mention-id': node.attrs.id,
        },
        `${matcher.char}${node.attrs.label}`,
      ],
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
        suggestionsClassName: this.options.suggestionsClassName,
      }),
    ];
  }
}
