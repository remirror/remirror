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
       */
      insertHorizontalRule: (): CommandFunction => (parameter) => {
        const { tr, dispatch, state } = parameter;

        if (!dispatch) {
          return true;
        }

        // Create the horizontal rule.
        tr.replaceSelectionWith(this.type.create());

        const pos = tr.selection.$anchor.pos + 1;
        const { insertionNode } = this.options;
        const nodes = state.schema.nodes;

        if (insertionNode) {
          const type = nodes[insertionNode];

          invariant(type, {
            code: ErrorConstant.EXTENSION,
            message: `'${insertionNode}' node provided as the insertionNode to the '${HorizontalRuleExtension.name}' does not exist.`,
          });

          // Insert the new node and set the selection inside that node.
          tr.insert(pos, state.schema.nodes[insertionNode].create()).setSelection(
            TextSelection.create(tr.doc, pos),
          );
        }

        dispatch(tr.scrollIntoView());

        return true;
      },
    };
  }

  createInputRules(): InputRule[] {
    return [nodeInputRule({ regexp: /^(?:---|___\s|\*\*\*\s)$/, type: this.type })];
  }
}
