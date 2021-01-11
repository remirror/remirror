import {
  EditorState,
  findChildrenByNode,
  getChangedNodes,
  NodeExtension,
  NodeType,
  NodeWithPosition,
  ProsemirrorNode,
  Transaction,
} from '@remirror/core';
import { DecorationSet } from '@remirror/pm/view';

import type { CodeBlockOptions } from './code-block-types';
import { createDecorations } from './code-block-utils';

export class CodeBlockState {
  #extension: NodeExtension<CodeBlockOptions>;

  /**
   * Keep track of the node type of the `codeBlock`
   */
  readonly #type: NodeType;

  /**
   * Tracks whether or not a deletion has occurred.
   */
  #deleted = false;

  /**
   * The set of cached decorations to minimize dom updates
   */
  decorationSet!: DecorationSet;

  constructor(type: NodeType, extension: NodeExtension<CodeBlockOptions>) {
    this.#type = type;
    this.#extension = extension;
  }

  /**
   * Creates the initial set of decorations
   */
  init(state: EditorState): this {
    // Find all the `codeBlocks` in the editor.
    const blocks = findChildrenByNode({ node: state.doc, type: this.#type });

    // Update the `codeBlocks` with the relevant syntax highlighting.
    this.refreshDecorationSet(state.doc, blocks);

    return this;
  }

  /**
   * Recreate all the decorations again for all the provided blocks.
   */
  private refreshDecorationSet(doc: ProsemirrorNode, blocks: NodeWithPosition[]) {
    const decorations = createDecorations({
      blocks,
      skipLast: this.#deleted,
      defaultLanguage: this.#extension.options.defaultLanguage,
      plainTextClassName: this.#extension.options.plainTextClassName ?? undefined,
    });

    // Store the decoration set to be applied to the editor by the plugin.
    this.decorationSet = DecorationSet.create(doc, decorations);
  }

  /**
   * Apply the state and update decorations when a change has happened in the
   * editor.
   */
  apply(tr: Transaction, _: EditorState): this {
    if (!tr.docChanged) {
      return this;
    }

    this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);

    // I was thinking I would need to check for deletions, but, since the
    // `decorationSet` is mapped over the previous change all decorations from a
    // deleted node will automatically be deleted. All that is needed is to find
    // the changed nodes and update their decorations.
    const changedNodes = getChangedNodes(tr, {
      descend: true,
      predicate: (node) => node.type === this.#type,
      StepTypes: [],
    });
    this.updateDecorationSet(tr, changedNodes);

    return this;
  }

  /**
   * Removes all decorations which relate to the changed block node before creating new decorations
   * and adding them to the decorationSet.
   */
  private updateDecorationSet(tr: Transaction, blocks: NodeWithPosition[]) {
    if (blocks.length === 0) {
      return;
    }

    let decorationSet = this.decorationSet;

    for (const { node, pos } of blocks) {
      decorationSet = this.decorationSet.remove(this.decorationSet.find(pos, pos + node.nodeSize));
    }

    this.decorationSet = decorationSet.add(
      tr.doc,
      createDecorations({
        blocks,
        skipLast: this.#deleted,
        defaultLanguage: this.#extension.options.defaultLanguage,
        plainTextClassName: this.#extension.options.plainTextClassName ?? undefined,
      }),
    );
  }

  /**
   * Flags that a deletion has just occurred.
   */
  setDeleted(deleted: boolean): void {
    this.#deleted = deleted;
  }
}
