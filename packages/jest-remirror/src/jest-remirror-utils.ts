import type { TestEditorViewProps } from 'jest-prosemirror';
import { isObject, isProsemirrorNode, SchemaProps } from '@remirror/core';

import { coerce, offsetTags } from './jest-remirror-builder';
import type { TaggedProsemirrorNode, Tags } from './jest-remirror-types';

interface ProcessTextProps extends SchemaProps {
  /**
   * The content to process text in
   */
  content: string[] | TaggedProsemirrorNode[];
}

function processText({ schema, content }: ProcessTextProps) {
  return coerce({ content, schema });
}

function processNodeMark(content: TaggedProsemirrorNode) {
  const nodes = content;

  return { nodes, tags: { ...content.tags } };
}

/**
 * Insert
 */
interface InsertProps extends TestEditorViewProps {
  /**
   * The content to replace the current selection with
   * This can be strings a node or an array of nodes.
   */
  content: string[] | TaggedProsemirrorNode | TaggedProsemirrorNode[];
}

/**
 * Replace the current selection with the given content, which may be
 * string, a fragment, node, or array of nodes.
 */
export function replaceSelection(props: InsertProps): Tags {
  const { view, content } = props;
  const { state } = view;
  const { from, to } = state.selection;

  const { nodes, tags } = Array.isArray(content)
    ? processText({ schema: state.schema, content })
    : processNodeMark(content);

  const tr = state.tr.replaceWith(from, to, nodes);

  view.dispatch(tr);

  return offsetTags(tags, from);
}

/**
 * Check if a node is tagged.
 */
export function isTaggedNode(value: unknown): value is TaggedProsemirrorNode {
  return isProsemirrorNode(value) && isObject((value as any).tags);
}
