import {
  CompareStateParams,
  EditorState,
  ExtensionManagerNodeTypeParams,
  findChildrenByNode,
  nodeEqualsType,
  NodeExtension,
  NodeType,
  NodeWithPosition,
  ProsemirrorNodeParams,
  Transaction,
  TransactionParams,
} from '@remirror/core';
import { keydownHandler } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { DecorationSet } from 'prosemirror-view';
import { CodeBlockExtensionOptions } from './code-block-types';
import {
  createDecorations,
  getNodeInformationFromState,
  lengthHasChanged,
  NodeInformation,
  posWithinRange,
} from './code-block-utils';

export class CodeBlockState {
  /**
   * Keep track of all document codeBlocks
   */
  private blocks: NodeWithPosition[] = [];

  /**
   * The set of cached decorations to minimise dom updates
   */
  public decorationSet!: DecorationSet;

  private deleted = false;

  constructor(private readonly type: NodeType) {}

  /**
   * Creates the initial set of decorations
   */
  public init(state: EditorState) {
    const blocks = findChildrenByNode({ node: state.doc, type: this.type });
    this.refreshDecorationSet({ blocks, node: state.doc });

    return this;
  }

  /**
   * Recreate all the decorations again for all the provided blocks.
   */
  private refreshDecorationSet({ blocks, node }: RefreshDecorationSetParams) {
    const decorations = createDecorations({ blocks, skipLast: this.deleted });
    this.decorationSet = DecorationSet.create(node, decorations);
    this.blocks = blocks;
  }

  /**
   * Run through each step in the transaction and check whether the change
   * occurred within one of the active code blocks.
   *
   * TODO this should actually be used to update the decorations for the blocks.
   */
  private numberOfChangedBlocks(steps: Step[]) {
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
    }

    return changes;
  }

  /**
   * True when number of blocks in the document has changed.
   */
  private sizeHasChanged(blocks: NodeWithPosition[]) {
    return lengthHasChanged(blocks, this.blocks);
  }

  /**
   * True when more than one codeBlock has changed content.
   */
  private multipleChangesToBlocks(blocks: NodeWithPosition[], tr: Transaction) {
    return blocks.length > 1 && this.numberOfChangedBlocks(tr.steps) >= 2;
  }

  /**
   * Apply the state and update decorations when something has changed.
   */
  public apply({ tr, oldState, newState }: ApplyParams): this {
    if (!tr.docChanged) {
      return this;
    }

    // Get all the codeBlocks in the document
    const blocks = findChildrenByNode({ node: tr.doc, type: this.type });

    this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);

    if (
      // When the number of blocks has changed since the last content update
      this.sizeHasChanged(blocks) ||
      // When there are multiple blocks and 2 or more blocks have changed
      this.multipleChangesToBlocks(blocks, tr)
    ) {
      this.refreshDecorationSet({ blocks, node: tr.doc });
    } else {
      const current = getNodeInformationFromState(newState);
      const previous = getNodeInformationFromState(oldState);
      this.manageDecorationSet({ current, previous, tr });
    }

    return this;
  }

  /**
   * Removes all decorations which relate to the changed block node before creating new decorations
   * and adding them to the decorationSet.
   */
  private updateDecorationSet({ nodeInfo: { from, to, node, pos }, tr }: UpdateDecorationSetParams) {
    const decorationSet = this.decorationSet.remove(this.decorationSet.find(from, to));
    this.decorationSet = decorationSet.add(
      tr.doc,
      createDecorations({ blocks: [{ node, pos }], skipLast: this.deleted }),
    );
  }

  private manageDecorationSet({ previous, current, tr }: ManageDecorationSetParams) {
    // Update the previous first although this could be buggy when deleting (possibly)
    if (nodeEqualsType({ types: this.type, node: previous.node }) && !previous.node.eq(current.node)) {
      this.updateDecorationSet({ nodeInfo: previous, tr });
    }

    if (current.type === this.type) {
      this.updateDecorationSet({ nodeInfo: current, tr });
    }
  }

  public setDeleted(deleted: boolean) {
    // this._deleted = deleted ? DELETED_THRESHOLD : this._deleted <= 0 ? 0 : this._deleted - 1;
    this.deleted = deleted;
  }
}

interface ApplyParams extends TransactionParams, CompareStateParams {}
interface RefreshDecorationSetParams extends ProsemirrorNodeParams {
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

interface CreateCodeBlockPluginParams extends ExtensionManagerNodeTypeParams {
  extension: NodeExtension<CodeBlockExtensionOptions>;
}

/**
 * Create a codeBlock plugin to manage the internal prosemirror functionality
 */
export default function createCodeBlockPlugin({ extension, type }: CreateCodeBlockPluginParams) {
  const pluginState = new CodeBlockState(type);
  const handler = () => {
    pluginState.setDeleted(true);
    return false;
  };

  return new Plugin<CodeBlockState>({
    key: extension.pluginKey,
    state: {
      init(_, state) {
        return pluginState.init(state);
      },
      apply(tr, _, oldState, newState) {
        return pluginState.apply({ tr, oldState, newState });
      },
    },
    props: {
      handleKeyDown: keydownHandler({
        Backspace: handler,
        'Mod-Backspace': handler,
        Delete: handler,
        'Mod-Delete': handler,
        'Ctrl-h': handler,
        'Alt-Backspace': handler,
        'Ctrl-d': handler,
        'Ctrl-Alt-Backspace': handler,
        'Alt-Delete': handler,
        'Alt-d': handler,
      }),
      // handleDOMEvents:
      decorations() {
        pluginState.setDeleted(false);
        return pluginState.decorationSet;
      },
    },
  });
}
