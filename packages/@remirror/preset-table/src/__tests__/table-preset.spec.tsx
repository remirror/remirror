import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { TablePreset } from '..';

describe('schema', () => {
  const { schema } = createCoreManager([new TablePreset()]);

  const { doc, table, tableRow, tableCell, tableHeaderCell, p } = pmBuild(schema, {
    table: { nodeType: 'table' },
    tableRow: { nodeType: 'tableRow' },
    tableCell: { nodeType: 'tableCell' },
    tableHeaderCell: { nodeType: 'tableHeaderCell' },
  });

  const node = table(
    tableRow(tableHeaderCell(p('Header')), tableHeaderCell(p('Header'))),
    tableRow(tableCell(p('A1')), tableCell(p('B1'))),
    tableRow(tableCell(p('A2')), tableCell(p('B2'))),
    tableRow(tableCell(p('A3')), tableCell(p('B3'))),
  );

  const html =
    '<table><tbody><tr><th><p>Header</p></th><th><p>Header</p></th></tr><tr><td><p>A1</p></td><td><p>B1</p></td></tr><tr><td><p>A2</p></td><td><p>B2</p></td></tr><tr><td><p>A3</p></td><td><p>B3</p></td></tr></tbody></table>';

  it('outputs the correct html', () => {
    expect(toHtml({ node, schema })).toBe(html);
  });

  it('parses from html', () => {
    expect(fromHtml({ content: html, schema })).toEqualProsemirrorNode(doc(node));
  });
});

function create() {
  return renderEditor([new TablePreset()]);
}

describe('commands', () => {
  const setup = () => {
    const {
      commands,
      view,
      add,
      nodes: { doc, p, table, tableRow: row, tableCell: cell, tableHeaderCell: header },
    } = create();

    const build = (...rows: string[][]) => {
      // Ensure that all rows have same length
      expect([...new Set(rows.map((row) => row.length))]).toHaveLength(1);

      return table(...rows.map((r) => row(...r.map((content) => cell(p(content))))));
    };

    return {
      commands,
      view,
      add,
      doc,
      p,
      row,
      cell,
      header,
      table,
      build,
    };
  };

  it('#addTableColumnAfter', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1', 'B1<cursor>', 'C1'], ['A2', 'B2', 'C2']);
    add(doc(table));
    commands.addTableColumnAfter();

    const expected = doc(build(['A1', 'B1', '', 'C1'], ['A2', 'B2', '', 'C2']));
    expect(view.state.doc).toEqualRemirrorDocument(expected);
  });

  it('#addTableColumnBefore', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1', 'B1', 'C1'], ['A2', 'B2<cursor>', 'C2']);
    add(doc(table));

    commands.addTableColumnBefore();

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(build(['A1', '', 'B1', 'C1'], ['A2', '', 'B2', 'C2'])),
    );
  });

  it('#addTableRowAfter', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1<cursor>', 'B1'], ['A2', 'B2']);
    add(doc(table));

    commands.addTableRowAfter();

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(build(['A1', 'B1'], ['', ''], ['A2', 'B2'])),
    );
  });

  it('#addTableRowBefore', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1', 'B1<cursor>'], ['A2', 'B2']);
    add(doc(table));

    commands.addTableRowBefore();

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(build(['', ''], ['A1', 'B1'], ['A2', 'B2'])),
    );
  });

  it('#deleteTableColumn', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1', 'B1', 'C1'], ['A2<cursor>', 'B2', 'C2']);
    add(doc(table));

    commands.deleteTableColumn();

    expect(view.state.doc).toEqualRemirrorDocument(doc(build(['B1', 'C1'], ['B2', 'C2'])));
  });

  it('#deleteTableRow', () => {
    const { add, doc, commands, view, build } = setup();
    const table = build(['A1', 'B1', 'C1'], ['A2', 'B2<cursor>', 'C2'], ['A3', 'B3', 'C3']);
    add(doc(table));

    commands.deleteTableRow();

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(build(['A1', 'B1', 'C1'], ['A3', 'B3', 'C3'])),
    );
  });

  it('#deleteTable', () => {
    const { add, doc, commands, view, build, p } = setup();
    const table = build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3<cursor>', 'C3']);
    add(doc(table));

    commands.deleteTable();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p()));
  });
});
