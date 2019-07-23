import { setBlockType } from 'prosemirror-commands';
import { Plugin } from 'prosemirror-state';
import { NodeExtension } from '../../node-extension';
import { CommandNodeTypeParams, NodeExtensionSpec, SchemaNodeTypeParams } from '../../types';
import { ALIGN_PATTERN, EMPTY_CSS_VALUE, INDENT_ATTRIBUTE, INDENT_LEVELS } from '../node-constants';
import { marginToIndent } from '../node-utils';
import { createParagraphPlugin } from './paragraph-plugin';
import { ParagraphExtensionAttrs, ParagraphExtensionOptions } from './paragraph-types';

/**
 * The paragraph is one of the essential building blocks for a prosemirror editor
 * and by default it is provided to all editors.
 *
 * @builtin
 */
export class ParagraphExtension extends NodeExtension<ParagraphExtensionOptions, 'createParagraph', {}> {
  get name() {
    return 'paragraph' as const;
  }

  get defaultOptions() {
    return {
      ensureTrailingParagraph: false,
      indentAttribute: INDENT_ATTRIBUTE,
      indentLevels: INDENT_LEVELS,
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      content: 'inline*',
      group: 'block',
      attrs: {
        ...this.extraAttrs(),
        align: { default: null },
        color: { default: null },
        id: { default: null },
        indent: { default: null },
        lineSpacing: { default: null },
        paddingBottom: { default: null },
        paddingTop: { default: null },
      },
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
          getAttrs: node => ({
            ...this.getExtraAttrs(node as HTMLElement),
            ...getAttrs(this.options, node as HTMLElement),
          }),
        },
      ],
      toDOM: node => {
        const {
          align,
          indent,
          lineSpacing,
          paddingTop,
          paddingBottom,
          id,
        } = node.attrs as ParagraphExtensionAttrs;
        const attrs: Record<string, string> = {};
        let style = '';

        if (align && align !== 'left') {
          style += `text-align: ${align};`;
        }

        if (lineSpacing) {
          style += `line-height: ${lineSpacing};`;
        }

        if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
          style += `padding-top: ${paddingTop};`;
        }

        if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
          style += `padding-bottom: ${paddingBottom};`;
        }

        if (style) {
          attrs.style = style;
        }

        if (indent) {
          attrs[INDENT_ATTRIBUTE] = String(indent);
        }

        if (id) {
          attrs.id = id;
        }

        return ['p', attrs, 0];
      },
    };
  }

  /**
   * Provides the commands that this extension uses.
   */
  public commands({ type }: CommandNodeTypeParams) {
    return {
      createParagraph: (attrs?: ParagraphExtensionAttrs) => {
        return setBlockType(type, attrs);
      },
    };
  }

  /**
   * Create the plugin that adds the configurable functionality.
   *
   * - Ensure the last node in the document is a paragraph
   */
  public plugin({ type }: SchemaNodeTypeParams): Plugin {
    return createParagraphPlugin({ extension: this, type });
  }
}

/**
 * Pull the paragraph attributes from the dom element.
 */
const getAttrs = (
  { indentAttribute, indentLevels }: Required<ParagraphExtensionOptions>,
  dom: HTMLElement,
) => {
  const { lineHeight, textAlign, marginLeft, paddingTop, paddingBottom } = dom.style;
  let align: string | undefined = dom.getAttribute('align') || textAlign || '';
  let indent = parseInt(dom.getAttribute(indentAttribute) || '0', 10);

  align = ALIGN_PATTERN.test(align) ? align : undefined;

  if (!indent && marginLeft) {
    indent = marginToIndent(marginLeft);
  }

  indent = indent || indentLevels[0];

  const lineSpacing = lineHeight ? lineHeight : undefined;
  const id = dom.getAttribute('id') || '';

  return { align, indent, lineSpacing, paddingTop, paddingBottom, id } as ParagraphExtensionAttrs;
};
