import { NodeType, Schema as EditorSchema } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { includes, uniqueArray } from '@remirror/core-helpers';

export interface TrailingNodePluginOptions {
  /**
   * The node to create at the end of the document.
   *
   * **Note**: the nodeName will always be added to the `ignoredNodes` lists to
   * prevent an infinite loop.
   *
   * @default 'paragraph'
   */
  nodeName?: string;

  /**
   * The nodes for which this rule should not apply.
   */
  ignoredNodes?: string[];
}

const trailingNodePluginKey = new PluginKey<boolean>('trailingNode');

/**
 * This creates the plugin for trailing node.
 *
 * ```ts
 * import { schema } from 'prosemirror-schema-basic';
 * import { trailingNode } from 'prosemirror-trailing-node';
 *
 * // Include the plugin in the created editor state.
 * const state = EditorState.create({
 *   schema,
 *   plugins: [trailingNode({ ignoredNodes: [], nodeName: 'paragraph' })],
 * });
 * ```
 *
 * @param options - the options that can be provided to this plugin.
 */
export function trailingNode<
  Schema extends EditorSchema<string, string> = EditorSchema<string, string>,
>(options?: TrailingNodePluginOptions): Plugin<boolean, Schema> {
  const { ignoredNodes = [], nodeName = 'paragraph' } = options ?? {};

  // The names of the nodes for which this rule should not be applied.
  const ignoredNodeNames: string[] = uniqueArray([...ignoredNodes, nodeName]);

  // The node that will be inserted when the criteria match.
  let type: NodeType;

  // The list of nodes for this schema that should have content injected after
  // them.
  let types: NodeType[];

  return new Plugin<boolean, Schema>({
    key: trailingNodePluginKey,
    appendTransaction(_, __, state) {
      const { doc, tr } = state;
      const shouldInsertNodeAtEnd = trailingNodePluginKey.getState(state);
      const endPosition = doc.content.size;

      if (!shouldInsertNodeAtEnd) {
        return;
      }

      return tr.insert(endPosition, type.create());
    },
    state: {
      init: (_, { doc, schema }) => {
        const nodeType = schema.nodes[nodeName];

        if (!nodeType) {
          throw new Error(`Invalid node being used for trailing node extension: '${nodeName}'`);
        }

        // Save the type for continued use.
        type = nodeType;
        types = Object.values(schema.nodes)
          .map((node) => node)
          .filter((node) => !ignoredNodeNames.includes(node.name));

        return includes(types, doc.lastChild?.type);
      },
      apply: (tr, value) => {
        if (!tr.docChanged) {
          return value;
        }

        return includes(types, tr.doc.lastChild?.type);
      },
    },
  });
}
