import { Cast, EditorSchema, Plugin } from '@remirror/core';
import { GapCursor } from 'prosemirror-gapcursor';
import { Schema } from 'prosemirror-model';
import { AllSelection, EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import { cellAround, CellSelection } from 'prosemirror-tables';
import pm, { MarkTypeAttributes, NodeTypeAttributes, TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { schema } from './jest-prosemirror-schema';
import { TaggedDocParams } from './jest-prosemirror-types';

/**
 * Table specific cell resolution
 *
 * @param taggedDoc
 * @param [tag]
 */
const resolveCell = (taggedDoc: TaggedProsemirrorNode, tag?: number) => {
  if (!tag) {
    return null;
  }
  return cellAround(taggedDoc.resolve(tag));
};

interface CreateTextSelectionParams<GSchema extends EditorSchema = any> extends TaggedDocParams<GSchema> {
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
const createTextSelection = <GSchema extends EditorSchema = any>({
  taggedDoc,
  start,
  end,
}: CreateTextSelectionParams<GSchema>) => {
  const $start = taggedDoc.resolve(start);
  const $end = end && start <= end ? taggedDoc.resolve(end) : taggedDoc.resolve($start.end());
  return new TextSelection<GSchema>($start, $end);
};

const supportedTags = ['cursor', 'node', 'start', 'end', 'anchor', 'all', 'gap'];

/**
 * Checks that the tagged doc has a selection
 *
 * @param taggedDoc
 */
export const taggedDocHasSelection = (taggedDoc: TaggedProsemirrorNode) =>
  Object.keys(taggedDoc.tag).some(tag => supportedTags.includes(tag));

/**
 * Initialize the selection based on the passed in tagged node via it's cursor.
 *
 * The supported tags are `['cursor', 'node', 'start', 'end', 'anchor', 'all']`
 *
 * @param taggedDoc
 */
export const initSelection = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
) => {
  const { cursor, node, start, end, anchor, all, gap } = taggedDoc.tag;
  if (all) {
    return new AllSelection<GSchema>(taggedDoc);
  }

  if (node) {
    return new NodeSelection<GSchema>(taggedDoc.resolve(node));
  }

  if (cursor) {
    return new TextSelection<GSchema>(taggedDoc.resolve(cursor));
  }

  if (gap) {
    const $pos = taggedDoc.resolve(gap);
    return new GapCursor($pos, $pos);
  }

  if (start) {
    return createTextSelection({ taggedDoc, start, end });
  }

  const $anchor = resolveCell(taggedDoc, anchor);
  if ($anchor) {
    return Cast<Selection<GSchema>>(
      new CellSelection<GSchema>($anchor, resolveCell(taggedDoc, taggedDoc.tag.head) || undefined),
    );
  }
  return null;
};

/**
 * Returns a selection regardless of whether anything is tagged in the provided doc
 *
 * @param taggedDoc
 */
export const selectionFor = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
): Selection<GSchema> => {
  return initSelection(taggedDoc) || Selection.atStart(taggedDoc);
};

/**
 * Create the editor state for a tagged prosemirror doc
 *
 * @param taggedDoc
 */
export const createState = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
  plugins: Plugin[] = [],
): EditorState<GSchema> => {
  return EditorState.create({ doc: taggedDoc, selection: initSelection(taggedDoc), schema, plugins });
};

/**
 * A short hand way for building prosemirror test builders with the core nodes already provided
 * - `doc`
 * - `paragraph`
 * - `text`
 *
 * @param testSchema - The schema to use which provided a doc, paragraph and text schema
 * @param names - the extra marks and nodes to provide with their attributes
 */
export const pmBuild = <
  GObj extends Record<string, NodeTypeAttributes | MarkTypeAttributes> = Record<
    string,
    NodeTypeAttributes | MarkTypeAttributes
  >,
  GNodes extends string = string,
  GMarks extends string = string
>(
  testSchema: Schema<GNodes, GMarks>,
  names: GObj,
) => {
  return pm.builders(testSchema, {
    doc: { nodeType: 'doc' },
    p: { nodeType: 'paragraph' },
    text: { nodeType: 'text' },
    ...names,
  });
};

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
  table_header: tableHeader,
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
