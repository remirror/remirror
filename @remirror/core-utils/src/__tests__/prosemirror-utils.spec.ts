import { omit, pick } from '@remirror/core-helpers';
import {
  atomBlock,
  atomContainer,
  atomInline,
  blockquote,
  createEditor,
  doc,
  h2,
  p,
  schema,
  table,
  td,
  tdCursor,
  tdEmpty,
  tr as row,
} from 'jest-prosemirror';
import { marks, nodes } from 'prosemirror-schema-basic';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import {
  cloneTransaction,
  findElementAtPosition,
  findNodeAtEndOfDoc,
  findNodeAtSelection,
  findNodeAtStartOfDoc,
  findParentNode,
  findParentNodeOfType,
  findPositionOfNodeBefore,
  findSelectedNodeOfType,
  isNodeActive,
  nodeEqualsType,
  removeNodeAtPosition,
  removeNodeBefore,
  selectionEmpty,
  transactionChanged,
  schemaToJSON,
} from '../prosemirror-utils';
import { Schema } from 'prosemirror-model';

describe('nodeEqualsType', () => {
  it('matches with a singular nodeType', () => {
    expect(nodeEqualsType({ types: schema.nodes.paragraph, node: p() })).toBeTrue();
  });

  it('matches with an array of nodeTypes', () => {
    const { paragraph, blockquote: bq } = schema.nodes;
    expect(nodeEqualsType({ types: [paragraph, bq], node: blockquote() })).toBeTrue();
  });
});

describe('removeNodeAtPosition', () => {
  it('removes block top level nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('x'), p('one')));
    const newTr = removeNodeAtPosition({ pos: 3, tr });
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualProsemirrorNode(doc(p('x')));
  });

  it('removes nested inline nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one', atomInline())));
    const newTr = removeNodeAtPosition({ pos: 4, tr });
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualProsemirrorNode(doc(p('one')));
  });
});

describe('removeNodeBefore', () => {
  it('returns the original transaction if there is no nodeBefore', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('<cursor>')));
    const newTr = removeNodeBefore(tr);
    expect(tr).toBe(newTr);
  });

  it('supports removing tables', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), table(row(tdEmpty), row(tdEmpty)), '<cursor>', p('two')));
    const newTr = removeNodeBefore(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
  });

  it('supports removing blockquotes', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), blockquote(p('')), '<cursor>', p('two')));
    const newTr = removeNodeBefore(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
  });

  it('supports removing leaf nodes (atom)', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), atomBlock(), '<cursor>', p('two')));
    const newTr = removeNodeBefore(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
  });
});

describe('findPositionOfNodeBefore', () => {
  it('returns `undefined` when none exists', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('<cursor>')));
    const result = findPositionOfNodeBefore(selection);
    expect(result).toBeUndefined();
  });

  it('supports tables', () => {
    const node = table(row(tdEmpty), row(tdEmpty));
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const result = findPositionOfNodeBefore(selection);
    expect(result).toEqual({ pos: 6, start: 7, end: 20, node });
  });

  it('supports blockquotes', () => {
    const node = blockquote(p(''));
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual({ pos: 6, start: 7, end: 10, node });
  });

  it('supports nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), table(row(td(p('1'), node, '<cursor>')))));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual({ pos: 12, start: 12, end: 13, node });
  });

  it('supports non-nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual({ pos: 6, start: 6, end: 7, node });
  });

  it('supports leaf nodes with with nested inline atom nodes', () => {
    const node = atomContainer(atomBlock());
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), atomContainer(atomBlock()), '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual({ pos: 6, start: 7, end: 9, node });
  });
});

describe('findElementAtPosition', () => {
  it('should return DOM reference of a top level block leaf node', () => {
    const { view } = createEditor(doc(p('text'), atomBlock()));
    const ref = findElementAtPosition(6, view);
    expect(ref instanceof HTMLDivElement).toBe(true);
    expect(ref.getAttribute('data-node-type')).toEqual('atomBlock');
  });

  it('should return DOM reference of a nested inline leaf node', () => {
    const { view } = createEditor(doc(p('one', atomInline(), 'two')));
    const ref = findElementAtPosition(4, view);
    expect(ref instanceof HTMLSpanElement).toBe(true);
    expect(ref.getAttribute('data-node-type')).toEqual('atomInline');
  });

  it('should return DOM reference of a content block node', () => {
    const { view } = createEditor(doc(p('one'), blockquote(p('two'))));
    const ref = findElementAtPosition(5, view);
    expect(ref instanceof HTMLQuoteElement).toBe(true);
  });

  it('should return DOM reference of a text node when offset=0', () => {
    const { view } = createEditor(doc(p('text')));
    const ref = findElementAtPosition(1, view);
    expect(ref instanceof HTMLParagraphElement).toBe(true);
  });

  it('should return DOM reference of a paragraph if cursor is inside of a text node', () => {
    const { view } = createEditor(doc(p(atomInline(), 'text')));
    const ref = findElementAtPosition(3, view);
    expect(ref instanceof HTMLParagraphElement).toBe(true);
  });
});

describe('selectionEmpty', () => {
  it('returns false when selection is active', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));
    expect(selectionEmpty(selection)).toBeFalse();
  });

  it('returns true when cursor is active', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('<cursor>aba')));
    expect(selectionEmpty(selection)).toBeTrue();
  });

  it('returns true when no cursor', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('aba')));
    expect(selectionEmpty(selection)).toBeTrue();
  });
});

