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
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  omitExtraAttributes,
  ProsemirrorAttributes,
} from '@remirror/core';

const FONT_FAMILY_ATTRIBUTE = 'data-font-family';

export type FontFamilyAttributes = ProsemirrorAttributes<{
  fontFamily?: string;
}>;

/**
 * Formatting for text casing in your editor.
 */
@extension({})
export class FontFamilyExtension extends MarkExtension {
  get name() {
    return 'fontFamily' as const;
  }

  createTags() {
    return [ExtensionTag.FontStyle, ExtensionTag.FormattingMark];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: { ...extra.defaults(), fontFamily: { default: null } },
      parseDOM: [
        {
          tag: `span[${FONT_FAMILY_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return false;
            }

            const fontFamily = dom.getAttribute(FONT_FAMILY_ATTRIBUTE);

            if (!fontFamily) {
              return false;
            }

            return { ...extra.parse(dom), fontFamily };
          },
        },
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'font-family',
          priority: ExtensionPriority.Low,
          getAttrs: (fontFamily) => {
            if (!isString(fontFamily)) {
              return false;
            }

            return {
              fontFamily: fontFamily ? fontFamily.replace(/["']/g, '') : '',
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark) => {
        const { fontFamily } = omitExtraAttributes(mark.attrs, extra) as FontFamilyAttributes;
        const extraAttrs = extra.dom(mark);
        let style = extraAttrs.style;

        style = joinStyles({ fontFamily }, style);

        return ['span', { ...extraAttrs, style, [FONT_FAMILY_ATTRIBUTE]: fontFamily }, 0];
      },
    };
  }

  /**
   * Set the font family for the selected text.
   */
  @command()
  setFontFamily(fontFamily: string): CommandFunction {
    return this.store.commands.applyMark.original(this.type, { fontFamily });
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      fontFamily: FontFamilyExtension;
    }
  }
}
