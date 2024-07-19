import {
  clamp,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  IdentifierSchemaAttributes,
  isEmptyArray,
  joinStyles,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeWithPosition,
  PlainExtension,
  ProsemirrorAttributes,
  SchemaAttributesObject,
} from '@remirror/core';

import {
  centerAlignOptions,
  decreaseIndentOptions,
  extractIndent,
  extractLineHeight,
  gatherNodes,
  increaseIndentOptions,
  justifyAlignOptions,
  leftAlignOptions,
  NODE_INDENT_ATTRIBUTE,
  NODE_LINE_HEIGHT_ATTRIBUTE,
  NODE_TEXT_ALIGNMENT_ATTRIBUTE,
  NodeFormattingOptions,
  NodeTextAlignment,
  rightAlignOptions,
} from './node-formatting-utils';

/**
 * Support consistent formatting of nodes within your editor.
 */
@extension<NodeFormattingOptions>({
  defaultOptions: {
    indents: [
      '0',
      '20px',
      '40px',
      '60px',
      '80px',
      '100px',
      '120px',
      '140px',
      '160px',
      '180px',
      '200px',
    ],
    excludeNodes: [],
  },
  staticKeys: ['indents'],
})
export class NodeFormattingExtension extends PlainExtension<NodeFormattingOptions> {
  get name() {
    return 'nodeFormatting' as const;
  }

  /**
   * Set up the extra attributes which are applied to the formattable node
   * blocks.
   */
  createSchemaAttributes(): IdentifierSchemaAttributes[] {
    return [
      {
        identifiers: {
          type: 'node',
          tags: [ExtensionTag.FormattingNode],
          excludeNames: this.options.excludeNodes,
        },
        attributes: {
          nodeIndent: this.nodeIndent(),
          nodeTextAlignment: this.nodeTextAlignment(),
          nodeLineHeight: this.nodeLineHeight(),
          style: {
            default: '',

            parseDOM: () => '',
            toDOM: ({ nodeIndent, nodeTextAlignment, nodeLineHeight, style }) => {
              const marginLeft = nodeIndent ? this.options.indents[nodeIndent] : undefined;
              const textAlign =
                nodeTextAlignment && nodeTextAlignment !== 'none' ? nodeTextAlignment : undefined;
              const lineHeight = nodeLineHeight ? nodeLineHeight : undefined;

              return {
                // Compose the style string together with the currently set style.
                style: joinStyles({ marginLeft, textAlign, lineHeight }, style as string),
              };
            },
          },
        },
      },
    ];
  }

  @command()
  setLineHeight(lineHeight: number): CommandFunction {
    return this.setNodeAttribute(({ node }) => {
      if (lineHeight === node.attrs.nodeLineHeight) {
        return;
      }

      return { nodeLineHeight: lineHeight };
    });
  }

  /**
   * Set the text alignment for the selected nodes.
   */
  @command()
  setTextAlignment(alignment: NodeTextAlignment): CommandFunction {
    return this.setNodeAttribute(({ node }) => {
      if (alignment === node.attrs.nodeTextAlignment) {
        return;
      }

      return { nodeTextAlignment: alignment };
    });
  }

  /**
   * Set the indent level for the selected nodes.
   */
  @command()
  setIndent(level: number | '+1' | '-1'): CommandFunction {
    return this.setNodeAttribute(({ node }) => {
      const currentIndent: number = node.attrs.nodeIndent ?? 0;
      const value = level === '-1' ? currentIndent - 1 : level === '+1' ? currentIndent + 1 : level;
      const indent = clamp({ min: 0, max: this.options.indents.length - 1, value });

      if (indent === currentIndent) {
        return;
      }

      return { nodeIndent: indent };
    });
  }

  /**
   * Center the text within current block node.
   */
  @command(centerAlignOptions)
  centerAlign(): CommandFunction {
    return this.setTextAlignment('center');
  }

  /**
   * Justify the text within the current block node.
   */
  @command(justifyAlignOptions)
  justifyAlign(): CommandFunction {
    return this.setTextAlignment('justify');
  }

  /**
   * Left align the text within the current block node.
   */
  @command(leftAlignOptions)
  leftAlign(): CommandFunction {
    return this.setTextAlignment('left');
  }

  /**
   * Right align the text within the current block node.
   */
  @command(rightAlignOptions)
  rightAlign(): CommandFunction {
    return this.setTextAlignment('right');
  }

  /**
   * Increase the indentation level of the current block node, if applicable.
   */
  @command(increaseIndentOptions)
  increaseIndent(): CommandFunction {
    return (props) => this.setIndent('+1')(props);
  }

  /**
   * Decrease the indentation of the current block node.
   */
  @command(decreaseIndentOptions)
  decreaseIndent(): CommandFunction {
    return (props) => this.setIndent('-1')(props);
  }

  @keyBinding({ shortcut: NamedShortcut.CenterAlignment, command: 'centerAlign' })
  centerAlignShortcut(props: KeyBindingProps): boolean {
    return this.centerAlign()(props);
  }

