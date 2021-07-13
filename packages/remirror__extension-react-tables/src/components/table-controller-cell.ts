import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { ExtensionTablesTheme } from '@remirror/theme';

import { createControllerEvents } from '../utils/controller';
import { h } from '../utils/dom';
import TableInsertButtonTrigger from './table-insert-button-trigger';
import TableInsertMark from './table-insert-mark';

export interface TableControllerCellProps {
  view: EditorView;
  getPos: () => number;
  contentDOM: HTMLElement;
}

const TableControllerCell = ({
  view,
  getPos,
  contentDOM,
}: TableControllerCellProps): HTMLElement => {
  const findTable = (): FindProsemirrorNodeResult | undefined => {
    return findParentNodeOfType({
      types: 'table',
      selection: view.state.doc.resolve(getPos()),
    });
  };

  const events = createControllerEvents({ view, findTable });

  const wrapper = h(
    'div',
    { contentEditable: 'false', className: ExtensionTablesTheme.TABLE_CONTROLLER_WRAPPER },
    contentDOM,
    ...TableInsertButtonTrigger({ view, findTable }),
    ...TableInsertMark(),
  );

  return h(
    'th',
    {
      contentEditable: 'false',
      className: `${ExtensionTablesTheme.TABLE_CONTROLLER} ${ExtensionTablesTheme.CONTROLLERS_TOGGLE}`,
      ...events,
    },
    wrapper,
  );
};

export default TableControllerCell;
