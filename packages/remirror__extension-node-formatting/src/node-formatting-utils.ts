import {
  clamp,
  EditorState,
  extractPixelSize,
  last,
  NodeWithPosition,
  Shape,
  Static,
  Transaction,
} from '@remirror/core';
import { ExtensionNodeFormattingMessages as Messages } from '@remirror/messages';

export const increaseIndentOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.INCREASE_INDENT_LABEL),
  icon: 'indentIncrease',
};

export const decreaseIndentOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.DECREASE_INDENT_LABEL),
  icon: 'indentDecrease',
};

export const centerAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.CENTER_ALIGN_LABEL),
  icon: 'alignCenter',
  active: createActiveCheck(({ node }) => node.attrs.textAlign === 'center'),
};

export const justifyAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.JUSTIFY_ALIGN_LABEL),
  icon: 'alignJustify',
  active: createActiveCheck(({ node }) => node.attrs.textAlign === 'justify'),
};

export const rightAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.RIGHT_ALIGN_LABEL),
  icon: 'alignRight',
  active: createActiveCheck(({ node }) => node.attrs.textAlign === 'right'),
};

export const leftAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.LEFT_ALIGN_LABEL),
  icon: 'alignLeft',
  active: createActiveCheck(({ node }) => node.attrs.textAlign === 'left'),
};

function createActiveCheck(
  predicate: (node: NodeWithPosition) => boolean,
): (options: Shape, store: Remirror.ExtensionStore) => boolean {
  return ({ excludeNodes }, store) => {
    const { getState, nodeTags } = store;
    const gatheredNodes = gatherNodes(getState(), nodeTags.formattingNode, excludeNodes);

    return gatheredNodes.some(predicate);
  };
}

export function gatherNodes(
  state: Transaction | EditorState,
  included: string[],
  excluded: string[],
): NodeWithPosition[] {
  const gatheredNodes: NodeWithPosition[] = [];

  // Gather the nodes to indent.
  state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
    if (excluded.includes(node.type.name) || !included.includes(node.type.name)) {
      return;
    }

    gatheredNodes.push({ node, pos });
  });

  return gatheredNodes;
}

/**
 * The data attribute for an indented node attribute.
 */
export const NODE_INDENT_ATTRIBUTE = 'data-node-indent';

/**
 * The data attribute text alignment within a block node which accepts
 * formatting.
 */
export const NODE_TEXT_ALIGNMENT_ATTRIBUTE = 'data-node-text-align';

/**
 * The data attribute for the line height of a node.
 */
export const NODE_LINE_HEIGHT_ATTRIBUTE = 'data-line-height-align';

export interface NodeFormattingOptions {
  /**
   * The nodes to exclude from being included in the formattable collection.
   */
  excludeNodes?: Static<string[]>;

  /**
   * The list of available indent levels.
   *
   * The first item (0-index) is ignored. By default the indents start at index
   * `1`.
   */
  indents?: Static<string[]>;
}

export type NodeTextAlignment = 'none' | 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';

/**
 * Extract the indent index from a list of indents and left margin.
 */
export function extractIndent(indents: string[], marginLeft: string | null): number {
  const largestIndent = extractPixelSize(last(indents));
  const value = extractPixelSize(marginLeft ?? '0');
  const max = indents.length ?? 1;
  const indentIncrement = largestIndent / max;

  return clamp({ max, min: 0, value: Math.floor(value / indentIncrement) });
}