  @keyBinding({ shortcut: NamedShortcut.JustifyAlignment, command: 'justifyAlign' })
  justifyAlignShortcut(props: KeyBindingProps): boolean {
    return this.justifyAlign()(props);
  }

  @keyBinding({ shortcut: NamedShortcut.LeftAlignment, command: 'leftAlign' })
  leftAlignShortcut(props: KeyBindingProps): boolean {
    return this.leftAlign()(props);
  }

  @keyBinding({ shortcut: NamedShortcut.RightAlignment, command: 'rightAlign' })
  rightAlignShortcut(props: KeyBindingProps): boolean {
    return this.rightAlign()(props);
  }

  @keyBinding({
    shortcut: NamedShortcut.IncreaseIndent,
    command: 'increaseIndent',
    // Ensure this has lower priority than the indent keybinding in @remirror/extension-list
    priority: ExtensionPriority.Low,
  })
  increaseIndentShortcut(props: KeyBindingProps): boolean {
    return this.increaseIndent()(props);
  }

  @keyBinding({
    shortcut: NamedShortcut.DecreaseIndent,
    command: 'decreaseIndent',
    // Ensure this has higher priority than the dedent keybinding in @remirror/extension-list
    priority: ExtensionPriority.Medium,
  })
  decreaseIndentShortcut(props: KeyBindingProps): boolean {
    return this.decreaseIndent()(props);
  }

  /**
   * Add an indentation attribute to the formattable node blocks.
   */
  private nodeIndent(): SchemaAttributesObject {
    return {
      default: null,

      parseDOM: (element) =>
        element.getAttribute(NODE_INDENT_ATTRIBUTE) ??
        extractIndent(this.options.indents, element.style.marginLeft),
      toDOM: (attrs) => {
        // Ignoring the `0` value is intentional here.
        if (!attrs.nodeIndent) {
          return;
        }

        const indentIndex = `${attrs.nodeIndent}`;
        const marginLeft = this.options.indents[attrs.nodeIndent];

        if (!marginLeft) {
          return;
        }

        return {
          [NODE_INDENT_ATTRIBUTE]: indentIndex,
        };
      },
    };
  }

  /**
   * Add the `nodeTextAlignment` attribute to the formattable block nodes.
   */
  private nodeTextAlignment(): SchemaAttributesObject {
    return {
      default: null,

      parseDOM: (element) =>
        element.getAttribute(NODE_TEXT_ALIGNMENT_ATTRIBUTE) ?? element.style.textAlign,
      toDOM: (attrs) => {
        const textAlign = attrs.nodeTextAlignment;

        if (!textAlign || textAlign === 'none') {
          return;
        }

        return {
          [NODE_TEXT_ALIGNMENT_ATTRIBUTE]: textAlign,
        };
      },
    };
  }

  /**
   * Add a `line height` attribute to all the formattable block nodes selected.
   */
  private nodeLineHeight(): SchemaAttributesObject {
    return {
      default: null,

      parseDOM: (element) => {
        const val = element.getAttribute(NODE_LINE_HEIGHT_ATTRIBUTE);
        return extractLineHeight(val) ?? extractLineHeight(element.style.lineHeight);
      },
      toDOM: (attrs) => {
        const lineHeight = attrs.nodeLineHeight;

        if (!lineHeight) {
          return;
        }

        return {
          [NODE_LINE_HEIGHT_ATTRIBUTE]: lineHeight.toString(),
        };
      },
    };
  }

  private setNodeAttribute(
    getAttributes: (nodeWithPos: NodeWithPosition) => ProsemirrorAttributes | undefined,
  ): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
      const gatheredNodes = gatherNodes(
        tr,
        this.store.nodeTags.formattingNode,
        this.options.excludeNodes,
      );

      if (isEmptyArray(gatheredNodes)) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      const updates: Array<[pos: number, attrs: ProsemirrorAttributes]> = [];

      for (const nodeWithPos of gatheredNodes) {
        const { node, pos } = nodeWithPos;
        const attrs = getAttributes(nodeWithPos);

        if (!attrs) {
          continue;
        }

        updates.push([pos, { ...node.attrs, ...attrs }]);
      }

      if (isEmptyArray(updates)) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      for (const [pos, attrs] of updates) {
        tr.setNodeMarkup(pos, undefined, attrs);
      }

      dispatch(tr);
      return true;
    };
  }
}

declare global {
  namespace Remirror {
    interface Attributes {
      /**
       * The indentation level for the formattable node.
       */
      nodeIndent?: number;

      /**
       * Set the text alignment fpr the formattable node.
       */
      nodeTextAlignment?: NodeTextAlignment;

      /**
       * A ratio with a minimum value of `1` (100%) for the line height of a
       * formattable node.
       */
      nodeLineHeight?: number;
    }

    interface AllExtensions {
      nodeFormatting: NodeFormattingExtension;
    }
  }
}
