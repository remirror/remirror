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
import { renderEditor } from 'jest-remirror';
import { BoldExtension, createCoreManager, HeadingExtension } from 'remirror/extensions';
import { omit } from '@remirror/core-helpers';
import { NodeSelection, Selection, TextSelection } from '@remirror/pm/state';

import {
  cloneTransaction,
  findElementAtPosition,
  findNodeAtSelection,
  findParentNode,
  findParentNodeOfType,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  findSelectedNodeOfType,
  hasTransactionChanged,
  isNodeActive,
  isNodeOfType,
  isSelectionEmpty,
  removeNodeAtPosition,
  removeNodeBefore,
  schemaToJSON,
} from '../';

describe('isNodeOfType', () => {
  it('matches with a singular nodeType', () => {
    expect(isNodeOfType({ types: schema.nodes.paragraph, node: p() })).toBeTrue();
  });

  it('matches with an array of nodeTypes', () => {
    const { paragraph, blockquote: bq } = schema.nodes;

    expect(isNodeOfType({ types: [paragraph, bq], node: blockquote() })).toBeTrue();
  });
});

describe('removeNodeAtPosition', () => {
  it('removes block top level nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('x'), p('one')));
    removeNodeAtPosition({ pos: 3, tr });

    expect(tr.doc).toEqualProsemirrorNode(doc(p('x')));
  });

  it('removes nested inline nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one', atomInline())));
    removeNodeAtPosition({ pos: 4, tr });

    expect(tr.doc).toEqualProsemirrorNode(doc(p('one')));
  });
});

describe('removeNodeBefore', () => {
  it('does nothing if there is no nodeBefore', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('<cursor>')));
    const steps = tr.steps;

    removeNodeBefore(tr);
    expect(steps).toBe(tr.steps);
  });

  it('supports removing tables', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), table(row(tdEmpty), row(tdEmpty)), '<cursor>', p('two')));
    removeNodeBefore(tr);

    expect(tr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
  });

  it('supports removing blockquotes', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), blockquote(p('')), '<cursor>', p('two')));
    removeNodeBefore(tr);

    expect(tr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
  });

  it('supports removing leaf nodes (atom)', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), atomBlock(), '<cursor>', p('two')));
    removeNodeBefore(tr);

    expect(tr.doc).toEqualProsemirrorNode(doc(p('one'), p('two')));
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

    expect(result).toEqual({ pos: 6, start: 7, end: 20, depth: 1, node });
  });

  it('supports blockquotes', () => {
    const node = blockquote(p(''));
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const position = findPositionOfNodeBefore(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 10, depth: 1, node });
  });

  it('supports nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), table(row(td(p('1'), node, '<cursor>')))));
    const position = findPositionOfNodeBefore(selection);

    expect(position).toEqual({ pos: 12, start: 13, end: 13, depth: 4, node });
  });

  it('supports non-nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const position = findPositionOfNodeBefore(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 7, depth: 1, node });
  });

  it('supports leaf nodes with with nested inline atom nodes', () => {
    const node = atomContainer(atomBlock());
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), node, '<cursor>'));
    const position = findPositionOfNodeBefore(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 9, depth: 1, node });
  });
});

describe('findPositionOfNodeAfter', () => {
  it('returns `undefined` when none exists', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('<cursor>')));
    const result = findPositionOfNodeAfter(selection);

    expect(result).toBeUndefined();
  });

  it('supports tables', () => {
    const node = table(row(tdEmpty), row(tdEmpty));
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), '<cursor>', node));
    const result = findPositionOfNodeAfter(selection);

    expect(result).toEqual({ pos: 6, start: 7, end: 20, depth: 1, node });
  });

  it('supports blockquotes', () => {
    const node = blockquote(p(''));
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), '<cursor>', node));
    const position = findPositionOfNodeAfter(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 10, depth: 1, node });
  });

  it('supports nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), table(row(td(p('1'), '<cursor>', node)))));
    const position = findPositionOfNodeAfter(selection);

    expect(position).toEqual({ pos: 12, start: 13, end: 13, depth: 4, node });
  });

  it('supports non-nested leaf nodes', () => {
    const node = atomBlock();
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), '<cursor>', node));
    const position = findPositionOfNodeAfter(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 7, depth: 1, node });
  });

  it('supports leaf nodes with with nested inline atom nodes', () => {
    const node = atomContainer(atomBlock());
    const {
      state: { selection },
    } = createEditor(doc(p('abcd'), '<cursor>', node));
    const position = findPositionOfNodeAfter(selection);

    expect(position).toEqual({ pos: 6, start: 7, end: 9, depth: 1, node });
  });
});

