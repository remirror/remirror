import {
  EditorState,
  EditorStateProps,
  getStyle,
  hasTransactionChanged,
  isElementDomNode,
  TransactionProps,
  within,
} from '@remirror/core';

export { isEmptyBlockNode } from '@remirror/core';

interface HasChangedProps extends EditorStateProps, Partial<TransactionProps> {
  previousState: EditorState | undefined;
}

/**
 * Checks the transaction for changes or compares the state with the previous
 * state.
 *
 * Return `true` when a change is detected in the document or the selection.
 */
export function hasStateChanged(props: HasChangedProps): boolean {
  const { tr, state, previousState } = props;

  if (!previousState) {
    return true;
  }

  if (tr) {
    return hasTransactionChanged(tr);
  }

  return !state.doc.eq(previousState.doc) || !state.selection.eq(previousState.selection);
}

interface IsPositionVisibleOptions {
  /**
   * When `true` account for padding and the scroll bar width for the provided
   * element.
   *
   * @default false
   */
  accountForPadding?: boolean;
}

/**
 * Checks that the rect is visible within the provided element.
 *
 * This is specific for the remirror editor.
 */
export function isPositionVisible(
  rect: DOMRect,
  element: Element,
  options: IsPositionVisibleOptions = {},
): boolean {
  const elementRect = element.getBoundingClientRect();
  const { accountForPadding = false } = options;

  // Amount to increment these values by.
  let leftDelta = 0;
  let rightDelta = 0;
  let topDelta = 0;
  let bottomDelta = 0;

  if (isElementDomNode(element) && accountForPadding) {
    const paddingLeft = Number.parseFloat(getStyle(element, 'padding-left').replace('px', ''));
    const paddingRight = Number.parseFloat(getStyle(element, 'padding-right').replace('px', ''));
    const paddingTop = Number.parseFloat(getStyle(element, 'padding-top').replace('px', ''));
    const paddingBottom = Number.parseFloat(getStyle(element, 'padding-bottom').replace('px', ''));
    const borderLeft = Number.parseFloat(getStyle(element, 'border-left').replace('px', ''));
    const borderRight = Number.parseFloat(getStyle(element, 'border-right').replace('px', ''));
    const borderTop = Number.parseFloat(getStyle(element, 'border-top').replace('px', ''));
    const borderBottom = Number.parseFloat(getStyle(element, 'border-bottom').replace('px', ''));
    const verticalScrollBarWidth = element.offsetWidth - element.clientWidth;
    const horizontalScrollBarHeight = element.offsetHeight - element.clientHeight;
    leftDelta += paddingLeft + borderLeft + (element.dir === 'rtl' ? verticalScrollBarWidth : 0);
    rightDelta += paddingRight + borderRight + (element.dir === 'rtl' ? 0 : verticalScrollBarWidth);
    topDelta += paddingTop + borderTop;
    bottomDelta += paddingBottom + borderBottom + horizontalScrollBarHeight;
  }

  const containerRect = new DOMRect(
    elementRect.left + leftDelta,
    elementRect.top + topDelta,
    elementRect.width - rightDelta,
    elementRect.height - bottomDelta,
  );

  for (const [top, left] of [
    [rect.top, rect.left],
    [rect.top, rect.right],
    [rect.bottom, rect.left],
    [rect.bottom, rect.right],
  ] as const) {
    if (
      within(top, containerRect.top, containerRect.bottom) &&
      within(left, containerRect.left, containerRect.right)
    ) {
      return true;
    }
  }

  return false;
}

export const POSITIONER_WIDGET_KEY = 'remirror-positioner-widget';
