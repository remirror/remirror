import {
  atomInline,
  createEditor,
  doc,
  p,
  strong,
  table,
  td,
  tdEmpty,
  tr as row,
} from 'jest-prosemirror';
import { TextSelection } from '@remirror/pm/state';

import {
  containsNodesOfType,
  findBlockNodes,
  findChildren,
  findChildrenByAttribute,
  findChildrenByMark,
  findChildrenByNode,
  findTextNodes,
  getChangedNodes,
} from '../';

describe('findChildren', () => {
  it('should return an array of matched nodes `predicate` returns truthy for', () => {
    const { state } = createEditor(doc(table(row(tdEmpty), row(tdEmpty), row(tdEmpty))));
    const result = findChildren({
      node: state.doc.firstChild,
      predicate: (child) => child.node.type === state.schema.nodes.paragraph,
    });

    expect(result).toHaveLength(3);

    result.forEach((item) => {
      expect(item.node.type.name).toEqual('paragraph');
    });
  });

  it('should perform the provided action for truthy matches', () => {
    const mock = jest.fn();
    const { state } = createEditor(doc(table(row(tdEmpty), row(tdEmpty), row(tdEmpty))));

    findChildren({
      node: state.doc.firstChild,
      predicate: (child) => child.node.type === state.schema.nodes.paragraph,
      action: mock,
    });

    expect(mock).toHaveBeenCalledTimes(3);

    mock.mock.calls.forEach(([item]) => {
      expect(item.node.type.name).toEqual('paragraph');
    });
  });

  it('should return an empty array if `predicate` returns falsy', () => {
    const { state } = createEditor(doc(table(row(tdEmpty))));

    const result = findChildren({
      node: state.doc.firstChild,
      predicate: (child) => child.node.type === state.schema.nodes.atomInline,
    });

    expect(result).toHaveLength(0);
  });
});

describe('findTextNodes', () => {
  it('should return an empty array if a given node does not have text nodes', () => {
    const { state } = createEditor(doc(table(row(tdEmpty))));
    const result = findTextNodes({ node: state.doc.firstChild });

    expect(result).toHaveLength(0);
  });

  it('should return an array if text nodes of a given node', () => {
    const { state } = createEditor(
      doc(table(row(td(p('one', atomInline(), 'two'), td(p('three')))))),
    );
    const result = findTextNodes({ node: state.doc.firstChild });

    expect(result).toHaveLength(3);

    result.forEach((item) => {
      expect(item.node.isText).toBe(true);
    });
  });
});

describe('findBlockNodes', () => {
  it('should return an empty array if a given node does not have block nodes', () => {
    const { state } = createEditor(doc(p('')));
    const result = findBlockNodes({ node: state.doc.firstChild });

    expect(result).toHaveLength(0);
  });

  it('should return an array if block nodes of a given node', () => {
    const { state } = createEditor(doc(table(row(tdEmpty, tdEmpty))));
    const result = findBlockNodes({ node: state.doc.firstChild });

    expect(result).toHaveLength(5);

    result.forEach((item) => {
      expect(item.node.isBlock).toBe(true);
    });
  });
});

describe('findChildrenByAttribute', () => {
  it('should return an empty array if a given node does not have nodes with the given attribute', () => {
    const { state } = createEditor(doc(p('')));
    const result = findChildrenByAttribute({
      node: state.doc.firstChild,
      attrs: { colspan: 2 },
    });

    expect(result).toHaveLength(0);
  });

  it('should return an array if child nodes with the given attribute', () => {
    const { state } = createEditor(
      doc(
        table(
          row(tdEmpty, td({ colspan: 2 } as any, p('2')), td({ colspan: 3 } as any, p('3'))),
          row(td({ colspan: 2 } as any, p('2')), tdEmpty, tdEmpty),
        ),
      ),
    );
    const result = findChildrenByAttribute({
      node: state.doc.firstChild,
      attrs: { colspan: 2 },
    });

    expect(result).toHaveLength(2);

    result.forEach((item) => {
      expect(item.node.attrs.colspan).toEqual(2);
    });
  });

  it('should support predicates for the attribute check', () => {
    const { state } = createEditor(
      doc(
        table(
          row(tdEmpty, td({ colspan: 2 } as any, p('2')), td({ colspan: 3 } as any, p('3'))),
          row(td({ colspan: 2 } as any, p('2')), tdEmpty, tdEmpty),
        ),
      ),
    );
    const result = findChildrenByAttribute({
      node: state.doc.firstChild,
      attrs: { colspan: ({ exists }) => exists },
    });

    expect(result).toHaveLength(6);
  });
});

