import round from 'round';
import {
  ApplySchemaAttributes,
  Array1,
  clamp,
  command,
  CommandFunction,
  convertPixelsToDomUnit,
  extension,
  ExtensionPriority,
  ExtensionTag,
  getFontSize,
  getMarkRanges,
  getTextSelection,
  Helper,
  helper,
  isElementDomNode,
  isFunction,
  isString,
  joinStyles,
  keyBinding,
  KeyBindingProps,
  Mark,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  NamedShortcut,
  omitExtraAttributes,
  ParsedDomSize,
  parseSizeUnit,
  PrimitiveSelection,
} from '@remirror/core';
import type { StyleParseRule, TagParseRule } from '@remirror/pm/model';

import { FontSizeAttributes, FontSizeOptions } from './font-size-types';
import {
  decreaseFontSizeOptions,
  FONT_SIZE_ATTRIBUTE,
  increaseFontSizeOptions,
  setFontSizeOptions,
} from './font-size-utils';

/**
 * Add a font size to the selected text (or text within a specified range).
 */
@extension<FontSizeOptions>({
  defaultOptions: {
    defaultSize: '',
    unit: 'pt',
    increment: 1,
    max: 100,
    min: 1,
    roundingMultiple: 0.5,
  },
  staticKeys: ['defaultSize'],
})
export class FontSizeExtension extends MarkExtension<FontSizeOptions> {
  get name() {
    return 'fontSize' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: {
        ...extra.defaults(),
        size: { default: this.options.defaultSize, validate: 'string|number|null' },
      },
      parseDOM: [
        {
          tag: `span[${FONT_SIZE_ATTRIBUTE}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return null;
            }

            let size = dom.getAttribute(FONT_SIZE_ATTRIBUTE);

            if (!size) {
              return null;
            }

            size = `${convertPixelsToDomUnit(size, this.options.unit, dom)}${this.options.unit}`;

            return { ...extra.parse(dom), size };
          },
        } satisfies TagParseRule,
        {
          // Get the color from the css style property. This is useful for pasted content.
          style: 'font-size',
          priority: ExtensionPriority.Low,
          getAttrs: (size) => {
            if (!isString(size)) {
              return null;
            }

            size = this.getFontSize(size);

            return { size };
          },
        } satisfies StyleParseRule,
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark: Mark) => {
        const { size, ...other } = omitExtraAttributes<FontSizeAttributes>(mark.attrs, extra);
        const extraAttrs = extra.dom(mark);
        let style = extraAttrs.style;
        let fontSize: string | undefined;

        if (size) {
          style = joinStyles({ fontSize: this.getFontSize(size) }, style);
        }

        return ['span', { ...other, ...extraAttrs, style, [FONT_SIZE_ATTRIBUTE]: fontSize }, 0];
      },
    };
  }

  private getFontSize(size: string) {
    const { unit, roundingMultiple, max, min, defaultSize } = this.options;
    const fontSize = convertPixelsToDomUnit(size, unit, this.store.view?.dom);

    if (Number.isNaN(fontSize)) {
      return defaultSize || '1rem';
    }

    const value = clamp({
      value: round(fontSize, roundingMultiple),
      max,
      min,
    });

    return `${value}${unit}`;
  }

  /**
   * Set the text size color value for the selected text.
   */
  @command(setFontSizeOptions)
  setFontSize(size: string | number, options?: SizeCommandOptions): CommandFunction {
    return this.store.commands.applyMark.original(
      this.type,
      // Store always as string. This removes the need to treat string vs number when using the value
      { size: String(size) },
      options?.selection,
    );
  }

  @command(increaseFontSizeOptions)
  increaseFontSize(options?: SizeCommandOptions): CommandFunction {
    const { increment } = this.options;

    return (props) => {
      const [parsedFontSize] = this.getFontSizeForSelection(options?.selection);
      let [size] = parsedFontSize;

      size += isFunction(increment) ? increment(parsedFontSize, 1) : increment;

      return this.setFontSize(size, options)(props);
    };
  }

  @command(decreaseFontSizeOptions)
  decreaseFontSize(options?: SizeCommandOptions): CommandFunction {
    const { increment } = this.options;

    return (props) => {
      const [parsedFontSize] = this.getFontSizeForSelection(options?.selection);
      let [size] = parsedFontSize;

      size -= isFunction(increment) ? increment(parsedFontSize, -1) : increment;

      return this.setFontSize(size, options)(props);
    };
  }

  /**
   * Remove the size mark from the selection.
   */
  @command()
  removeFontSize(options?: SizeCommandOptions): CommandFunction {
    return this.store.commands.removeMark.original({ type: this.type, expand: false, ...options });
  }

  /**
   * Handle exiting the mark forwards.
   */
  @keyBinding({ shortcut: NamedShortcut.IncreaseFontSize, command: 'increaseFontSize' })
  increaseFontSizeShortcut(props: KeyBindingProps): boolean {
    return this.increaseFontSize()(props);
  }

  /**
   * Handle exiting the mark forwards.
   */
  @keyBinding({ shortcut: NamedShortcut.IncreaseFontSize, command: 'decreaseFontSize' })
  decreaseFontSizeShortcut(props: KeyBindingProps): boolean {
    return this.decreaseFontSize()(props);
  }

  /**
   * Get the font size at the current selection (or provided custom selection).
   * Returns an array of parsed font size tuples if there are multiple sizes in
   * the non-empty selection.
   */
  @helper()
  getFontSizeForSelection(position?: PrimitiveSelection): Helper<Array1<ParsedDomSize>> {
    const state = this.store.getState();
    const selection = getTextSelection(position ?? state.selection, state.doc);
    const [range, ...rest] = getMarkRanges(selection, this.type);

    if (range) {
      return [
        parseSizeUnit(range.mark.attrs.size),
        ...rest.map((range) => parseSizeUnit(range.mark.attrs.size)),
      ];
    }

    const { defaultSize, unit } = this.options;
    const parsedSize: ParsedDomSize = [convertPixelsToDomUnit(defaultSize, unit), unit];

    return [parsedSize];
  }

  @helper()
  getFontSizeFromDom(position?: PrimitiveSelection): Helper<ParsedDomSize> {
    const state = this.store.getState();
    const selection = getTextSelection(position ?? state.selection, state.doc);
    const nodeAtPos = this.store.view.domAtPos(selection.from);
    const element = isElementDomNode(nodeAtPos.node) ? nodeAtPos.node : this.store.view.dom;

    return parseSizeUnit(getFontSize(element));
  }
}

interface SizeCommandOptions {
  selection?: PrimitiveSelection;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      fontSize: FontSizeExtension;
    }
  }
}
