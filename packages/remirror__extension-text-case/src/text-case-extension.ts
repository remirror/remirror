import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  isElementDomNode,
  joinStyles,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  omitExtraAttributes,
  PrimitiveSelection,
} from '@remirror/core';

import {
  isValidCasing,
  TEXT_CASE_ATTRIBUTE,
  TextCaseAttributes,
  TextCaseOptions,
  toggleTextCaseOptions,
} from './text-case-utils';

/**
 * Formatting for text casing in your editor.
 */
@extension<TextCaseOptions>({
  defaultOptions: {
    defaultCasing: 'upper',
  },
  staticKeys: ['defaultCasing'],
})
export class TextCaseExtension extends MarkExtension<TextCaseOptions> {
  get name() {
    return 'textCase' as const;
  }

  createTags() {
    return [ExtensionTag.FontStyle, ExtensionTag.FormattingMark];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: { ...extra.defaults(), casing: { default: this.options.defaultCasing } },
      parseDOM: [
        {
          tag: `span[${TEXT_CASE_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return false;
            }

            const casing = dom.getAttribute(TEXT_CASE_ATTRIBUTE);

            if (!casing || casing === 'none') {
              return false;
            }

            return { ...extra.parse(dom), casing };
          },
        },
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'text-transform',
          priority: ExtensionPriority.Low,
          getAttrs: (casing) => {
            if (!isValidCasing(casing)) {
              return false;
            }

            return { casing };
          },
        },
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'font-variant',
          priority: ExtensionPriority.Low,
          getAttrs: (casing) => {
            if (!isValidCasing(casing)) {
              return false;
            }

            return { casing };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark) => {
        let { casing } = omitExtraAttributes(mark.attrs, extra) as TextCaseAttributes;
        const extraAttrs = extra.dom(mark);
        let style = extraAttrs.style;

        if (!isValidCasing(casing)) {
          casing = 'none';
        }

        const property = casing === 'smallCaps' ? 'fontVariant' : 'textTransform';
        style = joinStyles({ [property]: casing }, style);

        return ['span', { ...extraAttrs, style, [TEXT_CASE_ATTRIBUTE]: casing }, 0];
      },
    };
  }

  /**
   * Toggle the default text case for this extension formatting annotation.
   */
  @command(toggleTextCaseOptions)
  toggleTextCase(): CommandFunction {
    return this.store.commands.toggleMark.original({
      type: this.type,
      attrs: { casing: this.options.defaultCasing },
    });
  }

  @command()
  setTextCase(attrs: TextCaseAttributes, selection?: PrimitiveSelection): CommandFunction {
    return this.store.commands.applyMark.original(this.type, attrs, selection);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      textCase: TextCaseExtension;
    }
  }
}