describe('findElementAtPosition', () => {
  it('should return DOM reference of a top level block leaf node', () => {
    const { view } = createEditor(doc(p('text'), atomBlock()));
    const reference = findElementAtPosition(6, view);

    expect(reference instanceof HTMLDivElement).toBe(true);
    expect(reference.getAttribute('data-node-type')).toEqual('atomBlock');
  });

  it('should return DOM reference of a nested inline leaf node', () => {
    const { view } = createEditor(doc(p('one', atomInline(), 'two')));
    const reference = findElementAtPosition(4, view);

    expect(reference instanceof HTMLSpanElement).toBe(true);
    expect(reference.getAttribute('data-node-type')).toEqual('atomInline');
  });

  it('should return DOM reference of a content block node', () => {
    const { view } = createEditor(doc(p('one'), blockquote(p('two'))));
    const reference = findElementAtPosition(5, view);

    expect(reference instanceof HTMLQuoteElement).toBe(true);
  });

  it('should return DOM reference of a text node when offset=0', () => {
    const { view } = createEditor(doc(p('text')));
    const reference = findElementAtPosition(1, view);

    expect(reference instanceof HTMLParagraphElement).toBe(true);
  });

  it('should return DOM reference of a paragraph if cursor is inside of a text node', () => {
    const { view } = createEditor(doc(p(atomInline(), 'text')));
    const reference = findElementAtPosition(3, view);

    expect(reference instanceof HTMLParagraphElement).toBe(true);
  });
});

describe('selectionEmpty', () => {
  it('returns false when selection is active', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));

    expect(isSelectionEmpty(selection)).toBeFalse();
  });

  it('returns true when cursor is active', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('<cursor>aba')));

    expect(isSelectionEmpty(selection)).toBeTrue();
  });

  it('returns true when no cursor', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('inline'), p('aba')));

    expect(isSelectionEmpty(selection)).toBeTrue();
  });
});

describe('transactionChanged', () => {
  it('returns false when neither text nor state has change', () => {
    const {
      state: { tr },
      view,
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));
    view.dispatch(tr);

    expect(hasTransactionChanged(tr)).toBeFalse();
  });

  it('returns true when the doc has changed', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('inline'), p('<start>aba<end>', 'awesome')));
    tr.deleteSelection();

    expect(hasTransactionChanged(tr)).toBeTrue();
  });

  it('returns true when cursor changes', () => {
    const { state } = createEditor(doc(p('inline'), p('aba<cursor>')));
    const tr = state.tr.setSelection(TextSelection.atStart(state.doc));

    expect(hasTransactionChanged(tr)).toBeTrue();
  });
});

describe('cloneTransaction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clones the transaction', async () => {
    await new Promise<void>((resolve) => {
      const {
        state: { tr },
      } = createEditor(doc(p()));

      setTimeout(() => {
        const clonedTr = cloneTransaction(tr);

        expect(omit(tr, ['time'])).toEqual(omit(clonedTr, ['time']));

        resolve();
      }, 10);

      jest.advanceTimersByTime(20);
    });
  });
});

describe('findParentNode', () => {
  it('finds parent node with cursor directly inside', () => {
    const node = p('hello <cursor>');
    const {
      state: { selection },
    } = createEditor(doc(node));
    const position = findParentNode({
      predicate: (pmNode) => pmNode.type === schema.nodes.paragraph,
      selection,
    });

    expect(position).toEqual({ pos: 0, start: 1, end: 8, depth: 1, node });
  });

  it('finds parent from inside nested child', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const result = findParentNode({
      predicate: (pmNode) => pmNode.type === schema.nodes.table,
      selection,
    });

    expect(result?.node.type.name).toEqual('table');
  });

  it('returns `undefined` when no parent node found', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const result = findParentNode({
      predicate: (pmNode) => pmNode.type === schema.nodes.table_header,
      selection,
    });

    expect(result).toBeUndefined();
  });
});

