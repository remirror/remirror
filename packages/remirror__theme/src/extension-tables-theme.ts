import { css } from '@linaria/core';

import { getTheme } from './utils';

const controllerSize = 12;
const markRadius = 2;

// following two class names are provided by `prosemirror-tables`
export const COLUMN_RESIZE_HANDLE = 'column-resize-handle';
export const SELECTED_CELL = 'selectedCell';

/////////////////////////////////////////////////////////////////

export const EDITOR = css`
  &.ProseMirror {
    .tableWrapper {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      overflow: hidden;
    }

    td,
    th {
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      border-width: 1px;
      border-style: solid;
      border-color: ${getTheme((t) => t.color.table.default.border)};
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 40;
      background-color: ${getTheme((t) => t.hue.blue[7])};
      pointer-events: none;
    }

    &.resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }

    /* Give selected cells a blue overlay */
    /* We don't need this anymore -- 2021-04-03 ocavue */
    /*
    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }
    */
    th.${SELECTED_CELL}, td.${SELECTED_CELL} {
      border-style: double;
      border-color: ${getTheme((t) => t.color.table.selected.border)};
      background-color: ${getTheme((t) => t.color.table.selected.cell)};
    }
  }
` as 'remirror-editor';

/////////////////////////////////////////////////////////////////

export const TABLE = 'remirror-table';
export const TABLE_SHOW_CONTROLLERS = 'remirror-table-show-controllers';
export const TABLE_CONTROLLER = 'remirror-table-controller';
export const TABLE_CONTROLLER_WRAPPER = 'remirror-table-controller-wrapper';
export const TABLE_CONTROLLER_TRIGGER_AREA = 'remirror-table-controller-trigger-area';
export const TABLE_CONTROLLER_MARK_ROW_CORNER = 'remirror-table-controller-mark-row-corner';
export const TABLE_CONTROLLER_MARK_COLUMN_CORNER = 'remirror-table-controller-mark-column-corner';

/**
 * A set of CSS style segements that can be reused multiple times later
 *
 * Since linaria has a limit ability to extend style (compared to emotion), we
 * need to write the CSS style segements as string values and then use then in
 * the `css` template literals.
 */
const CSSSegements = (() => {
  // To get the benefits from typescript-styled-plugin like auto-completion and
  // syntax error reporting, we create a fake "css" function to cheat it.
  const css = String.raw;

  const tableController = css`
    overflow: visible;
    padding: 0;
    cursor: pointer;
    z-index: 15;
    position: relative;
  `;

  const tableControllerTriggerArea = css`
    flex: 1;
    position: relative;
    z-index: 10;

    /* Style for debug. Use linear-gradient as background so that we can differentiate two neighbor areas. */
    /* background: linear-gradient(to left top, rgba(0, 255, 100, 0.2), rgba(200, 100, 255, 0.2)); */
  `;

  const tableControllerWrapper = css`
    overflow: visible;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  `;

  const tableControllerMark = css`
    position: absolute;
    width: 0px;
    height: 0px;
    border-radius: 50%;
    border-style: solid;
    border-color: ${getTheme((t) => t.color.table.mark)};
    border-width: ${markRadius}px;
  `;

  const tableControllerMarkRowCorner = css`
    bottom: -${markRadius}px;
    left: -12px;

    ${tableControllerMark}
  `;

  const tableControllerMarkColumnCorner = css`
    ${tableControllerMark}

    right: -${markRadius}px;
    top: -12px;
  `;

  const tableCornerController = css`
    ${tableController}

    height: ${controllerSize}px;
    width: ${controllerSize}px;

    & div.${TABLE_CONTROLLER_WRAPPER} {
      ${tableControllerWrapper}

      width: ${controllerSize}px;
      height: ${controllerSize}px;
    }

    & div.${TABLE_CONTROLLER_TRIGGER_AREA} {
      ${tableControllerTriggerArea}

      display: none;
    }

    & div.${TABLE_CONTROLLER_MARK_ROW_CORNER} {
      ${tableControllerMarkRowCorner}
    }
    & div.${TABLE_CONTROLLER_MARK_COLUMN_CORNER} {
      ${tableControllerMarkColumnCorner}
    }
  `;

  const tableColumnController = css`
    ${tableController}

    height: ${controllerSize}px;

    & div.${TABLE_CONTROLLER_WRAPPER} {
      ${tableControllerWrapper}

      width: 100%;
      height: ${controllerSize}px;
      flex-direction: row;
    }

    & div.${TABLE_CONTROLLER_TRIGGER_AREA} {
      ${tableControllerTriggerArea}

      height: 36px;
    }

    & div.${TABLE_CONTROLLER_MARK_ROW_CORNER} {
      display: none;
    }
    & div.${TABLE_CONTROLLER_MARK_COLUMN_CORNER} {
      ${tableControllerMarkColumnCorner}
    }
  `;

  const tableRowController = css`
    ${tableController}

    width: ${controllerSize}px;

    & div.${TABLE_CONTROLLER_WRAPPER} {
      ${tableControllerWrapper}

      height: 100%;
      width: ${controllerSize}px;
      flex-direction: column;
    }

    & div.${TABLE_CONTROLLER_TRIGGER_AREA} {
      ${tableControllerTriggerArea}

      width: 36px;
    }

    & div.${TABLE_CONTROLLER_MARK_ROW_CORNER} {
      ${tableControllerMarkRowCorner}
    }
    & div.${TABLE_CONTROLLER_MARK_COLUMN_CORNER} {
      display: none;
    }
  `;

  return {
    tableCornerController,
    tableColumnController,
    tableRowController,
  };
})();

