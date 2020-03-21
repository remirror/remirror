import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { fromHTML, toHTML } from '@remirror/core';
import { BaseKeymapExtension } from '@remirror/core-extensions';
import { createBaseTestManager } from '@remirror/test-fixtures';

import { TableCellExtension, TableExtension, TableRowExtension } from '..';

describe('schema', () => {
  const { schema } = createBaseTestManager([
    { extension: new TableExtension() },
    { extension: new TableRowExtension() },
    { extension: new TableCellExtension() },
  ]);

  const { doc, table, tableRow, tableCell } = pmBuild(schema, {
    table: { nodeType: 'table' },
    tableRow: { nodeType: 'tableRow' },
    tableCell: { nodeType: 'tableCell' },
  });

  const node = table(
    tableRow(tableCell('A1'), tableCell('B1')),
    tableRow(tableCell('A2'), tableCell('B2')),
    tableRow(tableCell('A3'), tableCell('B3')),
  );

  const html = `<table><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr><tr><td>A3</td><td>B3</td></tr></table>`;

  it('dump to html', () => {
    expect(toHTML({ node, schema })).toBe(html);
  });

  it('parse from html', () => {
    expect(fromHTML({ content: html, schema })).toEqualProsemirrorNode(doc(node));
  });
});

const create = () =>
  renderEditor({
    plainNodes: [new TableExtension(), new TableRowExtension(), new TableCellExtension()],
    others: [{ priority: 10, extension: new BaseKeymapExtension() }],
  });

describe('command', () => {
  const setup = () => {
    const {
      view,
      add,
      nodes: { doc, p, table, tableRow, tableCell },
    } = create();

    const buildRegularTable = (rows: string[][]) => {
      // Esnure that all rows have same length
      expect(Array.from(new Set(rows.map((row) => row.length)))).toHaveLength(1);

      return table(...rows.map((row) => tableRow(...row.map((cell) => tableCell(cell)))));
    };

    return {
      view,
      add,
      doc,
      p,
      buildRegularTable,
    };
  };

  let { add, doc, p, buildRegularTable } = setup();

  beforeEach(() => {
    ({ add, doc, p, buildRegularTable } = setup());
  });

  test('tableAddColumnAfter', () => {
    const table = buildRegularTable([
      ['A1', 'B1<cursor>', 'C1'],
      ['A2', 'B2', 'C2'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableAddColumnAfter());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['A1', 'B1', '', 'C1'],
          ['A2', 'B2', '', 'C2'],
        ]),
      ),
    );
  });

  test('tableAddColumnBefore', () => {
    const table = buildRegularTable([
      ['A1', 'B1', 'C1'],
      ['A2', 'B2<cursor>', 'C2'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableAddColumnBefore());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['A1', '', 'B1', 'C1'],
          ['A2', '', 'B2', 'C2'],
        ]),
      ),
    );
  });

  test('tableAddRowAfter', () => {
    const table = buildRegularTable([
      ['A1<cursor>', 'B1'],
      ['A2', 'B2'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableAddRowAfter());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['A1', 'B1'],
          ['', ''],
          ['A2', 'B2'],
        ]),
      ),
    );
  });

  test('tableAddRowBefore', () => {
    const table = buildRegularTable([
      ['A1', 'B1<cursor>'],
      ['A2', 'B2'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableAddRowBefore());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['', ''],
          ['A1', 'B1'],
          ['A2', 'B2'],
        ]),
      ),
    );
  });

  test('tableDeleteColumn', () => {
    const table = buildRegularTable([
      ['A1', 'B1', 'C1'],
      ['A2<cursor>', 'B2', 'C2'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableDeleteColumn());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['B1', 'C1'],
          ['B2', 'C2'],
        ]),
      ),
    );
  });

  test('tableDeleteRow', () => {
    const table = buildRegularTable([
      ['A1', 'B1', 'C1'],
      ['A2', 'B2<cursor>', 'C2'],
      ['A3', 'B3', 'C3'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableDeleteRow());

    expect(state.doc).toEqualRemirrorDocument(
      doc(
        buildRegularTable([
          ['A1', 'B1', 'C1'],
          ['A3', 'B3', 'C3'],
        ]),
      ),
    );
  });

  test('tableDeleteTable', () => {
    const table = buildRegularTable([
      ['A1', 'B1', 'C1'],
      ['A2', 'B2', 'C2'],
      ['A3', 'B3<cursor>', 'C3'],
    ]);
    const { state } = add(doc(table)).actionsCallback((actions) => actions.tableDeleteTable());

    expect(state.doc).toEqualRemirrorDocument(doc(p()));
  });
});
