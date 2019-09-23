import { Extension, ExtensionParams } from '@remirror/core';
import { entries, uniqueArray } from '@remirror/core-helpers';
import {
  BaseExtensionOptions,
  ExtensionManagerParams,
  ExtensionTagParams,
  SchemaParams,
} from '@remirror/core-types';
import { getPluginState, nodeEqualsType } from '@remirror/core-utils';
import { Plugin } from 'prosemirror-state';

export interface TrailingNodeExtensionOptions extends BaseExtensionOptions {
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
 * True when a new node needs to be inserted at the end of the document.
 */
export type ShouldInsertNodeAtEnd = boolean;

export const defaultTrailingNodeExtensionOptions: TrailingNodeExtensionOptions = {
  ignoredNodes: [],
  disableTags: false,
  nodeName: 'paragraph',
};

/**
 * Ensure that there's always a trailing paragraph at the end of the document.
 *
 * Why? In some scenarios it is difficult to place a cursor after the last element.
 * This ensures there's always space to select the position afterward.
 *
 * @defaultValue false
 */
export class TrailingNodeExtension extends Extension<TrailingNodeExtensionOptions> {
  get name() {
    return 'trailingNode' as const;
  }

  get defaultOptions() {
    return defaultTrailingNodeExtensionOptions;
  }

  /**
   * Register the plugin which is responsible for inserting the configured node
   * into the end of the node.
   */
  public plugin({ tags, schema }: ExtensionManagerParams) {
    return createTrailingNodePlugin({ extension: this, tags, schema });
  }
}

interface CreateTrailingNodePluginParams
  extends ExtensionTagParams,
    ExtensionParams<TrailingNodeExtension>,
    SchemaParams {}

/**
 * Create the paragraph plugin which can check the end of the document and
 * insert a new node.
 */
export const createTrailingNodePlugin = ({ extension, tags, schema }: CreateTrailingNodePluginParams) => {
  const { options, pluginKey } = extension;
  const { disableTags, ignoredNodes, nodeName } = options;

  // The names of the nodes for whom this rule should not be applied.
  const notAfter: string[] = disableTags
    ? uniqueArray([...ignoredNodes, nodeName])
    : uniqueArray([...ignoredNodes, ...tags.general.lastNodeCompatible, nodeName]);

  // The node that will be inserted when the criteria match.
  const type = schema.nodes[nodeName];

  // The list of nodes for this schema that should have content injected after
  // them.
  const types = entries(schema.nodes)
    .map(([, entry]) => entry)
    .filter(entry => !notAfter.includes(entry.name));

  return new Plugin<ShouldInsertNodeAtEnd>({
    key: extension.pluginKey,
    view() {
      return {
        update: view => {
          const { state, dispatch } = view;
          const { doc } = state;
          const shouldInsertNodeAtEnd = getPluginState<ShouldInsertNodeAtEnd>(pluginKey, state);
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
  });
};
