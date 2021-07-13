import pm, {
  MarkTypeAttributes,
  NodeTypeAttributes,
  TaggedProsemirrorNode,
} from 'prosemirror-test-builder';
import { Cast, isNumber, keys } from '@remirror/core-helpers';
import type { EditorSchema, ProsemirrorPlugin } from '@remirror/core-types';
import { GapCursor } from '@remirror/pm/gapcursor';
import {
  AllSelection,
  EditorState,
  NodeSelection,
  Selection,
  TextSelection,
} from '@remirror/pm/state';
import { cellAround, CellSelection } from '@remirror/pm/tables';

import { schema } from './jest-prosemirror-schema';
import type { TaggedDocProps } from './jest-prosemirror-types';

/**
 * Table specific cell resolution
 *
 * @param taggedDoc
 * @param [tag]
 */
function resolveCell(taggedDoc: TaggedProsemirrorNode, tag?: number) {
  if (!tag) {
    return null;
  }

  return cellAround(taggedDoc.resolve(tag));
}

interface CreateTextSelectionProps<Schema extends EditorSchema = EditorSchema>
  extends TaggedDocProps<Schema> {
  start: number;
  end?: number;
}

/**
 * Create a text selection from start to end
 *
 * @param param
 * @param param.taggedDoc
 * @param param.start
 * @param param.end
 */
function createTextSelection<Schema extends EditorSchema = EditorSchema>({
  taggedDoc,
  start,
  end,
}: CreateTextSelectionProps<Schema>) {
  const $start = taggedDoc.resolve(start);
  const $end = end && start <= end ? taggedDoc.resolve(end) : taggedDoc.resolve($start.end());
  return new TextSelection<Schema>($start, $end);
}

const supportedTags = new Set(['cursor', 'node', 'start', 'end', 'anchor', 'all', 'gap']);

/**
 * Checks that the tagged doc has a selection
 *
 * @param taggedDoc
 */
export function taggedDocHasSelection(taggedDoc: TaggedProsemirrorNode): boolean {
  return keys(taggedDoc.tag).some((tag) => supportedTags.has(tag));
}

/**
 * Initialize the selection based on the passed in tagged node via it's cursor.
 *
 * The supported tags are `['cursor', 'node', 'start', 'end', 'anchor', 'all']`
 *
 * @param taggedDoc
 */
export function initSelection<Schema extends EditorSchema = EditorSchema>(
  taggedDoc: TaggedProsemirrorNode<Schema>,
): Selection<Schema> | null {
  const { cursor, node, start, end, anchor, head, all, gap } = taggedDoc.tag;

  if (isNumber(all)) {
    return new AllSelection<Schema>(taggedDoc);
  }

  if (isNumber(node)) {
    return NodeSelection.create<Schema>(taggedDoc, taggedDoc.resolve(node).before());
  }

  if (isNumber(cursor)) {
    return new TextSelection<Schema>(taggedDoc.resolve(cursor));
  }

  if (isNumber(gap)) {
    const $pos = taggedDoc.resolve(gap);
    return new GapCursor($pos, $pos);
  }

  if (isNumber(anchor) && isNumber(head)) {
    return TextSelection.create(taggedDoc, anchor, head);
  }

  if (isNumber(start)) {
    return createTextSelection({ taggedDoc, start, end });
  }

  if (isNumber(anchor)) {
    const $anchor = resolveCell(taggedDoc, anchor);

    if ($anchor) {
      return Cast<Selection<Schema>>(
        new CellSelection<Schema>($anchor, resolveCell(taggedDoc, head) ?? undefined),
      );
    }
  }

  return null;
}

/**
 * Returns a selection regardless of whether anything is tagged in the provided doc
 *
 * @param taggedDoc
 */
export function selectionFor<Schema extends EditorSchema = EditorSchema>(
  taggedDoc: TaggedProsemirrorNode<Schema>,
): Selection<Schema> {
  return initSelection(taggedDoc) ?? Selection.atStart(taggedDoc);
}

/**
 * Create the editor state for a tagged prosemirror doc
 *
 * @param taggedDoc
 */
export function createState<Schema extends EditorSchema = EditorSchema>(
  taggedDoc: TaggedProsemirrorNode<Schema>,
  plugins: ProsemirrorPlugin[] = [],
): EditorState<Schema> {
  return EditorState.create({
    doc: taggedDoc,
    selection: initSelection(taggedDoc),
    schema,
    plugins,
  });
}

/**
 * A short hand way for building prosemirror test builders with the core nodes already provided
 * - `doc`
 * - `paragraph` | 'p'
 * - `text`
 *
 * @param testSchema - The schema to use which provided a doc, paragraph and text schema
 * @param names - the extra marks and nodes to provide with their attributes
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function pmBuild<
  Type extends Record<string, NodeTypeAttributes | MarkTypeAttributes> = Record<
    string,
    NodeTypeAttributes | MarkTypeAttributes
  >,
  Nodes extends string = string,
  Marks extends string = string,
>(testSchema: EditorSchema<Nodes, Marks>, names: Type) {
  return pm.builders(testSchema, {
    doc: { nodeType: 'doc' },
    p: { nodeType: 'paragraph' },
    text: { nodeType: 'text' },
    ...names,
  });
}

const built = pm.builders(schema, {
  doc: { nodeType: 'doc' },
  p: { nodeType: 'paragraph' },
  text: { nodeType: 'text' },
  atomInline: { nodeType: 'atomInline' },
  atomBlock: { nodeType: 'atomBlock' },
  atomContainer: { nodeType: 'atomContainer' },
  li: { nodeType: 'listItem' },
  ul: { nodeType: 'bulletList' },
  ol: { nodeType: 'orderedList' },
  table: { nodeType: 'table' },
  tr: { nodeType: 'table_row' },
  td: { nodeType: 'table_cell' },
  th: { nodeType: 'table_cell' },
  blockquote: { nodeType: 'blockquote' },
  h1: { nodeType: 'heading', level: 1 },
  h2: { nodeType: 'heading', level: 2 },
  h3: { nodeType: 'heading', level: 3 },
  h4: { nodeType: 'heading', level: 4 },
  h5: { nodeType: 'heading', level: 5 },
  h6: { nodeType: 'heading', level: 6 },
  a: { markType: 'link', href: 'foo' },
  strong: { markType: 'strong' },
  em: { markType: 'em' },
  code: { markType: 'code' },
});

export const {
  a,
  li,
  ul,
  ol,
  atomBlock,
  atomContainer,
  atomInline,
  blockquote,
  code,
  containerWithRestrictedContent,
  doc,
  em,
  link,
  p,
  paragraph,
  strong,
  table,
  td,
  text,
  th,
  tr,
  horizontalRule,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  table_cell: tableCell,
  table_header: tableHeaderCell,
  table_row: tableRow,
  code_block: codeBlock,
  hard_break: hardBreak,
  image,
  heading,
} = built;

export const tdEmpty = td(p());
export const thEmpty = th(p());
export const tdCursor = td(p('<cursor>'));
export const thCursor = th(p('<cursor>'));

export { pm };
