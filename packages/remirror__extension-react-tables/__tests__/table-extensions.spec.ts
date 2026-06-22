import { extensionValidityTest, renderEditor } from 'jest-remirror';

import {
  TableCellExtension,
  TableControllerCellExtension,
  TableExtension,
  TableHeaderCellExtension,
  TableRowExtension,
} from '../';

extensionValidityTest(TableExtension);
extensionValidityTest(TableCellExtension);
extensionValidityTest(TableControllerCellExtension);
extensionValidityTest(TableHeaderCellExtension);
extensionValidityTest(TableRowExtension);

describe('keyboard shortcuts', () => {
  it('deletes a React table with Backspace from the following paragraph', () => {
    const editor = renderEditor<TableExtension>([new TableExtension({ resizable: false })]);
    const { add, attributeNodes, nodes, press, view } = editor;
    const { doc, p, tableCell: cell, tableControllerCell: controller, tableRow: row } = nodes;
    const { table } = attributeNodes;

    const reactTable = table({ isControllersInjected: true })(
      row(controller(), controller(), controller()),
      row(controller(), cell(p('A1')), cell(p('B1'))),
      row(controller(), cell(p('A2')), cell(p('B2'))),
    );

    add(doc(reactTable, p('<cursor>')));
    press('Backspace');

    expect(view.state.doc).toEqualRemirrorDocument(doc(p()));
  });
});
