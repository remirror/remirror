import { CommandNodeTypeParams, NodeExtension, NodeExtensionSpec, NodeGroup, Tags } from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { ALIGN_PATTERN, INDENT_ATTRIBUTE, INDENT_LEVELS } from '../node-constants';
import { marginToIndent } from '../node-utils';
import { ParagraphExtensionAttrs, ParagraphExtensionOptions } from './paragraph-types';

/**
 * The paragraph is one of the essential building blocks for a prosemirror
 * editor and by default it is provided to all editors.
 *
 * @builtin
 */
export class ParagraphExtension extends NodeExtension<ParagraphExtensionOptions> {
  get name() {
    return 'paragraph' as const;
  }

  get tags() {
    return [Tags.LastNodeCompatible];
  }

  get defaultOptions() {
    return {
      indentAttribute: INDENT_ATTRIBUTE,
      indentLevels: INDENT_LEVELS,
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      content: 'inline*',
      group: NodeGroup.Block,
      attrs: {
        ...this.extraAttrs(),
        align: { default: null },
        id: { default: null },
        indent: { default: 0 },
        lineSpacing: { default: null },
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
        const { align, indent, lineSpacing, id } = node.attrs as ParagraphExtensionAttrs;
        const attrs: Record<string, string> = Object.create(null);
        let style = '';

        if (align && align !== 'left') {
          style += `text-align: ${align};`;
        }

        if (lineSpacing) {
          style += `line-height: ${lineSpacing};`;
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
}

/**
 * Pull the paragraph attributes from the dom element.
 */
const getAttrs = (
  { indentAttribute, indentLevels }: Required<ParagraphExtensionOptions>,
  dom: HTMLElement,
) => {
  const { lineHeight, textAlign, marginLeft } = dom.style;
  let align: string | undefined = dom.getAttribute('align') || textAlign || '';
  let indent = parseInt(dom.getAttribute(indentAttribute) || '0', 10);

  align = ALIGN_PATTERN.test(align) ? align : undefined;

  if (!indent && marginLeft) {
    indent = marginToIndent(marginLeft);
  }

  indent = indent || indentLevels[0];

  const lineSpacing = lineHeight ? lineHeight : undefined;
  const id = dom.getAttribute('id') || undefined;

  return { align, indent, lineSpacing, id } as ParagraphExtensionAttrs;
};
