import {
  ApplySchemaAttributes,
  CommandFunction,
  ErrorConstant,
  extensionDecorator,
  InputRule,
  invariant,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
  Transaction,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

export interface HorizontalRuleOptions {
  /**
   * The name of the node to insert after inserting a horizontalRule.
   *
   * Set to false to prevent adding a node afterwards.
   *
   * @defaultValue `paragraph`
   */
  insertionNode?: string | false;
}

/**
 * Adds a horizontal line to the editor.
 */
@extensionDecorator<HorizontalRuleOptions>({
  defaultOptions: { insertionNode: 'paragraph' },
})
export class HorizontalRuleExtension extends NodeExtension<HorizontalRuleOptions> {
  get name() {
    return 'horizontalRule' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'hr', getAttrs: extra.parse }],
      toDOM: (node) => ['hr', extra.dom(node)],
    };
  }

  createCommands() {
    return {
      /**
       * Inserts a horizontal line into the editor.
       *
       * @remarks
       *
       * TODO: There is currently a bug in Chrome where if the editor is not
       * focused at the point that this is called, the selection jumps to before
       * the first insertion when you start typing. It doesn't happen in Firefox
       * or Safari.
       */
      insertHorizontalRule: (): CommandFunction => (parameter) => {
        const { tr, dispatch } = parameter;
        const initialParent = tr.selection.$anchor.parent;

        if (initialParent.type.name === 'doc' || initialParent.isAtom || initialParent.isLeaf) {
          return false;
        }

        if (!dispatch) {
          return true;
        }

        // Create the horizontal rule.
        tr.replaceSelectionWith(this.type.create());

        this.updateTransaction(tr);
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
          this.updateTransaction(tr);
        },
      }),
    ];
  }

  /**
   * Updates the transaction after a `horizontalRule` has been inserted.
   */
  private updateTransaction(tr: Transaction): void {
    const pos = tr.selection.$anchor.pos + 1;
    const { insertionNode } = this.options;
    const nodes = this.store.schema.nodes;

    if (!insertionNode) {
      return;
    }

    const type = nodes[insertionNode];

    invariant(type, {
      code: ErrorConstant.EXTENSION,
      message: `'${insertionNode}' node provided as the insertionNode to the '${HorizontalRuleExtension.name}' does not exist.`,
    });

    // Insert the new node
    const node = type.create();
    tr.insert(pos, node);

    // Set the new selection to be inside the inserted node.
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
  }
}
