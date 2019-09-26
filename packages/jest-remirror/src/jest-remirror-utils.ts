import { SchemaParams, isProsemirrorNode, isObject } from '@remirror/core';
import { TestEditorViewParams } from 'jest-prosemirror';
import { coerce, offsetTags } from './jest-remirror-builder';
import { TaggedProsemirrorNode, Tags } from './jest-remirror-types';

interface ProcessTextParams extends SchemaParams {
  /**
   * The content to process text in
   */
  content: string[] | TaggedProsemirrorNode[];
}

const processText = ({ schema, content }: ProcessTextParams) => coerce({ content, schema });

const processNodeMark = (content: TaggedProsemirrorNode) => {
  const nodes = content;
  const tags = ([] as TaggedProsemirrorNode[])
    .concat(content)
    .reduce((acc, node) => ({ ...acc, ...node.tags }), {});
  return { nodes, tags };
};

/**
 * Insert
 */
interface InsertParams extends TestEditorViewParams {
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
export const replaceSelection = ({ view, content }: InsertParams): Tags => {
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
export const isTaggedNode = (val: unknown): val is TaggedProsemirrorNode =>
  isProsemirrorNode(val) && isObject((val as any).tags);
