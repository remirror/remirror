import { css } from 'linaria';

export const editorStyles = css`
  .ProseMirror {
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
    }
    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: var(--remirror-hue-blue-9);
      pointer-events: none;
    }
    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }

    /* Give selected cells a blue overlay */
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
  }
`;
