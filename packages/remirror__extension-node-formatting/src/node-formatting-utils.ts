import {
  clamp,
  EditorState,
  extractPixelSize,
  isNumber,
  last,
  NodeType,
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
  active: createActiveCheck(({ node }) => node.attrs.nodeTextAlignment === 'center'),
};

export const justifyAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.JUSTIFY_ALIGN_LABEL),
  icon: 'alignJustify',
  active: createActiveCheck(({ node }) => node.attrs.nodeTextAlignment === 'justify'),
};

export const rightAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.RIGHT_ALIGN_LABEL),
  icon: 'alignRight',
  active: createActiveCheck(({ node }) => node.attrs.nodeTextAlignment === 'right'),
};

export const leftAlignOptions: Remirror.CommandDecoratorOptions = {
  label: ({ t }) => t(Messages.LEFT_ALIGN_LABEL),
  icon: 'alignLeft',
  active: createActiveCheck(({ node }) => {
    const { nodeTextAlignment } = node.attrs;
    // TODO: Assumption here is that left is default text alignment, which may not be true in RTL languages
    return nodeTextAlignment === 'left' || nodeTextAlignment === '';
  }),
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

function isValidNodeType(type: NodeType, included: string[], excluded: string[]): boolean {
  if (excluded.includes(type.name)) {
    return false;
  }

  return included.includes(type.name);
}

export function gatherNodes(
  state: Transaction | EditorState,
  included: string[],
  excluded: string[],
): NodeWithPosition[] {
  const gatheredNodes: NodeWithPosition[] = [];
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) {
    return [];
  }

  const { parent, start, end } = range;
  const isRangeEntireParentContent = parent.nodeSize - 2 === end - start;

  if (isRangeEntireParentContent && isValidNodeType(parent.type, included, excluded)) {
    return [
      {
        node: parent,
        pos: start - 1,
      },
    ];
  }

  // Gather the nodes to indent.
  state.doc.nodesBetween(start, end, (node, pos) => {
    if (pos < start || pos > end) {
      return;
    }

    if (isValidNodeType(node.type, included, excluded)) {
      gatheredNodes.push({ node, pos });
      return false;
    }

    return;
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

const NUMERIC_REGEX = /^\d+(?:\.\d+)?$/;
const PERCENT_REGEX = /^(\d+(?:\.\d+)?)%$/;

/**
 * Extract the line height from numeric or percentage line-height values
 */
export function extractLineHeight(lineHeight: string | number | null): number | null {
  if (isNumber(lineHeight)) {
    return lineHeight;
  }

  if (!lineHeight) {
    return null;
  }

  const lineHeightStr = lineHeight.trim();
  const percentMatch = lineHeightStr.match(PERCENT_REGEX);

  if (percentMatch) {
    return Number.parseFloat(percentMatch[1]) / 100;
  }

  const numberMatch = lineHeightStr.match(NUMERIC_REGEX);

  if (numberMatch) {
    return Number.parseFloat(numberMatch[0]);
  }

  return null;
}
