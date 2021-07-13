import { prettyPrint } from 'html';
import PromiseWorker from 'promise-worker';
import {
  EditorSchema,
  EditorState,
  IndexUnionFromTuple,
  isAllSelection,
  isElementDomNode,
  isNodeSelection,
  isTextSelection,
  Mark,
  Selection,
  Transaction,
  uniqueArray,
  uniqueId,
} from '@remirror/core';
import { DOMSerializer } from '@remirror/pm/model';
import { isCellSelection } from '@remirror/pm/tables';

import { HISTORY_SIZE, NODE_COLORS } from './debugger-constants';
import type { HistoryEntry, JsonMark, JsonSelection, SelectionType } from './debugger-types';

export class TypedPromiseWorker<Output, Input> extends PromiseWorker {
  /**
   * Send the data to the worker and receive the response back.
   */
  async send(input: Input): Promise<Output> {
    return super.postMessage<Output, Input>(input);
  }
}

/**
 * Run low-priority and non critical work during an idle moment. Supports
 * scheduling one task at a time.
 */
export class IdleScheduler {
  task?: number;

  request(): Promise<void> {
    // Clear all scheduled idle tasks.
    this.cancel();

    // `requestIdleCallback` is currently not supported on safari.
    const request = window.requestIdleCallback ?? window.requestAnimationFrame;

    return new Promise((resolve) => {
      this.task = request(() => resolve());
    });
  }

  // Cancel the scheduled task.
  cancel(): void {
    const cancel = window.cancelIdleCallback || window.cancelAnimationFrame;

    if (this.task) {
      cancel(this.task);
    }
  }
}

export function calculateSafeIndex<List extends readonly unknown[]>(
  index: number,
  list: List,
): IndexUnionFromTuple<List> {
  const quotient = index / list.length || 1;
  return Math.round(list.length * (quotient - Math.floor(quotient))) as IndexUnionFromTuple<List>;
}

export function buildColors(schema: EditorSchema): Record<string, string> {
  const colors: Record<string, string> = {};

  for (const [index, node] of Object.keys(schema.nodes).entries()) {
    const safeIndex: IndexUnionFromTuple<typeof NODE_COLORS> =
      index >= NODE_COLORS.length
        ? calculateSafeIndex(index, NODE_COLORS)
        : (index as IndexUnionFromTuple<typeof NODE_COLORS>);
    colors[node] = NODE_COLORS[safeIndex];
  }

  return colors;
}

export function getActiveMarks(state: EditorState): JsonMark[] {
  const selection = state.selection;
  const marks: Mark[] = [];

  if (selection.empty) {
    marks.push(...(state.storedMarks || selection.$from.marks()));
  } else {
    state.doc.nodesBetween(selection.from, selection.to, (node) => {
      marks.push(...node.marks);
    });
  }

  return uniqueArray(marks).map((mark) => mark.toJSON() as JsonMark);
}

export function getSelectionType(selection: Selection): SelectionType {
  if (isNodeSelection(selection)) {
    return 'node';
  }

  if (isTextSelection(selection)) {
    return 'text';
  }

  if (isCellSelection(selection)) {
    return 'cell';
  }

  if (isAllSelection(selection)) {
    return 'all';
  }

  return 'unknown';
}

/**
 * A json compatible selection object.
 */
export function buildSelection(selection: Selection): JsonSelection {
  return {
    type: getSelectionType(selection),
    empty: selection.empty,
    anchor: selection.anchor,
    head: selection.head,
    from: selection.from,
    to: selection.to,
  };
}

export function createHistoryEntry(state: EditorState): HistoryEntry {
  const serializer = DOMSerializer.fromSchema(state.schema);
  const selection = state.selection;
  const domFragment = serializer.serializeFragment(selection.content().content);

  const selectionContent = [];

  if (domFragment) {
    let child = domFragment.firstChild;

    while (isElementDomNode(child)) {
      selectionContent.push(child.outerHTML);
      child = child.nextSibling;
    }
  }

  return {
    id: uniqueId(),
    state: state,
    timestamp: Date.now(),
    diffPending: true,
    diff: undefined,
    selection: undefined,
    selectionContent: prettyPrint(selectionContent.join('\n'), {
      max_char: 60,
      indent_size: 2,
    }),
  };
}

export function shrinkEditorHistory(
  history: HistoryEntry[],
  historyRolledBackTo: false | number,
): HistoryEntry[] {
  const startIndex = historyRolledBackTo !== false ? historyRolledBackTo : 0;
  return history.slice(startIndex, HISTORY_SIZE);
}

export function updateEditorHistory(
  history: HistoryEntry[],
  historyRolledBackTo: false | number,
  state: EditorState,
  tr: Transaction = state.tr,
): HistoryEntry[] | undefined {
  const skipHistory = tr.getMeta('_skip-debugger-history_');

  if (skipHistory) {
    return;
  }

  const newHistory = shrinkEditorHistory(history, historyRolledBackTo);
  newHistory.unshift(createHistoryEntry(state));
  return newHistory;
}
