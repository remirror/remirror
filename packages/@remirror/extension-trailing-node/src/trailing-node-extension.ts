import {
  CreatePluginReturn,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  entries,
  HandlerKeyList,
  nodeEqualsType,
  OnSetOptionsParameter,
  PlainExtension,
  StaticKeyList,
  uniqueArray,
} from '@remirror/core';

export interface TrailingNodeOptions {
  /**
   * The node to create at the end of the document.
   *
   * **Note**: the nodeName will always be added to the ignoredNodes lists to
   * prevent an infinite loop.
   *
   * @defaultValue 'paragraph'
   */
  nodeName?: string;

  /**
   * The nodes for which this rule should not apply.
   */
  ignoredNodes?: string[];

  /**
   * By default this extension will set trailing nodes for all nodes except for
   * the ones that have the tag `Tags.LastNodeCompatible`. Setting this to true
   * means that the only nodes that will be ignored are those passed to the
   * `ignoredNodes` array.
   *
   * @defaultValue false
   */
  disableTags?: boolean;
}

/**
 * Ensure that there's always a trailing paragraph at the end of the document.
 *
 * Why? In some scenarios it is difficult to place a cursor after the last element.
 * This ensures there's always space to select the position afterward.
 *
 */
export class TrailingNodeExtension extends PlainExtension<TrailingNodeOptions> {
  static readonly staticKeys: StaticKeyList<TrailingNodeOptions> = [];
  static readonly handlerKeys: HandlerKeyList<TrailingNodeOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<TrailingNodeOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<TrailingNodeOptions> = {
    ignoredNodes: [],
    disableTags: false,
    nodeName: 'paragraph',
  };

  get name() {
    return 'trailingNode' as const;
  }

  /**
   * Whenever the options are changed make sure to update the plugin with the
   * new values and trigger a state update.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<TrailingNodeOptions>) {
    const { changes } = parameter;

    if (changes.disableTags || changes.ignoredNodes || changes.nodeName) {
      this.store.updateExtensionPlugins(this);
      this.store.reconfigureStatePlugins();
    }
  }

  /**
   * Create the paragraph plugin which can check the end of the document and
   * insert a new node.
   */
  createPlugin = (): CreatePluginReturn<boolean> => {
    const { tags, schema } = this.store;
    const { disableTags, ignoredNodes, nodeName } = this.options;

    // The names of the nodes for which this rule should not be applied.
    const notAfter: string[] = disableTags
      ? uniqueArray([...ignoredNodes, nodeName])
      : uniqueArray([...ignoredNodes, ...tags.general.lastNodeCompatible, nodeName]);

    // The node that will be inserted when the criteria match.
    const type = this.store.schema.nodes[nodeName];

    // The list of nodes for this schema that should have content injected after
    // them.
    const types = entries(schema.nodes)
      .map(([, entry]) => entry)
      .filter((entry) => !notAfter.includes(entry.name));

    return {
      view: () => {
        return {
          update: (view) => {
            const { state, dispatch } = view;
            const { doc } = state;
            const shouldInsertNodeAtEnd = this.getPluginState<boolean>(state);
            const endPosition = doc.content.size;

            if (!shouldInsertNodeAtEnd) {
              return;
            }

            dispatch(state.tr.insert(endPosition, type.create()));
          },
        };
      },
      state: {
        init: (_, state) => {
          const node = state.tr.doc.lastChild;
          return nodeEqualsType({ node, types });
        },
        apply: (tr, state) => {
          if (!tr.docChanged) {
            return state;
          }

          const node = tr.doc.lastChild;
          return nodeEqualsType({ node, types });
        },
      },
    };
  };
}
