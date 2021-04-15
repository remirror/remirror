import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  isElementDomNode,
  isString,
  joinStyles,
  Mark,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  omitExtraAttributes,
  PrimitiveSelection,
  Static,
} from '@remirror/core';
import { Palette, palette } from '@remirror/extension-text-color';
import { ExtensionTextHighlightMessages as Messages } from '@remirror/messages';

const setTextHighlightOptions: Remirror.CommandDecoratorOptions = {
  icon: 'markPenLine',
  description: ({ t }) => t(Messages.DESCRIPTION),
  label: ({ t }) => t(Messages.LABEL),
};

const TEXT_HIGHLIGHT_ATTRIBUTE = 'data-text-highlight-mark';

/**
 * Add a highlight color to the selected text (or text within a specified
 * range).
 */
@extension<TextHighlightOptions>({
  defaultOptions: {
    defaultHighlight: '',
    palette,
  },
  staticKeys: ['defaultHighlight'],
})
export class TextHighlightExtension extends MarkExtension<TextHighlightOptions> {
  get name() {
    return 'textHighlight' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: {
        ...extra.defaults(),
        highlight: { default: this.options.defaultHighlight },
      },
      parseDOM: [
        {
          tag: `span[${TEXT_HIGHLIGHT_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return;
            }

            const highlight = dom.getAttribute(TEXT_HIGHLIGHT_ATTRIBUTE);

            if (!highlight) {
              return;
            }

            return { ...extra.parse(dom), highlight };
          },
        },
        {
          tag: `span[${TEXT_HIGHLIGHT_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return;
            }

            const highlight = dom.getAttribute(TEXT_HIGHLIGHT_ATTRIBUTE);

            if (!highlight) {
              return;
            }

            return { ...extra.parse(dom), highlight };
          },
        },
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'background-color',
          priority: ExtensionPriority.Low,
          getAttrs: (highlight) => {
            if (!isString(highlight)) {
              return;
            }

            return { highlight };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark: Mark) => {
        const { highlight, ...other } = omitExtraAttributes<TextHighlightAttributes>(
          mark.attrs,
          extra,
        );
        const extraAttrs = extra.dom(mark);
        let style = extraAttrs.style;

        if (highlight) {
          style = joinStyles({ backgroundColor: highlight }, style);
        }

        return [
          'mark',
          { ...other, ...extraAttrs, style, [TEXT_HIGHLIGHT_ATTRIBUTE]: highlight },
          0,
        ];
      },
    };
  }

  /**
   * Set the text highlight color value for the selected text.
   */
  @command(setTextHighlightOptions)
  setTextHighlight(highlight: string, options?: HighlightCommandOptions): CommandFunction {
    return this.store.commands.applyMark.original(this.type, { highlight }, options?.selection);
  }

  /**
   * Remove the highlight mark from the selection.
   */
  @command()
  removeTextHighlight(options?: HighlightCommandOptions): CommandFunction {
    return this.store.commands.removeMark.original({ type: this.type, ...options, expand: true });
  }
}

export interface TextHighlightOptions {
  /**
   * The default highlight value.
   *
   * @default ''
   */
  defaultHighlight?: Static<string>;

  /**
   * The color palette which is a function that returns a list of colors and
   * labels for help with ui. It is completely optional and you are free to use
   * use whatever colors you choose.
   */
  palette?: Palette;
}

export interface TextHighlightAttributes {
  /**
   * The highlight color.
   *
   * @default ''
   */
  highlight?: string;
}

interface HighlightCommandOptions {
  selection?: PrimitiveSelection;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      textHighlight: TextHighlightExtension;
    }
  }
}
