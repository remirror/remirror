import { ContextCreatorHelpers, createContextState } from 'create-context-state';
import { get, set } from 'idb-keyval';
import { useMemo } from 'react';
import { TabStateReturn, useTabState } from 'reakit/Tab';
import {
  EditorState,
  EditorView,
  findNodeAtPosition,
  isElementDomNode,
  NodeWithPosition,
  RemirrorJSON,
  RemirrorManager,
} from '@remirror/core';

import type { NodePicker } from './components';
import { NODE_PICKER_DEFAULT, SNAPSHOTS_KEY, TabName } from './debugger-constants';
import { BaseJsonDiff, DefaultJsonDiff, WorkerJsonDiff } from './debugger-json-diff';
import type { DebuggerSnapshot, HistoryEntry, JsonMark } from './debugger-types';
import {
  buildColors,
  buildSelection,
  createHistoryEntry,
  getActiveMarks,
  updateEditorHistory,
} from './debugger-utils';
import { generateJsonNodePath, generateNodePath } from './utils/find-node';

export interface DebuggerStoreContext {
  selectedTab: TabName | undefined;
  tabState: TabStateReturn;
  manager: RemirrorManager<any>;
  state: EditorState;
  nodeColors: Record<string, string>;
  activeMarks: JsonMark[];
  history: HistoryEntry[];
  expandPath: Array<string | number>;
  historyRolledBackTo: false | number;
  selectedHistoryIndex: number;
  snapshots: DebuggerSnapshot[];
  /**
   * When `true` the snapshots are being loaded.
   */
  loadingSnapshots: boolean;
  nodePicker: NodePicker;
  selectedPlugin: number;
  selectionExpanded: boolean;
  selectedNode: NodeWithPosition | undefined;
  actions: DebuggerState;
}
export interface DebuggerStoreProps {
  manager: RemirrorManager<any>;
  diffWorker?: boolean;
}

interface DebuggerStoreState {
  tab: TabStateReturn;
}

type DebuggerStateHelpers = ContextCreatorHelpers<
  DebuggerStoreContext,
  DebuggerStoreProps,
  DebuggerStoreState
>;

export const [DebuggerStoreProvider, useDebuggerStore] = createContextState<
  DebuggerStoreContext,
  DebuggerStoreProps,
  DebuggerStoreState
>(
  (helpers) => {
    // Cleanup when props have changed.
    helpers.previousContext?.actions.cleanup();

    const { props, previousContext, state } = helpers;
    const actions = new DebuggerState(helpers);
    const loadingSnapshots = previousContext?.loadingSnapshots ?? true;

    if (loadingSnapshots) {
      actions.loadSnapshots();
    }

    return {
      tabState: state.tab,
      selectedTab: (state.tab.currentId as TabName) ?? undefined,
      manager: props.manager,
      state: props.manager.view.state,
      nodeColors: {},
      activeMarks: [],
      history: [],
      expandPath: [],
      historyRolledBackTo: false,
      selectedHistoryIndex: 0,
      snapshots: previousContext?.snapshots ?? [],
      loadingSnapshots,
      nodePicker: previousContext?.nodePicker ?? NODE_PICKER_DEFAULT,
      selectedNode: undefined,
      selectedPlugin: 0,
      selectionExpanded: false,
      actions,
    };
  },
  () => {
    const tab = useTabState();

    return useMemo(() => ({ tab }), [tab]);
  },
);

class DebuggerState {
  private readonly helpers: DebuggerStateHelpers;
  private readonly diffWorker: BaseJsonDiff;

  /**
   * Remove the editor event listener.
   */
  cleanup: () => void;

  get manager(): RemirrorManager<Remirror.Extensions> {
    return this.helpers.props.manager;
  }

  private get context(): DebuggerStoreContext {
    return this.helpers.get();
  }

  private get view(): EditorView {
    return this.manager.view;
  }

  constructor(helpers: DebuggerStateHelpers) {
    this.helpers = helpers;
    this.diffWorker = helpers.props.diffWorker ? new WorkerJsonDiff() : new DefaultJsonDiff();
    this.cleanup = this.subscribe();
  }

  /**
   * Listen to updates in the editor.
   */
  private subscribe() {
    return this.manager.addHandler('stateUpdate', ({ previousState, state, tr }) => {
      const updatedHistory = updateEditorHistory(
        this.context.history,
        this.context.historyRolledBackTo,
        state,
        tr,
      );

      if (previousState && updatedHistory) {
        const firstEntry = updatedHistory[0];

        if (firstEntry) {
          this.updateDiff(firstEntry.id, updatedHistory, previousState, state);
        }
      }

      this.helpers.set({
        state,
        nodeColors: buildColors(state.schema),
        activeMarks: getActiveMarks(state),
        history: updatedHistory ?? this.context.history,
        selectedHistoryIndex: updatedHistory ? 0 : this.context.selectedHistoryIndex,
        historyRolledBackTo: updatedHistory ? false : this.context.historyRolledBackTo,
      });
    });
  }

