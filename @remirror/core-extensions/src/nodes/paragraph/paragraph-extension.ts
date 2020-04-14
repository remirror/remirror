import { setBlockType } from 'prosemirror-commands';

import {
  CommandNodeTypeParameter,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  object,
  Tag,
} from '@remirror/core';

import { ALIGN_PATTERN, INDENT_ATTRIBUTE, INDENT_LEVELS } from '../node-constants';
import { marginToIndent } from '../node-utils';
import { ParagraphExtensionAttributes, ParagraphExtensionOptions } from './paragraph-types';

/**
 * Pull the paragraph attributes from the dom element.
 */
const getAttributes = (
  { indentAttribute, indentLevels }: Required<ParagraphExtensionOptions>,
  dom: HTMLElement,
) => {
  const { lineHeight, textAlign, marginLeft } = dom.style;
  let align: string | undefined = dom.getAttribute('align') ?? (textAlign || '');
  let indent = Number.parseInt(dom.getAttribute(indentAttribute) ?? '0', 10);

  align = ALIGN_PATTERN.test(align) ? align : undefined;

  if (!indent && marginLeft) {
    indent = marginToIndent(marginLeft);
  }

  indent = indent || indentLevels[0];

  const lineSpacing = lineHeight ? lineHeight : undefined;
  const id = dom.getAttribute('id') ?? undefined;

  return { align, indent, lineSpacing, id } as ParagraphExtensionAttributes;
};

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
    return [ExtensionTag.LastNodeCompatible];
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
        ...this.extraAttributes(),
        align: { default: null },
        id: { default: null },
        indent: { default: 0 },
        lineSpacing: { default: null },
      },
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => ({
            ...this.getExtraAttributes(node as HTMLElement),
            ...getAttributes(this.options, node as HTMLElement),
          }),
        },
      ],
      toDOM: (node) => {
        const { align, indent, lineSpacing, id } = node.attrs as ParagraphExtensionAttributes;
        const attributes: Record<string, string> = object();
        let style = '';

        if (align && align !== 'left') {
          style += `text-align: ${align};`;
        }

        if (lineSpacing) {
          style += `line-height: ${lineSpacing};`;
        }

        if (style) {
          attributes.style = style;
        }

        if (indent) {
          attributes[INDENT_ATTRIBUTE] = String(indent);
        }

        if (id) {
          attributes.id = id;
        }

        return ['p', attributes, 0];
      },
    };
  }

  /**
   * Provides the commands that this extension uses.
   */
  public commands({ type }: CommandNodeTypeParameter) {
    return {
      createParagraph: (attributes: ParagraphExtensionAttributes) => {
        return setBlockType(type, attributes);
      },
    };
  }
}