describe('findParentNodeOfType', () => {
  it('finds parent node of a given `nodeType`', () => {
    const node = p('hello <cursor>');
    const {
      state: { selection },
    } = createEditor(doc(node));
    const position = findParentNodeOfType({ types: schema.nodes.paragraph, selection });

    expect(position).toEqual({ pos: 0, start: 1, end: 8, depth: 1, node });
  });

  it('returns `undefined` when given `nodeType` is not found', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const result = findParentNodeOfType({ types: schema.nodes.table, selection });

    expect(result).toBeUndefined();
  });

  it('finds parent node when `nodeType` is an array', () => {
    const node = p('hello <cursor>');
    const {
      state: {
        schema: {
          nodes: { paragraph, blockquote: bq, table: table_ },
        },
        selection,
      },
    } = createEditor(doc(node));
    const position = findParentNodeOfType({ types: [table_, bq, paragraph], selection });

    expect(position).toEqual({ pos: 0, start: 1, end: 8, depth: 1, node });
  });
});

describe('nodeActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema: sch } = createEditor(
      doc(p('Something', blockquote('is <cursor>in blockquote'))),
    );

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
    const { state, schema: sch } = createEditor(
      doc(p('Something', blockquote('<node>is italic'), 'here')),
    );

    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeTrue();
  });

  it('returns false nested within other nodes', () => {
    const { state, schema: sch } = createEditor(
      doc(p('a<node>', p(p(blockquote('is italic')), 'here'))),
    );

    expect(isNodeActive({ state, type: sch.nodes.blockquote })).toBeFalse();
  });

  it('matches nodes by specified attributes', () => {
    const { state, schema: sch } = createEditor(
      doc(p('Something'), h2('level <cursor> heading'), p('here')),
    );

    expect(isNodeActive({ state, type: sch.nodes.heading, attrs: { level: 1 } })).toBeFalse();
    expect(isNodeActive({ state, type: sch.nodes.heading, attrs: { level: 2 } })).toBeTrue();
  });

  it('matches partial attributes', () => {
    const { nodes, add, attributeNodes } = renderEditor([
      new HeadingExtension({ extraAttributes: { custom: { default: 'custom' } } }),
    ]);

    const { doc, p } = nodes;
    const hCustom = attributeNodes.heading({ custom: 'test', level: 2 });
    const { state, schema } = add(
      doc(p('Something'), hCustom('level <cursor> heading'), p('here')),
    );
    const type = schema.nodes.heading;

    expect(isNodeActive({ state, type, attrs: { level: 1 } })).toBeFalse();
    expect(isNodeActive({ state, type, attrs: { level: 2 } })).toBeTrue();
    expect(isNodeActive({ state, type, attrs: { level: 2, custom: 'test' } })).toBeTrue();
    expect(isNodeActive({ state, type, attrs: { level: 2, custom: 'no' } })).toBeFalse();
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
    const { state } = createEditor(doc(p('<node>one')));
    const { paragraph, table: t } = state.schema.nodes;
    const selectedNode = findSelectedNodeOfType({
      types: [paragraph, t],
      selection: state.selection,
    });

    expect(selectedNode?.node.type.name).toEqual('paragraph');
  });
});

describe('findNodeAt...', () => {
  const expectedEnd = h2('Heading here');
  const expectedStart = p('<cursor> You am champion');
  const pmDocument = doc(expectedStart, expectedEnd);

  it('findNodeAtSelection', () => {
    const selection = Selection.atEnd(pmDocument);
    const { node, pos, start } = findNodeAtSelection(selection);

    expect(node).toBe(expectedEnd);
    expect(pos).toBe(18);
    expect(start).toBe(19);
  });
});

test('schemaToJSON', () => {
  expect(schemaToJSON(createCoreManager([new BoldExtension()]).schema)).toMatchSnapshot();
});
