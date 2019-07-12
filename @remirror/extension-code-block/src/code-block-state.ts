import {
  CompareStateParams,
  EditorState,
  EditorStateParams,
  findChildrenByNode,
  FromToParams,
  NodeType,
  NodeTypeParams,
  NodeWithPosition,
  PMNodeParams,
  PosParams,
  TransactionParams,
} from '@remirror/core';
import { Step } from 'prosemirror-transform';
import { DecorationSet } from 'prosemirror-view';
import { createDecorations, posWithinRange } from './code-block-utils';

export class CodeBlockState {
  /**
   * Keep track of all document codeBlocks
   */
  private blocks: NodeWithPosition[] = [];

  /**
   * The set of cached decorations to minimise dom updates
   */
  public decorationSet!: DecorationSet;

  constructor(private type: NodeType) {}

  /**
   * Creates the initial set of decorations
   */
  public init(state: EditorState) {
    const blocks = findChildrenByNode({ node: state.doc, type: this.type });
    this.refreshDecorationSet({ blocks, node: state.doc });

    return this;
  }

  /**
   * Recreate all the decorations again
   */
  private refreshDecorationSet({ blocks, node }: RefreshDecorationSetParams) {
    const decorations = createDecorations(blocks);
    this.decorationSet = DecorationSet.create(node, decorations);
    this.blocks = blocks;
  }

  /**
   * Run through each step in the transaction and check whether the change
   * occurred within one of the active code blocks.
   */
  private hasChangedBlocks(steps: Step[], threshold = 2) {
    let changes = 0;

    // Urm yeah this is a loop within a loop within a loop and it makes me head hurt.
    for (const { node, pos: from } of this.blocks) {
      let hasChanged = false;
      for (const step of steps) {
        step.getMap().forEach((oldStart, oldEnd) => {
          const to = from + node.nodeSize;
          if (posWithinRange({ from, to, pos: oldStart }) || posWithinRange({ from, to, pos: oldEnd })) {
            hasChanged = true;
          }
        });

        if (hasChanged) {
          break;
        }
      }

      if (hasChanged) {
        changes++;
      }

      if (changes >= threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check that either a new block has been added or more than one block has changed.
   * This is very simplistic and in the future should only update the changed blocks.
   */
  private updateBlocks({ tr }: EditorStateParams & TransactionParams) {
    const blocks = findChildrenByNode({ node: tr.doc, type: this.type });
    if (blocks.length !== this.blocks.length || (blocks.length > 1 && this.hasChangedBlocks(tr.steps))) {
      this.refreshDecorationSet({ blocks, node: tr.doc });
      return false;
    }

    return true;
  }

  /**
   * Apply the state and update decorations when something has changed.
   */
  public apply({ tr, prevState, newState }: ApplyParams) {
    if (!tr.docChanged) {
      return this;
    }

    // Check for multi block changes, if so refresh every codeBlock
    if (!this.updateBlocks({ state: newState, tr })) {
      return this;
    }

    this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);

    const current = getNodeInformationFromState(newState);
    const previous = getNodeInformationFromState(prevState);
    this.manageDecorationSet({ current, previous, tr });

    return this;
  }

  /**
   * Removes all decorations which relate to the changed block node before creating new decorations
   * and adding them to the decorationSet.
   */
  private updateDecorationSet({ nodeInfo: { from, to, node, pos }, tr }: UpdateDecorationSetParams) {
    const decorationSet = this.decorationSet.remove(this.decorationSet.find(from, to));

    this.decorationSet = decorationSet.add(tr.doc, createDecorations([{ node, pos }]));
  }

  private manageDecorationSet({ previous, current, tr }: ManageDecorationSetParams) {
    if (current.type === this.type) {
      this.updateDecorationSet({ nodeInfo: current, tr });
    }
    if (previous.type === this.type && !previous.node.eq(current.node)) {
      this.updateDecorationSet({ nodeInfo: previous, tr });
    }
  }
}

interface ApplyParams extends TransactionParams, CompareStateParams {}
interface RefreshDecorationSetParams extends PMNodeParams {
  /**
   * The positioned nodes
   */
  blocks: NodeWithPosition[];
}

interface ManageDecorationSetParams extends TransactionParams {
  previous: NodeInformation;
  current: NodeInformation;
}

interface UpdateDecorationSetParams extends TransactionParams {
  nodeInfo: NodeInformation;
}

interface NodeInformation extends NodeTypeParams, FromToParams, PMNodeParams, PosParams {}

const getNodeInformationFromState = (state: EditorState): NodeInformation => {
  const { $head } = state.selection;
  const depth = $head.depth;
  const from = $head.start(depth);
  const to = $head.end(depth);
  const node = $head.parent;
  const type = node.type;
  const pos = depth > 0 ? $head.before(depth) : 0;
  return {
    from,
    to,
    type,
    node,
    pos,
  };
};
