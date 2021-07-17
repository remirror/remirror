/**
 * @module
 *
 * A grid size component for creating a table of a specific size into the
 * editor.
 */

import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';
import { createRef, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { clamp, cx } from '@remirror/core';
import { Rect } from '@remirror/extension-positioner';
import { ComponentsTheme } from '@remirror/theme';

/**
 * The component used to insert a table into the editor of a given size.
 */
export const TableSizeEditorComponent = ({
  MetricsComponent,
  ...props
}: TableSizeEditorProps): JSX.Element => {
  const [state, setState] = useState<SelectTableSizeState>({ columns: 1, rows: 1 });
  const instance = useRef(new TableSizeRef({ props, state, setState }));
  instance.current.props = props;
  instance.current.state = state;

  useEffect(() => {
    return instance.current.unmount;
  }, []);

  let rows = Math.max(5, state.rows);
  let columns = Math.max(5, state.columns);

  if (rows === state.rows) {
    rows = Math.min(MAX_SIZE, rows + 1);
  }

  if (columns === state.columns) {
    columns = Math.min(MAX_SIZE, columns + 1);
  }

  const cells = [];
  let ii = 0;
  let y = 0;
  let width = 0;
  let height = 0;

  while (ii < rows) {
    y += GUTTER_SIZE;
    let jj = 0;
    let x = 0;

    while (jj < columns) {
      x += GUTTER_SIZE;
      const selected = ii < rows && jj < columns;
      cells.push(
        <TableSizeEditorCell key={`${String(ii)}-${String(jj)}`} selected={selected} x={x} y={y} />,
      );
      x += CELL_SIZE;
      width = x + GUTTER_SIZE;
      jj++;
    }

    y += CELL_SIZE;
    height = y + GUTTER_SIZE;
    ii++;
  }

  const metrics = MetricsComponent ? (
    <MetricsComponent rows={rows} columns={columns} />
  ) : (
    `${rows} x ${columns}`
  );

  return (
    <div className={ComponentsTheme.TABLE_SIZE_EDITOR} ref={instance.current.ref}>
      <div
        className={ComponentsTheme.TABLE_SIZE_EDITOR_BODY}
        onMouseDown={instance.current.onMouseDown}
        onMouseEnter={instance.current.onMouseEnter}
        style={{ width, height }}
      >
        {cells}
      </div>
      <div className={ComponentsTheme.TABLE_SIZE_EDITOR_FOOTER}>{metrics}</div>
    </div>
  );
};

const GUTTER_SIZE = 5;
const CELL_SIZE = 16;
const MAX_SIZE = 20;

interface TableSizeEditorCellProps {
  x: number;
  y: number;
  selected: boolean;
}

const TableSizeEditorCell = (props: TableSizeEditorCellProps): JSX.Element => {
  return (
    <div
      className={cx(
        ComponentsTheme.TABLE_SIZE_EDITOR_CELL,
        props.selected && ComponentsTheme.TABLE_SIZE_EDITOR_CELL_SELECTED,
      )}
      style={{ top: props.y, left: props.x }}
    />
  );
};

interface SelectTableSizeState {
  columns: number;
  rows: number;
}

type SelectTableSizeCallback = (selected: SelectTableSizeState) => void;

export interface TableSizeEditorProps {
  /**
   * Called when a cell is selected.
   */
  onSelect: SelectTableSizeCallback;

  /**
   * Create a custom display for the metric component.
   */
  MetricsComponent?: ComponentType<SelectTableSizeState>;
}

interface TableSizeRefProps {
  props: TableSizeEditorProps;
  state: SelectTableSizeState;
  setState: Dispatch<SetStateAction<SelectTableSizeState>>;
}

class TableSizeRef {
  #targetX = 0;
  #targetY = 0;
  #mouseX = 0;
  #mouseY = 0;
  #animationFrame = 0;
  #entered = false;

  readonly ref = createRef<HTMLDivElement>();
  readonly setState: Dispatch<SetStateAction<SelectTableSizeState>>;

  props: TableSizeEditorProps;
  state: SelectTableSizeState;

  constructor({ props, state, setState }: TableSizeRefProps) {
    this.props = props;
    this.state = state;
    this.setState = setState;
  }

  unmount(): void {
    if (this.#entered) {
      document.removeEventListener('mousemove', this.onMouseMove, true);
    }

    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }
  }

  readonly onMouseEnter = (event: ReactMouseEvent<HTMLElement, MouseEvent>): void => {
    const node = event.currentTarget;

    if (node instanceof HTMLElement) {
      const rect = fromHtmlElement(node);
      const mouseX = Math.round(event.clientX);
      const mouseY = Math.round(event.clientY);
      this.#targetX = rect.x;
      this.#targetY = rect.y;
      this.#mouseX = mouseX;
      this.#mouseY = mouseY;

      if (!this.#entered) {
        this.#entered = true;
        document.addEventListener('mousemove', this.onMouseMove, true);
      }
    }
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (this.ref.current) {
      const elementRect = htmlElementToRect(this.ref.current);
      const mouseRect = fromXY(event.screenX, event.screenY, 10);

      if (isIntersected(elementRect, mouseRect, 50)) {
        // This prevents `Reakit` from collapsing the editor`.
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    const mouseX = Math.round(event.clientX);
    const mouseY = Math.round(event.clientY);

    if (mouseX !== this.#mouseX || mouseY !== this.#mouseY) {
      this.#mouseX = mouseX;
      this.#mouseY = mouseY;
      this.#animationFrame && cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = requestAnimationFrame(this.updateGridSize);
    }
  };

  readonly onMouseDown = (event: ReactMouseEvent<HTMLElement, MouseEvent>): void => {
    event.preventDefault();
    this.props.onSelect(this.state);
  };

  private readonly updateGridSize = (): void => {
    this.#animationFrame = 0;
    const x = this.#mouseX - this.#targetX;
    const y = this.#mouseY - this.#targetY;
    const rows = clamp({ min: 1, max: MAX_SIZE, value: Math.ceil(y / (CELL_SIZE + GUTTER_SIZE)) });
    const columns = clamp({
      min: 1,
      max: MAX_SIZE,
      value: Math.ceil(x / (CELL_SIZE + GUTTER_SIZE)),
    });

    if (this.state.rows !== rows || this.state.columns !== columns) {
      this.setState({ rows: rows, columns: columns });
    }
  };
}

function fromHtmlElement(element: HTMLElement): Rect {
  const display = document.defaultView?.getComputedStyle(element).display;

  if (display === 'contents' && element.children.length === 1) {
    // el has no layout at all, use its children instead.
    return fromHtmlElement(element.children[0] as HTMLElement);
  }

  return htmlElementToRect(element);
}

function htmlElementToRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();

  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

function isIntersected(r1: Rect, r2: Rect, padding = 0): boolean {
  return !(
    r2.x - padding > r1.x + r1.width + padding ||
    r2.x + r2.width + padding < r1.x - padding ||
    r2.y - padding > r1.y + r1.height + padding ||
    r2.y + r2.height + padding < r1.y - padding
  );
}

function fromXY(x: number, y: number, padding = 0): Rect {
  return { x: x - padding, y: y - padding, width: padding * 2, height: padding * 2 };
}
