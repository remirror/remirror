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
import { DecorationSet } from 'prosemirror-view';
import { createDecorations } from './code-block-utils';

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

  private refreshDecorationSet({ blocks, node }: RefreshDecorationSetParams) {
    const decorations = createDecorations(blocks);
    this.decorationSet = DecorationSet.create(node, decorations);
    this.blocks = blocks;
  }

  /**
   * Currently this is very primitive and simply re-renders all the blocks if more than one block has changed.
   * Or if the length of the blocks has changed.
   */
  private updateBlocks({ tr }: EditorStateParams & TransactionParams) {
    const blocks = findChildrenByNode({ node: tr.doc, type: this.type });
    if (blocks.length !== this.blocks.length) {
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
      console.log('nothing changed');
      return this;
    }

    if (!this.updateBlocks({ state: newState, tr })) {
      console.log('nothing to change');
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
