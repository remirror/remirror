import * as pm from 'prosemirror-test-builder';
import { MarkBuilder, NodeBuilder } from 'prosemirror-test-builder';
import { Cast, isNumber, keys } from '@remirror/core-helpers';
import type { EditorSchema, ProsemirrorNode, ProsemirrorPlugin } from '@remirror/core-types';
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
import type { TaggedDocProps, TaggedProsemirrorNode } from './jest-prosemirror-types';

/**
 * Table specific cell resolution
 *
 * @param taggedDoc
 * @param [tag]
 */
function resolveCell(taggedDoc: ProsemirrorNode, tag?: number) {
  if (!tag) {
    return null;
  }

  return cellAround(taggedDoc.resolve(tag));
}

interface CreateTextSelectionProps extends TaggedDocProps {
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
function createTextSelection({ taggedDoc, start, end }: CreateTextSelectionProps) {
  const $start = taggedDoc.resolve(start);
  const $end = end && start <= end ? taggedDoc.resolve(end) : taggedDoc.resolve($start.end());
  return TextSelection.between($start, $end);
}

const supportedTags = new Set(['cursor', 'node', 'start', 'end', 'anchor', 'all', 'gap']);

/**
 * Checks that the tagged doc has a selection
 *
 * @param taggedDoc
 */
export function taggedDocHasSelection(taggedDoc: ProsemirrorNode): boolean {
  const tag = (taggedDoc as TaggedProsemirrorNode)?.tag ?? {};
  return keys(tag).some((tag) => supportedTags.has(tag));
}

/**
 * Initialize the selection based on the passed in tagged node via it's cursor.
 *
 * The supported tags are `['cursor', 'node', 'start', 'end', 'anchor', 'all']`
 *
 * @param taggedDoc
 */
export function initSelection(taggedDoc: ProsemirrorNode): Selection | undefined {
  const tag = (taggedDoc as TaggedProsemirrorNode)?.tag ?? {};

  const { cursor, node, start, end, anchor, head, all, gap } = tag;

  if (isNumber(all)) {
    return new AllSelection(taggedDoc);
  }

  if (isNumber(node)) {
    return NodeSelection.create(taggedDoc, taggedDoc.resolve(node).before());
  }

  if (isNumber(cursor)) {
    return TextSelection.near(taggedDoc.resolve(cursor));
  }

  if (isNumber(gap)) {
    const $pos = taggedDoc.resolve(gap);
    return new GapCursor($pos);
  }

  if (isNumber(anchor) && isNumber(head)) {
    return TextSelection.between(taggedDoc.resolve(anchor), taggedDoc.resolve(head));
  }

  if (isNumber(start)) {
    return createTextSelection({ taggedDoc, start, end });
  }

  if (isNumber(anchor)) {
    const $anchor = resolveCell(taggedDoc, anchor);

    if ($anchor) {
      return Cast<Selection>(new CellSelection($anchor, resolveCell(taggedDoc, head) ?? undefined));
    }
  }

  return undefined;
}

/**
 * Returns a selection regardless of whether anything is tagged in the provided doc
 *
 * @param taggedDoc
 */
export function selectionFor(taggedDoc: ProsemirrorNode): Selection {
  return initSelection(taggedDoc) ?? Selection.atStart(taggedDoc);
}

/**
 * Create the editor state for a tagged prosemirror doc
 *
 * @param taggedDoc
 */
export function createState(
  taggedDoc: ProsemirrorNode,
  plugins: ProsemirrorPlugin[] = [],
): EditorState {
  return EditorState.create({
    doc: taggedDoc,
    selection: initSelection(taggedDoc),
    schema,
    plugins,
  });
}

interface NodeTypeAttributes extends Record<string, any> {
  nodeType: string;
}

interface MarkTypeAttributes extends Record<string, any> {
  markType: string;
}

interface DefaultBuilderTypes {
  doc: NodeTypeAttributes;
  p: NodeTypeAttributes;
  text: NodeTypeAttributes;
}

type BuilderTypes = Record<string, NodeTypeAttributes | MarkTypeAttributes>;

type BuilderReturns<T extends BuilderTypes> = {
  [Name in keyof T]: T[Name] extends NodeTypeAttributes ? NodeBuilder : MarkBuilder;
};

type Builder = <T extends BuilderTypes>(testSchema: EditorSchema, names: T) => BuilderReturns<T>;

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
export function pmBuild<Types extends BuilderTypes = BuilderTypes>(
  testSchema: EditorSchema,
  names: Types,
): BuilderReturns<Types & DefaultBuilderTypes> {
  const builder = pm.builders as unknown as Builder;
  const types: Types & DefaultBuilderTypes = {
    doc: { nodeType: 'doc' },
    p: { nodeType: 'paragraph' },
    text: { nodeType: 'text' },
    ...names,
  };
  return builder(testSchema, types);
}

const built = pmBuild(schema, {
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
  doc,
  em,
  a: link,
  p,
  p: paragraph,
  strong,
  table,
  td,
  text,
  th,
  tr,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  td: tableCell,
  th: tableHeaderCell,
  tr: tableRow,
} = built;

const b = built as any;

export const code_block: NodeBuilder = b.code_block;
export const pre: NodeBuilder = b.pre;
export const img: NodeBuilder = b.img;
export const hr: NodeBuilder = b.hr;
export const br: NodeBuilder = b.br;
export const codeBlock: NodeBuilder = b.code_block;
export const hardBreak: NodeBuilder = b.hard_break;
export const heading: NodeBuilder = b.heading;
export const horizontalRule: NodeBuilder = b.horizontalRule;
export const image: NodeBuilder = b.image;

export const tdEmpty: ProsemirrorNode = td(p());
export const thEmpty: ProsemirrorNode = th(p());
export const tdCursor: ProsemirrorNode = td(p('<cursor>'));
export const thCursor: ProsemirrorNode = th(p('<cursor>'));

export { pm };
