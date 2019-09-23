// Taken from https://github.com/chanzuckerberg/czi-prosemirror/blob/52e34840d73fccc46637314bf4b4be71147112d4/src/ui/SelectionObserver.js

import { FromToParams } from '@remirror/core-types';

interface SelectionEntry {
  /**
   * The element to observe selections for.
   */
  target: Element;

  /**
   * The browser selection range within the element
   */
  selection: FromToParams;
}

export type SelectionObserverCallback = (entries: SelectionEntry[], observer: SelectionObserver) => void;

const EMPTY_SELECTION_VALUE = Object.freeze({ from: 0, to: 0 });

/**
 * Takes the current window selection when the window has a selection
 * which includes the provided element.
 */
const resolveSelectionValue = (el: Element): FromToParams => {
  if (!window.getSelection) {
    console.warn('window.getSelection() is not supported');
    return EMPTY_SELECTION_VALUE;
  }

  const selection = window.getSelection();

  if (!selection) {
    console.warn('selection is not supported');
    return EMPTY_SELECTION_VALUE;
  }

  if (!selection.containsNode) {
    console.warn('selection.containsNode() is not supported');
    return EMPTY_SELECTION_VALUE;
  }

  if (!selection.rangeCount) {
    return EMPTY_SELECTION_VALUE;
  }

  const range = selection.getRangeAt(0);

  if (!range) {
    return EMPTY_SELECTION_VALUE;
  }

  const { startContainer, endContainer, startOffset, endOffset } = range;

  if (
    startContainer === el ||
    endContainer === el ||
    (startContainer && el.contains(startContainer)) ||
    (endContainer && el.contains(endContainer))
  ) {
    return {
      from: startOffset,
      to: endOffset,
    };
  }

  return EMPTY_SELECTION_VALUE;
};

/**
 * This class adds extra selection functionality to nodeViews helping to trigger
 * selections where Prosemirror otherwise might not.
 */
export class SelectionObserver {
  private observables: SelectionEntry[] = [];
  private callback: SelectionObserverCallback;

  constructor(callback: SelectionObserverCallback) {
    this.callback = callback;
  }

  public disconnect(): void {
    this.observables.forEach(obj => {
      const el = obj.target;
      el.removeEventListener('click', this.check, false);
      el.removeEventListener('selectionchange', this.check, false);
    });

    this.observables = [];
  }

  public observe(el: Element): void {
    if (!window.getSelection) {
      console.warn('window.getSelection() is not supported');
      return;
    }

    if (this.observables.some(obs => obs.target === el)) {
      // Already observed.
      return;
    }

    const observable = {
      target: el,
      selection: resolveSelectionValue(el),
    };

    el.addEventListener('click', this.check, false);
    el.addEventListener('selectionchange', this.check, false);
    this.observables.push(observable);
  }

  /**
   * Copy the currently observed selections to be sent out to all subscribers.
   */
  public takeRecords(): SelectionEntry[] {
    return this.observables.slice(0);
  }

  private check = (): void => {
    let changed = false;
    const callback = this.callback;

    this.observables = this.observables.map(obj => {
      const { target, selection } = obj;
      const $selection = resolveSelectionValue(target);

      if (selection === $selection) {
        return obj;
      }

      if (selection.from === $selection.from && selection.to === $selection.to) {
        return obj;
      }

      changed = true;

      return {
        target,
        selection: $selection,
      };
    });

    if (changed && callback) {
      callback(this.takeRecords(), this);
    }
  };
}
