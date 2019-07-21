import { setBlockType } from 'prosemirror-commands';
import { Plugin } from 'prosemirror-state';
import { ExtensionParams } from '../extension';
import { findNodeAtEndOfDoc, FindParentNodeResult, getPluginState, nodeEqualsType } from '../helpers';
import { NodeExtension } from '../node-extension';
import {
  CommandNodeTypeParams,
  NodeExtensionOptions,
  NodeExtensionSpec,
  NodeTypeParams,
  SchemaNodeTypeParams,
} from '../types';

export interface ParagraphExtensionOptions extends NodeExtensionOptions {
  /**
   * Ensure that there's always a trailing paragraph at the end of the document.
   *
   * Why? In some scenarios it is difficult to place a cursor after the last element.
   * This ensures there's always space to select the position afterward.
   *
   * @default false
   */
  ensureTrailingParagraph?: boolean;
}

export class ParagraphExtension extends NodeExtension<ParagraphExtensionOptions, 'createParagraph', {}> {
  get name() {
    return 'paragraph' as const;
  }

  get defaultOptions() {
    return {
      ensureTrailingParagraph: false,
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
        },
      ],
      toDOM: () => ['p', 0],
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return {
      createParagraph: () => {
        return setBlockType(type);
      },
    };
  }

  public plugin({ type }: SchemaNodeTypeParams): Plugin {
    return createParagraphPlugin({ extension: this, type });
  }
}

/**
 * False when there is already a paragraph at the end of the document.
 *
 * The result of the find node when the node needs to be replaced.
 */
type ParagraphExtensionPluginState = false | FindParentNodeResult;

interface CreateParagraphPluginParams extends NodeTypeParams, ExtensionParams {}

/**
 * Create the paragraph plugin which can check the end of the document and insert a new node if the option
 * `ensureTrailingParagraph` is set to true.
 */
const createParagraphPlugin = ({ extension, type }: CreateParagraphPluginParams) => {
  const { options, pluginKey } = extension;
  const { ensureTrailingParagraph } = options;

  return new Plugin<ParagraphExtensionPluginState>({
    key: extension.pluginKey,
    view() {
      return {
        update: view => {
          const insertParagraphAtEnd = getPluginState<ParagraphExtensionPluginState>(pluginKey, view.state);

          if (!insertParagraphAtEnd || !ensureTrailingParagraph) {
            return;
          }

          const { pos, node } = insertParagraphAtEnd;
          view.dispatch(view.state.tr.insert(pos + node.nodeSize, type.create()));
        },
      };
    },
    state: {
      init: (_, state) => {
        const result = findNodeAtEndOfDoc(state.tr.doc);
        return nodeEqualsType({ node: result.node, types: type }) ? false : result;
      },
      apply: (tr, state) => {
        if (!tr.docChanged) {
          return state;
        }

        const result = findNodeAtEndOfDoc(tr.doc);
        return nodeEqualsType({ node: result.node, types: type }) ? false : result;
      },
    },
  });
};
