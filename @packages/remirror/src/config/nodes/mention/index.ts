import { ExtensionCommandFunction, NodeExtensionSpec, SchemaParams } from '../../../types';
import { replaceText } from '../../commands';
import { NodeExtension } from '../../utils';
import { SuggestionsPlugin, SuggestionsPluginProps } from './suggestions';

export interface MentionNodeExtensionOptions extends SuggestionsPluginProps {
  mentionClassName?: string;
}

export class Mention extends NodeExtension<MentionNodeExtensionOptions> {
  get name() {
    return 'mention';
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
      mentionClassName: 'mention',
      suggestionsClassName: 'mention-suggestion',
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
      selectable: false,
      atom: true,
      toDOM: node => [
        'span',
        {
          class: mentionClassName,
          'data-mention-id': node.attrs.id,
        },
        `${matcher.char}${node.attrs.label}`,
      ],
      parseDOM: [
        {
          tag: 'span[data-mention-id]',
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

  get plugins() {
    return [
      SuggestionsPlugin({
        command: ({ range, attrs, schema }) => replaceText(range, schema.nodes[this.name], attrs),
        appendText: ' ',
        matcher: this.options.matcher,
        items: this.options.items,
        onEnter: this.options.onEnter,
        onChange: this.options.onChange,
        onExit: this.options.onExit,
        onKeyDown: this.options.onKeyDown,
        suggestionsClassName: this.options.suggestionsClassName,
      }),
    ];
  }
}