describe('findChildrenByNode', () => {
  it('should return an empty array if a given node does not have nodes of a given `nodeType`', () => {
    const { state } = createEditor(doc(p('')));
    const result = findChildrenByNode({ node: state.doc, type: state.schema.nodes.table });

    expect(result).toHaveLength(0);
  });

  it('should return an array if child nodes of a given `nodeType`', () => {
    const { state } = createEditor(doc(table(row(tdEmpty, tdEmpty, tdEmpty))));
    const result = findChildrenByNode({ node: state.doc, type: state.schema.nodes.table_cell });

    expect(result).toHaveLength(3);

    result.forEach((item) => {
      expect(item.node.type.name).toEqual('table_cell');
    });
  });
});

describe('findChildrenByMark', () => {
  it('should return an empty array if a given node does not have child nodes with the given mark', () => {
    const { state } = createEditor(doc(p('')));
    const result = findChildrenByMark({ node: state.doc, type: state.schema.marks.strong });

    expect(result).toHaveLength(0);
  });

  it('should return an array if child nodes if a given node has child nodes with the given mark', () => {
    const { state } = createEditor(
      doc(table(row(td(p(strong('one'), 'two')), tdEmpty, td(p('three', strong('four')))))),
    );
    const result = findChildrenByMark({ node: state.doc, type: state.schema.marks.strong });

    expect(result).toHaveLength(2);

    result.forEach((item) => {
      expect(item.node.marks[0]?.type.name).toEqual('strong');
    });
  });
});

describe('contains', () => {
  it('should return `false` if a given `node` does not contain nodes of a given `nodeType`', () => {
    const { state } = createEditor(doc(p('')));
    const result = containsNodesOfType({ node: state.doc, type: state.schema.nodes.table });

    expect(result).toBe(false);
  });

  it('should return `true` if a given `node` contains nodes of a given `nodeType`', () => {
    const { state } = createEditor(doc(p('')));
    const result = containsNodesOfType({ node: state.doc, type: state.schema.nodes.paragraph });

    expect(result).toBe(true);
  });
});

describe('getChangedNodes', () => {
  it('can get the changed nodes', () => {
    const { state } = createEditor(doc(p('start'), p('change<cursor>'), p('end')));
    const tr = state.tr;
    tr.insertText('abc');
    const nodes = getChangedNodes(tr);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.node.type.name).toBe('paragraph');
    expect(nodes[0]?.pos).toBe(7);
  });

  it('can understand insertions and complex changes', () => {
    const { state } = createEditor(doc(p('start'), p('change<cursor>'), p('end')));
    const tr = state.tr;
    tr.setSelection(TextSelection.create(tr.doc, tr.doc.nodeSize - 2))
      .insert(tr.selection.from, p('a new paragraph'))
      .setSelection(TextSelection.create(tr.doc, 1))
      .insertText('abc');
    const nodes = getChangedNodes(tr);

    expect(nodes).toHaveLength(3);
    expect(nodes[0]?.pos).toBe(0);
    expect(nodes[0]?.node.type.name).toBe('paragraph');

    expect(nodes[1]?.pos).toBe(18);

    expect(nodes[2]?.pos).toBe(23);
  });

  it('handles deletions', () => {
    const { state } = createEditor(doc(p('start'), p('change<start>'), p('a<end>')));
    const tr = state.tr;
    tr.deleteSelection();
    const nodes = getChangedNodes(tr);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.pos).toBe(7);
  });
});