  private async updateDiff(
    id: string,
    updatedHistory: HistoryEntry[],
    previousState: EditorState,
    state: EditorState,
  ) {
    const [{ delta: diff }, { delta: selection }] = await Promise.all([
      this.diffWorker.diff({ a: previousState.doc.toJSON(), b: state.doc.toJSON(), id }),
      this.diffWorker.diff({
        a: buildSelection(previousState.selection),
        b: buildSelection(state.selection),
        id,
      }),
    ]);

    const history = updatedHistory.map((item) => {
      return item.id === id ? { ...item, diff, diffPending: false, selection } : item;
    });

    this.helpers.set({ history });
  }

  /**
   * Update the tab being used.
   */
  readonly selectTab = (tab: TabName): void => {
    this.helpers.state.tab.select(tab);
  };

  readonly toggleSelection = (): void => {
    this.helpers.set((previous) => ({ selectionExpanded: !previous.selectionExpanded }));
  };

  readonly selectNode = (selectedNode: NodeWithPosition | undefined): void => {
    this.helpers.set({ selectedNode });
  };

  readonly selectPlugin = (selectedPlugin: number): void => {
    this.helpers.set({ selectedPlugin });
  };

  readonly activatePicker = (): void => {
    this.helpers.set({
      nodePicker: { ...NODE_PICKER_DEFAULT, active: true },
    });
  };

  readonly deactivatePicker = (): void => {
    if (!this.context.nodePicker.active) {
      return;
    }

    this.helpers.set({ nodePicker: NODE_PICKER_DEFAULT });
  };

  readonly updateNodePickerPosition = (target: Node): void => {
    const nodePicker = { ...NODE_PICKER_DEFAULT, active: true };

    if (!this.view.dom.contains(target)) {
      this.helpers.set({ nodePicker });
      return;
    }

    const doc = this.context.state.doc;
    const $pos = doc.resolve(this.view.posAtDOM(target, 0));
    const { node, pos } = findNodeAtPosition($pos);
    const nodeDom = this.view.nodeDOM(pos);

    if (!node || node.type.name === 'doc' || !isElementDomNode(nodeDom)) {
      this.helpers.set({ nodePicker });
      return;
    }

    const { top, left, width, height } = nodeDom.getBoundingClientRect();

    this.helpers.set({
      nodePicker: {
        top: top + window.scrollY,
        left: left + window.scrollX,
        width,
        height,
        active: true,
      },
    });
  };

  readonly selectNodePicker = (target: Node): void => {
    if (!this.view.dom.contains(target)) {
      this.helpers.set({ nodePicker: NODE_PICKER_DEFAULT });
      return;
    }

    const doc = this.context.state.doc;
    const $pos = doc.resolve(this.view.posAtDOM(target, 0));
    const { node } = findNodeAtPosition($pos);

    this.helpers.set({ expandPath: generateNodePath(doc, node) });
    this.selectTab(TabName.State);
  };

  /**
   * Load all snapshots from the local store and update the local context to
   * reflect the change.
   */
  readonly loadSnapshots = async (): Promise<void> => {
    const snapshots = await get(SNAPSHOTS_KEY);
    this.helpers.set({ snapshots });
  };

  /**
   * Save a snapshot of the current state.
   */
  readonly saveSnapshot = async (name: string): Promise<void> => {
    if (!name) {
      return;
    }

    const { doc: content, selection } = this.manager.store.helpers.getStateJSON();
    const snapshot = { name, content, selection, timestamp: Date.now() };
    let promise: Promise<void> | undefined;

    this.helpers.set((previous) => {
      const snapshots = [...previous.snapshots, snapshot];
      promise = set(SNAPSHOTS_KEY, snapshots);

      return { snapshots };
    });

    await promise;
  };

  /**
   * Set a snapshot to be the active snapshot.
   */
  readonly loadSnapshot = ({ content, selection }: DebuggerSnapshot): void => {
    const state = this.manager.createState({ content, selection });

    this.helpers.set({
      history: [createHistoryEntry(state)],
      state,
    });

    // TODO This would wipe away history.
    this.view.updateState(state);
  };

  readonly deleteSnapshot = async (snapshot: DebuggerSnapshot): Promise<void> => {
    let promise: Promise<void> | undefined;

    this.helpers.set((previous) => {
      const snapshots = previous.snapshots.filter((item) => item !== snapshot);
      promise = set(SNAPSHOTS_KEY, snapshots);

      return { snapshots };
    });

    await promise;
  };

  readonly logNodeFromJSON = (doc: RemirrorJSON, node: RemirrorJSON): void => {
    // const fullDoc = this.context.state.doc;
    const path = generateJsonNodePath(doc, node);

    if (path) {
      // ('Not Implemented');
    } else {
      // ('Not implemented');
    }
  };

  readonly selectHistoryItem = (selectedHistoryIndex: number): void => {
    return this.helpers.set({ selectedHistoryIndex });
  };

  readonly rollbackHistory = (index: number): void => {
    const historyEntry = this.context.history[index];

    if (!historyEntry) {
      return;
    }

    const state = this.manager.createState({
      content: historyEntry.state,
    });

    this.view.updateState(state);
    this.manager.store
      .chain(state.tr)
      .setMeta('addToHistory', false)
      .setMeta('_skip-debugger-history_', true)
      .focus()
      .run();

    this.helpers.set({
      state,
      historyRolledBackTo: index,
    });
  };
}

export type { DebuggerState };
