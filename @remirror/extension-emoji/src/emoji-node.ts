import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  replaceText,
  SchemaNodeTypeParams,
  SchemaParams,
} from '@remirror/core';

export interface EmojiNodeExtensionOptions {
  extraAttrs?: Array<string | [string, unknown]>;
}

export class EmojiNode extends NodeExtension<EmojiNodeExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    const { type } = this.options;
    return `Emojis${type ? `${startCase(type)}` : ''}`;
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
      appendText: ' ',
      EmojiClassName: 'Emoji',
      extraAttrs: [],
      tag: 'a' as 'a',
      editable: true,
      selectable: true,
    };
  }

  /**
   * Add the attributes provided in the extraAttrs option to the accepted properties for the Emojis node.
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
      EmojiClassName = this.defaultOptions.EmojiClassName,
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
            class: EmojiClassName,
            'data-Emoji-id': id,
          },
          `${matcher.char}${label}`,
        ];
      },
      parseDOM: [
        {
          tag: `${this.options.tag}[data-Emoji-id]`,
          getAttrs: dom => {
            if (typeof dom === 'string') {
              return false; // string only received when type is a style
            }

            const id = (dom as Element).getAttribute('data-Emoji-id');
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
    return [];
  }
}
