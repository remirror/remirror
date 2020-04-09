import { TestEditorViewParameter } from 'jest-prosemirror';

import { isObject, isProsemirrorNode, SchemaParameter } from '@remirror/core';

import { coerce, offsetTags } from './jest-remirror-builder';
import { TaggedProsemirrorNode, Tags } from './jest-remirror-types';

interface ProcessTextParameter extends SchemaParameter {
  /**
   * The content to process text in
   */
  content: string[] | TaggedProsemirrorNode[];
}

const processText = ({ schema, content }: ProcessTextParameter) => coerce({ content, schema });

const processNodeMark = (content: TaggedProsemirrorNode) => {
  const nodes = content;
  const tags = ([] as TaggedProsemirrorNode[])
    .concat(content)
    .reduce((accumulator, node) => ({ ...accumulator, ...node.tags }), {});
  return { nodes, tags };
};

/**
 * Insert
 */
interface InsertParameter extends TestEditorViewParameter {
  /**
   * The content to replace the current selection with
   * This can be strings a node or an array of nodes.
   */
  content: string[] | TaggedProsemirrorNode | TaggedProsemirrorNode[];
}

/**
 * Replace the current selection with the given content, which may be
 * string, a fragment, node, or array of nodes.
 *
 * @param params
 * @param params.view
 * @param params.content
 */
export const replaceSelection = ({ view, content }: InsertParameter): Tags => {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, tags } = Array.isArray(content)
    ? processText({ schema: state.schema, content })
    : processNodeMark(content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetTags(tags, from);
};

/**
 * Check if a node is tagged.
 */
export const isTaggedNode = (value: unknown): val is TaggedProsemirrorNode =>
  isProsemirrorNode(value) && isObject((value as any).tags);