export const TABLE_COLGROUP = css`
  & > col:first-of-type {
    width: ${controllerSize + 1}px;
    overflow: visible;
  }
` as 'remirror-table-colgroup';

// Any element with this class will be hidden when the controllers are hidden
export const CONTROLLERS_TOGGLE = css`
  visibility: hidden;

  .${TABLE_SHOW_CONTROLLERS} & {
    visibility: visible;
  }
` as 'remirror-table-controllers-toggle';

export const TABLE_INSERT_BUTTON = css`
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 25;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 150ms ease;

  background-color: #dcdcdc;
  & svg {
    fill: #ffffff;
  }

  &:hover {
    background-color: #136bda;
    & svg {
      fill: #ffffff;
    }
  }
` as `remirror-table-insert-button`;

export const TABLE_DELETE_ROW_COLUMN_INNER_BUTTON = css`
  top: calc(var(--remirror-table-delete-button-y) - 9px);
  left: calc(var(--remirror-table-delete-button-x) - 9px);
  width: 18px;
  height: 18px;

  position: absolute;
  z-index: 30;
  cursor: pointer;
  border-radius: 4px;
  background-color: #cecece;
  transition: background-color 150ms ease;
  &:hover {
    background-color: #ff7884;
  }
` as 'remirror-table-delete-row-column-inner-button';

export const TABLE_WITH_CONTROLLERS = css`
  /* Space for marks */
  margin-top: 40px;

  /* To make controller's 'height: 100%' works, table must set its own height. */
  height: 1px;

  /* To show marks */
  .ProseMirror table& {
    overflow: visible;
  }
` as 'remirror-table-with-controllers';

export const TABLE_WAITTING_CONTROLLERS = css`
  /* Hide the table before controllers injected */
  display: none;
` as 'remirror-table-waitting-controllers';

export const TABLE_TBODY_WITH_CONTROLLERS = css`
  /* First row contains one corner controller and multiple column controllers */
  & > tr:nth-of-type(1) {
    height: ${controllerSize}px;
    overflow: visible;

    /* First controller cell is the corner controller */
    & th:nth-of-type(1) {
      ${CSSSegements.tableCornerController}
    }

    /* Second and more cells are column controllers */
    & th:nth-of-type(n + 2) {
      ${CSSSegements.tableColumnController}
    }
  }

  /* Second and more rows containes row controllers */
  & > tr:nth-of-type(n + 2) {
    /* First controller cell in each row is a row controller */
    & th {
      ${CSSSegements.tableRowController}
    }
  }

  /* Styles for default */
  & {
    th.${TABLE_CONTROLLER} {
      background-color: ${getTheme((t) => t.color.table.default.controller)};
    }
  }

  /* Styles for selected */
  & {
    th.${SELECTED_CELL}.${TABLE_CONTROLLER} {
      background-color: ${getTheme((t) => t.color.table.selected.controller)};
    }
  }
` as 'remirror-table-tbody-with-controllers';

export const TABLE_SHOW_PREDELETE = css`
  /* Styles for predelete */
  & {
    th.${SELECTED_CELL}.${SELECTED_CELL}.${TABLE_CONTROLLER} {
      background-color: ${getTheme((t) => t.color.table.predelete.controller)};
    }
    th.${SELECTED_CELL}.${SELECTED_CELL}, td.${SELECTED_CELL}.${SELECTED_CELL} {
      border-color: ${getTheme((t) => t.color.table.predelete.border)};
      background-color: ${getTheme((t) => t.color.table.predelete.cell)};
    }
  }
` as 'remirror-table-show-predelete';
