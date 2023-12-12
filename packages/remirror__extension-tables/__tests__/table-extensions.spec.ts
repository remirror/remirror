import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from 'remirror';
import { BoldExtension, createCoreManager } from 'remirror/extensions';

import {
  TableCellExtension,
  TableExtension,
  TableHeaderCellExtension,
  TableRowExtension,
} from '../';
import { TableOptions } from '../src';

extensionValidityTest(TableExtension);
extensionValidityTest(TableCellExtension);
extensionValidityTest(TableHeaderCellExtension);
extensionValidityTest(TableRowExtension);

describe('schema', () => {
  const { schema } = createCoreManager(() => [new TableExtension()]);

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
    expect(prosemirrorNodeToHtml(node)).toBe(html);
  });

  it('parses from html', () => {
    expect(htmlToProsemirrorNode({ content: html, schema })).toEqualProsemirrorNode(doc(node));
  });
});

function create(options?: TableOptions) {
  return renderEditor<TableExtension>([new TableExtension(options)]);
}

describe('commands', () => {
  const setup = (options?: TableOptions) => {
    const editor = create(options);

    const { commands, view, add, press } = editor;
    const { doc, p, table, tableRow: row, tableCell: cell, tableHeaderCell: header } = editor.nodes;

    const build = (...rows: string[][]) => {
      // Ensure that all rows have same length
      expect([...new Set(rows.map((row) => row.length))]).toHaveLength(1);

      return table(...rows.map((r) => row(...r.map((content) => cell(p(content))))));
    };

    const buildWithHeader = (type: 'row' | 'column', ...rows: string[][]) => {
      // Ensure that all rows have same length
      expect([...new Set(rows.map((row) => row.length))]).toHaveLength(1);

      return table(
        ...rows.map((r, i) => {
          if (type === 'row' && i === 0) {
            return row(...r.map((content) => header(p(content))));
          }

          return row(
            ...r.map((content, j) => {
              if (type === 'column' && j === 0) {
                return header(p(content));
              }

              return cell(p(content));
            }),
          );
        }),
      );
    };

    return {
      editor,
      commands,
      view,
      add,
      press,
      doc,
      p,
      row,
      cell,
      header,
      table,
      build,
      buildWithHeader,
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

  describe('createTable', () => {
    it('can create a table', () => {
      const { build, add, view, commands, doc, p } = setup();

      add(doc(p('text<cursor>')));
      expect(commands.createTable.enabled()).toBe(true);
      commands.createTable({ columnsCount: 2, rowsCount: 2, withHeaderRow: false });

      expect(view.state.doc).toEqualRemirrorDocument(doc(p('text'), build(['', ''], ['', ''])));
    });

    it('does not create with an active selection', () => {
      const { add, view, commands, doc, p } = setup();

      add(doc(p('<start>text<end>')));
      expect(commands.createTable.enabled({})).toBe(false);
      commands.createTable({ columnsCount: 2, rowsCount: 2, withHeaderRow: false });

      expect(view.state.doc).toEqualRemirrorDocument(doc(p('text')));
    });
  });

  describe('toggleTableHeader', () => {
    it('can toggle the first row of cells into a header row', () => {
      const { build, buildWithHeader, add, view, commands, doc } = setup();

      const table = build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3<cursor>', 'C3']);
      add(doc(table));

      commands.toggleTableHeader();

      expect(view.state.doc).toEqualRemirrorDocument(
        doc(buildWithHeader('row', ['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3'])),
      );
    });

    it('can toggle the first row of header cells into a normal cell row', () => {
      const { build, buildWithHeader, add, view, commands, doc } = setup();

      const table = buildWithHeader(
        'row',
        ['A1', 'B1', 'C1'],
        ['A2<cursor>', 'B2', 'C2'],
        ['A3', 'B3', 'C3'],
      );
      add(doc(table));

      commands.toggleTableHeader();

      expect(view.state.doc).toEqualRemirrorDocument(
        doc(build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3'])),
      );
    });

    it('can toggle the first column of cells into a header column', () => {
      const { build, buildWithHeader, add, view, commands, doc } = setup();

      const table = build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3<cursor>', 'C3']);
      add(doc(table));

      commands.toggleTableHeader('column');

      expect(view.state.doc).toEqualRemirrorDocument(
        doc(buildWithHeader('column', ['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3'])),
      );
    });

    it('can toggle the first column of header cells into a normal cell column', () => {
      const { build, buildWithHeader, add, view, commands, doc } = setup();

      const table = buildWithHeader(
        'column',
        ['A1', 'B1', 'C1'],
        ['A2<cursor>', 'B2', 'C2'],
        ['A3', 'B3', 'C3'],
      );
      add(doc(table));

      commands.toggleTableHeader('column');

      expect(view.state.doc).toEqualRemirrorDocument(
        doc(build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3'])),
      );
    });
  });

  describe('tableHasHeader (helper)', () => {
    it('detects when the table has a header row', () => {
      const { buildWithHeader, add, editor, doc } = setup();

      const table = buildWithHeader(
        'row',
        ['A1', 'B1', 'C1'],
        ['A2<cursor>', 'B2', 'C2'],
        ['A3', 'B3', 'C3'],
      );
      add(doc(table));

      expect(editor.helpers.tableHasHeader()).toBeTrue();
    });

    it('detects when the table does NOT have a header row', () => {
      const { build, add, editor, doc } = setup();

      const table = build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3<cursor>', 'C3']);
      add(doc(table));

      expect(editor.helpers.tableHasHeader()).toBeFalse();
    });

    it('detects when the table has a header column', () => {
      const { buildWithHeader, add, editor, doc } = setup();

      const table = buildWithHeader(
        'column',
        ['A1', 'B1', 'C1'],
        ['A2<cursor>', 'B2', 'C2'],
        ['A3', 'B3', 'C3'],
      );
      add(doc(table));

      expect(editor.helpers.tableHasHeader('column')).toBeTrue();
    });

    it('detects when the table does NOT have a header column', () => {
      const { build, add, editor, doc } = setup();

      const table = build(['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3<cursor>', 'C3']);
      add(doc(table));

      expect(editor.helpers.tableHasHeader('column')).toBeFalse();
    });
  });

  describe('keyboard shortcuts', () => {
    it('pressing Tab does nothing by default', () => {
      const { build, add, press, view, doc } = setup();

      const table = build(['A1', 'B1<cursor>', 'C1']);
      add(doc(table));

      press('Tab');

      const { from, to } = view.state.selection;
      expect(from).toBe(12);
      expect(to).toBe(12);
    });

    it('pressing Shift-Tab does nothing', () => {
      const { build, add, press, view, doc } = setup();

      const table = build(['A1', 'B1<cursor>', 'C1']);
      add(doc(table));

      press('Shift-Tab');

      const { from, to } = view.state.selection;
      expect(from).toBe(12);
      expect(to).toBe(12);
    });

    it('pressing Tab takes me to the next cell if `tabKeyboardShortcuts` is enabled', () => {
      const { build, add, press, view, doc } = setup({ tabKeyboardShortcuts: true });

      const table = build(['A1', 'B1<cursor>', 'C1']);
      add(doc(table));

      press('Tab');

      const { from, to } = view.state.selection;
      expect(from).toBe(16);
      expect(to).toBe(18);
      expect(view.state.doc.textBetween(16, 18)).toBe('C1');
    });

    it('pressing Shift-Tab takes me to the previous cell if `tabKeyboardShortcuts` is enabled', () => {
      const { build, add, press, view, doc } = setup({ tabKeyboardShortcuts: true });

      const table = build(['A1', 'B1<cursor>', 'C1']);
      add(doc(table));

      press('Shift-Tab');

      const { from, to } = view.state.selection;
      expect(from).toBe(4);
      expect(to).toBe(6);
      expect(view.state.doc.textBetween(4, 6)).toBe('A1');
    });
  });
});

// Test to replicate https://github.com/remirror/remirror/issues/677
test('it can be run with other commands', () => {
  const editor = renderEditor(() => [new BoldExtension(), new TableExtension()]);
  const { doc, p } = editor.nodes;
  editor.add(doc(p('<start>hello<end>')));

  expect(() => editor.commands.toggleBold()).not.toThrow();
});
