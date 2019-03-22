import {
  atomBlock,
  atomContainer,
  atomInline,
  blockquote,
  createEditor,
  doc,
  p,
  schema,
  table,
  td,
  tdCursor,
  tdEmpty,
  tr as row,
} from 'jest-prosemirror';
import { omit } from '../base';
import {
  cloneTransaction,
  equalNodeType,
  findDOMRefAtPos,
  findParentNode,
  findParentNodeOfType,
  findPositionOfNodeBefore,
  removeNodeAtPos,
  removeNodeBefore,
  selectionEmpty,
} from '../utils';

describe('equalNodeType', () => {
  it('matches with a singular nodeType', () => {
    expect(equalNodeType(schema.nodes.paragraph, p())).toBeTrue();
  });

  it('matches with an array of nodeTypes', () => {
    const { paragraph, blockquote: bq } = schema.nodes;
    expect(equalNodeType([paragraph, bq], blockquote())).toBeTrue();
  });
});

describe('removeNodeAtPos', () => {
  it('removes block top level nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('x'), p('one')));
    const newTr = removeNodeAtPos(3)(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualPMNode(doc(p('x')));
  });

  it('removes nested inline nodes at specified position', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one', atomInline())));
    const newTr = removeNodeAtPos(4)(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualPMNode(doc(p('one')));
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
    expect(newTr.doc).toEqualPMNode(doc(p('one'), p('two')));
  });

  it('supports removing blockquotes', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), blockquote(p('')), '<cursor>', p('two')));
    const newTr = removeNodeBefore(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualPMNode(doc(p('one'), p('two')));
  });

  it('supports removing leaf nodes (atom)', () => {
    const {
      state: { tr },
    } = createEditor(doc(p('one'), atomBlock(), '<cursor>', p('two')));
    const newTr = removeNodeBefore(tr);
    expect(newTr).not.toBe(tr);
    expect(newTr.doc).toEqualPMNode(doc(p('one'), p('two')));
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
    const {
      state: { selection },
    } = createEditor(doc(p('text'), table(row(tdEmpty), row(tdEmpty)), '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual(6);
  });

  it('supports blockquotes', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('text'), blockquote(p('')), '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual(6);
  });

  it('supports nested leaf nodes', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('text'), table(row(td(p('1'), atomBlock(), '<cursor>')))));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual(12);
  });

  it('supports non-nested leaf node', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('text'), atomBlock(), '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual(6);
  });

  it('supports leaf nodes with with nested inline atom nodes', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('text'), atomContainer(atomBlock()), '<cursor>'));
    const position = findPositionOfNodeBefore(selection);
    expect(position).toEqual(6);
  });
});

describe('findDomRefAtPos', () => {
  it('should return DOM reference of a top level block leaf node', () => {
    const { view } = createEditor(doc(p('text'), atomBlock()));
    const ref = findDOMRefAtPos(6, view);
    expect(ref instanceof HTMLDivElement).toBe(true);
    expect((ref as HTMLElement).getAttribute('data-node-type')).toEqual('atomBlock');
  });

  it('should return DOM reference of a nested inline leaf node', () => {
    const { view } = createEditor(doc(p('one', atomInline(), 'two')));
    const ref = findDOMRefAtPos(4, view);
    expect(ref instanceof HTMLSpanElement).toBe(true);
    expect((ref as HTMLElement).getAttribute('data-node-type')).toEqual('atomInline');
  });

  it('should return DOM reference of a content block node', () => {
    const { view } = createEditor(doc(p('one'), blockquote(p('two'))));
    const ref = findDOMRefAtPos(5, view);
    expect(ref instanceof HTMLQuoteElement).toBe(true);
  });

  it('should return DOM reference of a text node when offset=0', () => {
    const { view } = createEditor(doc(p('text')));
    const ref = findDOMRefAtPos(1, view);
    expect(ref instanceof HTMLParagraphElement).toBe(true);
  });

  it('should return DOM reference of a paragraph if cursor is inside of a text node', () => {
    const { view } = createEditor(doc(p(atomInline(), 'text')));
    const ref = findDOMRefAtPos(3, view);
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

describe('cloneTransaction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clones the transaction', done => {
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

describe('findParentNode', () => {
  it('finds parent node with cursor directly inside', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const { node } = findParentNode(pmNode => pmNode.type === schema.nodes.paragraph)(selection)!;
    expect(node.type.name).toEqual('paragraph');
  });

  it('finds parent from inside nested child', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const { node } = findParentNode(pmNode => pmNode.type === schema.nodes.table)(selection)!;
    expect(node.type.name).toEqual('table');
  });

  it('returns `undefined` when no parent node found', () => {
    const {
      state: { selection },
    } = createEditor(doc(table(row(tdCursor))));
    const result = findParentNode(pmNode => pmNode.type === schema.nodes.table_header)(selection);
    expect(result).toBeUndefined();
  });
});

describe('findParentNodeOfType', () => {
  it('finds parent node of a given `nodeType`', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const { node } = findParentNodeOfType(schema.nodes.paragraph)(selection)!;
    expect(node.type.name).toEqual('paragraph');
  });

  it('returns `undefined` when given `nodeType` is not found', () => {
    const {
      state: { selection },
    } = createEditor(doc(p('hello <cursor>')));
    const result = findParentNodeOfType(schema.nodes.table)(selection);
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
    const { node } = findParentNodeOfType([tbl, bq, paragraph])(selection)!;
    expect(node.type.name).toEqual('paragraph');
  });
});
