import {
  ApplySchemaAttributes,
  CommandFunction,
  ErrorConstant,
  extension,
  ExtensionTag,
  InputRule,
  invariant,
  isEmptyBlockNode,
  isNodeSelection,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  Transaction,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

export interface HorizontalRuleOptions {
  /**
   * The name of the node to insert after inserting a horizontalRule.
   *
   * Set to false to prevent adding a node afterwards.
   *
   * @default 'paragraph'
   */
  insertionNode?: string | false;
}

/**
 * Adds a horizontal line to the editor.
 */
@extension<HorizontalRuleOptions>({
  defaultOptions: { insertionNode: 'paragraph' },
})
export class HorizontalRuleExtension extends NodeExtension<HorizontalRuleOptions> {
  get name() {
    return 'horizontalRule' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'hr', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['hr', extra.dom(node)],
    };
  }

  createCommands() {
    return {
      /**
       * Inserts a horizontal line into the editor.
       */
      insertHorizontalRule: (): CommandFunction => (props) => {
        const { tr, dispatch } = props;
        const $pos = tr.selection.$anchor;
        const initialParent = $pos.parent;

        if (initialParent.type.name === 'doc' || initialParent.isAtom || initialParent.isLeaf) {
          return false;
        }

        if (!dispatch) {
          return true;
        }

        // A boolean value that is true when the current node is empty and
        // should be duplicated before the replacement of the current node by
        // the `hr`.
        const shouldDuplicateEmptyNode = tr.selection.empty && isEmptyBlockNode(initialParent);

        // When the node should eb duplicated add it to the position after
        // before the replacement.
        if (shouldDuplicateEmptyNode) {
          tr.insert($pos.pos + 1, initialParent);
        }

        // Create the horizontal rule by replacing the selection
        tr.replaceSelectionWith(this.type.create());

        // Update the selection if currently pointed at the node.
        this.updateFromNodeSelection(tr);

        dispatch(tr.scrollIntoView());

        return true;
      },
    };
  }

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^(?:---|___\s|\*\*\*\s)$/,
        type: this.type,
        beforeDispatch: ({ tr }) => {
          // Update to using a text selection.
          this.updateFromNodeSelection(tr);
        },
      }),
    ];
  }

  /**
   * Updates the transaction after a `horizontalRule` has been inserted to make
   * sure the currently selected node isn't a Horizontal Rule.
   *
   * This should only be called for empty selections.
   */
  private updateFromNodeSelection(tr: Transaction): void {
    // Make sure  the `horizontalRule` that is selected. Otherwise do nothing.
    if (!isNodeSelection(tr.selection) || tr.selection.node.type.name !== this.name) {
      return;
    }

    // Get the position right after the current selection for inserting the
    // node.
    const pos = tr.selection.$from.pos + 1;
    const { insertionNode } = this.options;

    // If `insertionNode` was set to false, then don't insert anything.
    if (!insertionNode) {
      return;
    }

    const type = this.store.schema.nodes[insertionNode];

    invariant(type, {
      code: ErrorConstant.EXTENSION,
      message: `'${insertionNode}' node provided as the insertionNode to the '${this.constructorName}' does not exist.`,
    });

    // Insert the new node
    const node = type.create();
    tr.insert(pos, node);

    // Set the new selection to be inside the inserted node.
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      horizontalRule: HorizontalRuleExtension;
    }
  }
}
