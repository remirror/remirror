import type { TestEditorViewProps } from 'jest-prosemirror';
import {
  isNumber,
  isObject,
  isProsemirrorNode,
  ProsemirrorNode,
  SchemaProps,
} from '@remirror/core';
import { AllSelection, NodeSelection, Selection, TextSelection } from '@remirror/pm/state';

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

export function createSelectionFromTaggedDocument(
  doc: ProsemirrorNode,
  tags: Tags,
): Selection | null {
  const { cursor, node, start, end, all, anchor, head } = tags;

  if (isNumber(cursor)) {
    return TextSelection.near(doc.resolve(cursor));
  } else if (isNumber(start)) {
    return TextSelection.between(
      doc.resolve(start),
      doc.resolve(isNumber(end) && start <= end ? end : doc.resolve(start).end()),
    );
  } else if (isNumber(head) && isNumber(anchor)) {
    return TextSelection.between(doc.resolve(anchor), doc.resolve(head));
  } else if (isNumber(node)) {
    return NodeSelection.create(doc, doc.resolve(node).before());
  } else if (isNumber(all)) {
    return new AllSelection(doc);
  }

  return null;
}
