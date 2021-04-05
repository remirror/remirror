import { css } from '@emotion/css';
import {
  EditorState,
  findParentNodeOfType,
  FindProsemirrorNodeResult,
  ProsemirrorPlugin,
} from '@remirror/core';
import { Plugin, PluginKey, Transaction } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { ExtensionTablesTheme, getTheme } from '@remirror/theme';

import { InsertButtonAttrs } from './components/table-insert-button';

const preselectBorderColor = getTheme((t) => t.color.table.preselect.border);
const preselectControllerBackgroundColor = getTheme((t) => t.color.table.preselect.controller);

export function getTableStyle(attrs: ControllerStateValues): string {
  const preselectClass = css`
    /* Make the border-style 'double' instead of 'solid'. This works because 'double' has a higher priority than 'solid' */
    border-style: double;
    border-color: ${preselectBorderColor};
  `;

  const preselectControllerClass = css`
    ${preselectClass}
    background-color: ${preselectControllerBackgroundColor};
  `;

  let classNames = '';

  if (attrs.preselectColumn !== -1) {
    classNames = css`
      & table.${ExtensionTablesTheme.TABLE} tbody tr {
        td:nth-child(${attrs.preselectColumn + 1}) {
          ${preselectClass};
        }
        th.${ExtensionTablesTheme.TABLE_CONTROLLER}:nth-child(${attrs.preselectColumn + 1}) {
          ${preselectControllerClass}
        }
      }
    `;
  } else if (attrs.preselectRow !== -1) {
    classNames = css`
      & table.${ExtensionTablesTheme.TABLE} tbody tr:nth-child(${attrs.preselectRow + 1}) {
        td,
        th {
          ${preselectClass};
        }
        th.${ExtensionTablesTheme.TABLE_CONTROLLER} {
          ${preselectControllerClass}
        }
      }
    `;
  } else if (attrs.preselectTable) {
    classNames = css`
      & table.${ExtensionTablesTheme.TABLE} tbody tr {
        td,
        th {
          ${preselectClass};
        }
        th.${ExtensionTablesTheme.TABLE_CONTROLLER}.${ExtensionTablesTheme.TABLE_CONTROLLER} {
          ${preselectControllerClass}
        }
      }
    `;
  }

  return classNames;
}

const key = new PluginKey<ControllerState>('remirrorTableControllerPluginKey');

export { key as tableControllerPluginKey };

export function createTableControllerPlugin(): ProsemirrorPlugin<ControllerState> {
  return new Plugin<ControllerState>({
    key: key,
    state: {
      init() {
        return new ControllerState({});
      },
      apply(tr, prev: ControllerState) {
        return prev.apply(tr);
      },
    },
    props: {
      decorations: (state: EditorState) => {
        const controllerState = key.getState(state);

        if (!controllerState) {
          return null;
        }

        const { tableNodeResult, predelete } = controllerState.values;

        if (tableNodeResult) {
          const styleClassName = getTableStyle(controllerState.values);
          let className = `${ExtensionTablesTheme.TABLE_SHOW_CONTROLLERS} ${styleClassName}`;

          if (predelete) {
            className += ` ${ExtensionTablesTheme.TABLE_SHOW_PREDELETE}`;
          }

          const decorations = [
            Decoration.node(tableNodeResult.pos, tableNodeResult.end, {
              class: className,
            }),
          ];
          return DecorationSet.create(state.doc, decorations);
        }

        return null;
      },
    },
  });
}

interface ControllerStateValues {
  tableNodeResult: FindProsemirrorNodeResult | null | undefined; // the table that contains current selection.
  preselectTable: boolean; // if this value is true, all table cells will have a "preselect" style.
  preselectColumn: number; // if this value is not -1, all cells in this table column will have a "preselect" style.
  preselectRow: number; // if this value is not -1, all cells in this table row will have a "preselect" style.
  predelete: boolean; // if this value is true, all selected cells will have a "predelete" style.
  insertButtonAttrs: InsertButtonAttrs | null; // if and only if `insertButtonAttrs` exists, InsertButton will show.
}

type ControllerStateProps = Omit<Partial<ControllerStateValues>, 'tableNodeResult'>;

class ControllerState {
  public values: ControllerStateValues;

  constructor(public action: ControllerStateProps) {
    this.values = {
      tableNodeResult: null,
      preselectTable: false,
      preselectColumn: -1,
      preselectRow: -1,
      predelete: false,
      insertButtonAttrs: null,
      ...action,
    };
  }

  apply(tr: Transaction): ControllerState {
    this.values.tableNodeResult = findParentNodeOfType({
      types: 'table',
      selection: tr.selection,
    });

    const props: ControllerStateProps | null = tr.getMeta(key);

    if (props) {
      return new ControllerState({ ...this.values, ...props });
    }

    return this;
  }
}

export function setControllerPluginMeta(tr: Transaction, props: ControllerStateProps): Transaction {
  return tr.setMeta(key, props);
}
