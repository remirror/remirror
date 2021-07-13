import { toHex } from 'color2k';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  Helper,
  helper,
  isElementDomNode,
  isString,
  joinStyles,
  Mark,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  omitExtraAttributes,
} from '@remirror/core';

import { SetTextColorOptions, TextColorAttributes, TextColorOptions } from './text-color-types';
import {
  CSS_VAR_REGEX,
  palette,
  setTextColorOptions,
  TEXT_COLOR_ATTRIBUTE,
} from './text-color-utils';

/**
 * Wraps text with a styled span using the color css property. The name of the wrapper tag should be configurable.
 */
@extension<TextColorOptions>({
  defaultOptions: {
    defaultColor: '',
    palette,
  },
  staticKeys: ['defaultColor'],
})
export class TextColorExtension extends MarkExtension<TextColorOptions> {
  get name() {
    return 'textColor' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: {
        ...extra.defaults(),
        color: { default: this.options.defaultColor },
      },
      parseDOM: [
        {
          tag: `span[${TEXT_COLOR_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return;
            }

            const color = dom.getAttribute(TEXT_COLOR_ATTRIBUTE);

            if (!color) {
              return;
            }

            return { ...extra.parse(dom), color };
          },
        },
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'color',
          priority: ExtensionPriority.Low,
          getAttrs: (color) => {
            if (!isString(color)) {
              return;
            }

            return { color };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark: Mark) => {
        const { color, ...other } = omitExtraAttributes<TextColorAttributes>(mark.attrs, extra);
        const extraAttrs = extra.dom(mark);
        let style = extraAttrs.style;

        if (color) {
          style = joinStyles({ color }, style);
        }

        return ['span', { ...other, ...extraAttrs, style, [TEXT_COLOR_ATTRIBUTE]: color }, 0];
      },
    };
  }

  /**
   * Set the text color value for the selected text.
   *
   * To remove the color you can set the value to null.
   */
  @command(setTextColorOptions)
  setTextColor(color: string, options?: SetTextColorOptions): CommandFunction {
    return this.store.commands.applyMark.original(this.type, { color }, options?.selection);
  }

  /**
   * Remove the color mark from the selection.
   */
  @command()
  removeTextColor(options?: SetTextColorOptions): CommandFunction {
    return this.store.commands.removeMark.original({ type: this.type, ...options, expand: true });
  }

  /**
   * Get the color from the provided string. The string can be a computed
   * property as well.
   */
  @helper()
  getHexColor(color: string): Helper<string> {
    const match = color.match(CSS_VAR_REGEX);
    const cssVar = match?.[1];

    if (cssVar) {
      color = getComputedStyle(this.store.view.dom).getPropertyValue(cssVar);
    }

    return toHex(color);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      textColor: TextColorExtension;
    }
  }
}