describe('transactionChanged', () => {
  it('returns false when neither text nor state has change', () => {
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));
    view.dispatch(tr);
    expect(transactionChanged(tr)).toBeFalse();
  });

  it('returns true when the doc has changed', () => {
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));
    const newTr = tr.deleteSelection();
    view.dispatch(newTr);
    expect(transactionChanged(tr)).toBeTrue();
  });

  it('returns true when cursor changes', () => {
    const { state } = createEditor(doc(p('inline'), p('aba<cursor>')));
    const tr = state.tr.setSelection(TextSelection.atStart(state.doc));
    expect(transactionChanged(tr)).toBeTrue();
  });
});

describe('cloneTransaction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clones the transaction', () => {
    return new Promise(done => {
      const {
        state: { tr },
      } = createEditor(doc(p()));

      setTimeout(() => {
        const clonedTr = cloneTransaction(tr);
        expect(omit(tr, ['time'])).toEqual(omit(clonedTr, ['time']));
        done();
      }, 10);

      jest.advanceTimersByTime(20);
    });
  });
});

describe('findParentNode', () => {
  it('finds parent node with cursor directly inside', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const { node } = findParentNode({
      predicate: pmNode => pmNode.type === schema.nodes.paragraph,
      selection,
    })!;
    expect(node.type.name).toEqual('paragraph');
  });

  it('finds parent from inside nested child', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const { node } = findParentNode({ predicate: pmNode => pmNode.type === schema.nodes.table, selection })!;
    expect(node.type.name).toEqual('table');
  });

  it('returns `undefined` when no parent node found', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const result = findParentNode({
      predicate: pmNode => pmNode.type === schema.nodes.table_header,
      selection,
    });
    expect(result).toBeUndefined();
  });
});

describe('findParentNodeOfType', () => {
  it('finds parent node of a given `nodeType`', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const { node } = findParentNodeOfType({ types: schema.nodes.paragraph, selection })!;
    expect(node.type.name).toEqual('paragraph');
  });

  it('returns `undefined` when given `nodeType` is not found', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const result = findParentNodeOfType({ types: schema.nodes.table, selection });
    expect(result).toBeUndefined();
  });

  it('finds parent node when `nodeType` is an array', () => {
    const {
      state: {
        schema: {
          nodes: { paragraph, blockquote: bq, table: tbl },
        },
        selection,
      },
    } = createEditor(doc(p('hello <cursor>')));
    const { node } = findParentNodeOfType({ types: [tbl, bq, paragraph], selection })!;
    expect(node.type.name).toEqual('paragraph');
  });
});

describe('nodeActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema: sch } = createEditor(doc(p('Something', blockquote('is <cursor>in blockquote'))));
    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeTrue();
  });

  it('returns false when not within the node', () => {
    const { state, schema: sch } = createEditor(doc(p('Something<cursor>', blockquote('hello'))));
    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeFalse();
  });

  it('returns false with text selection surrounds the node', () => {
    const { state, schema: sch } = createEditor(
      doc(p('Something<start>', blockquote('is italic'), '<end> here')),
    );
    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeFalse();
  });

  it('returns true when node selection directly before node', () => {
    const { state, schema: sch } = createEditor(doc(p('Something', blockquote('<node>is italic'), 'here')));
    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeTrue();
  });

  it('returns false nested within other nodes', () => {
    const { state, schema: sch } = createEditor(doc(p('a<node>', p(p(blockquote('is italic')), 'here'))));
    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeFalse();
  });

  it('matches nodes by specified attributes', () => {
    const { state, schema: sch } = createEditor(doc(p('Something', h2('is <cursor> heading'), 'here')));
    expect(isNodeActive({ state, type: sch.nodes.heading, attrs: { level: 1 } })).toBeFalse();
    expect(isNodeActive({ state, type: sch.nodes.heading, attrs: { level: 2 } })).toBeTrue();
  });
});

describe('findSelectedNodeOfType', () => {
  it('should return `undefined` if selection is not a NodeSelection', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('<cursor>')));
    const node = findSelectedNodeOfType({ types: schema.nodes.paragraph, selection });

    expect(node).toBeUndefined();
  });

  it('should return selected node of a given `nodeType`', () => {
    const { state } = createEditor(doc(p('<cursor>one')));
    const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
    const selectedNode = findSelectedNodeOfType({
      types: state.schema.nodes.paragraph,
      selection: tr.selection,
    });

    expect(selectedNode!.node.type.name).toEqual('paragraph');
  });

  it('should return selected node of one of the given `nodeType`s', () => {
    const { state } = createEditor(doc(p('<cursor>one')));
    const { paragraph, table: tbl } = state.schema.nodes;
    const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
    const selectedNode = findSelectedNodeOfType({ types: [paragraph, tbl], selection: tr.selection });

    expect(selectedNode!.node.type.name).toEqual('paragraph');
  });
});

describe('findNodeAt...', () => {
  const expectedEnd = h2('Heading here');
  const expectedStart = p('<cursor> I am champion');
  const pmDoc = doc(expectedStart, expectedEnd);

  test('findNodeAtSelection', () => {
    const selection = Selection.atEnd(pmDoc);
    const { node, pos, start } = findNodeAtSelection(selection);
    expect(node).toBe(expectedEnd);
    expect(pos).toBe(16);
    expect(start).toBe(17);
  });

  test('findNodeAtEndOfDoc', () => {
    const { node } = findNodeAtEndOfDoc(pmDoc);
    expect(node).toBe(expectedEnd);
  });

  test('findNodeAtStartOfDoc', () => {
    const { node } = findNodeAtStartOfDoc(pmDoc);
    expect(node).toBe(expectedStart);
  });
});

test('schemaToJSON', () => {
  const testSchema = new Schema({
    nodes: pick(nodes, ['doc', 'paragraph', 'text']),
    marks: pick(marks, ['em', 'strong']),
  });

  expect(schemaToJSON(testSchema)).toMatchSnapshot();
});
