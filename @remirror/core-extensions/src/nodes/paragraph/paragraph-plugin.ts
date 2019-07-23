import {
  ExtensionParams,
  findNodeAtEndOfDoc,
  getPluginState,
  nodeEqualsType,
  NodeTypeParams,
} from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { ShouldInsertParagraphAtEnd } from './paragraph-types';

interface CreateParagraphPluginParams extends NodeTypeParams, ExtensionParams {}

/**
 * Create the paragraph plugin which can check the end of the document and insert a new node if the option
 * `ensureTrailingParagraph` is set to true.
 */
export const createParagraphPlugin = ({ extension, type }: CreateParagraphPluginParams) => {
  const { options, pluginKey } = extension;
  const { ensureTrailingParagraph } = options;

  return new Plugin<ShouldInsertParagraphAtEnd>({
    key: extension.pluginKey,
    view() {
      return {
        update: view => {
          const shouldInsertParagraphAtEnd = getPluginState<ShouldInsertParagraphAtEnd>(
            pluginKey,
            view.state,
          );

          if (!shouldInsertParagraphAtEnd || !ensureTrailingParagraph) {
            return;
          }

          const { pos, node } = shouldInsertParagraphAtEnd;
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
