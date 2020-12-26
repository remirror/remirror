import { ContextCreatorHelpers, createContextState } from 'create-context-state';
import { set } from 'idb-keyval';
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
import { NODE_PICKER_DEFAULT, SNAPSHOTS_KEY, TabName } from './dev-constants';
import { BaseJsonDiff, DefaultJsonDiff, WorkerJsonDiff } from './dev-json-diff';
import type { DevSnapshot, HistoryEntry, JsonMark } from './dev-types';
import {
  buildColors,
  buildSelection,
  createHistoryEntry,
  getActiveMarks,
  updateEditorHistory,
} from './dev-utils';
import { generateJsonNodePath, generateNodePath } from './utils/find-node';

export interface DevStoreContext {
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
  snapshots: DevSnapshot[];
  nodePicker: NodePicker;
  selectedPlugin: number;
  selectionExpanded: boolean;
  selectedNode: NodeWithPosition | undefined;
  actions: DevState;
}
export interface DevStoreProps {
  manager: RemirrorManager<any>;
  diffWorker?: boolean;
  savedSnapshots: DevSnapshot[];
}

interface DevStoreState {
  tab: TabStateReturn;
}

type DevStateHelpers = ContextCreatorHelpers<DevStoreContext, DevStoreProps, DevStoreState>;

export const [DevStoreProvider, useDevStore] = createContextState<
  DevStoreContext,
  DevStoreProps,
  DevStoreState
>(
  (helpers) => {
    // Cleanup when props have changed.
    helpers.previousContext?.actions.cleanup();

    const { props, previousContext, state } = helpers;
    const actions = new DevState(helpers);

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
      snapshots: previousContext?.snapshots ?? props.savedSnapshots ?? [],
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

class DevState {
  private readonly helpers: DevStateHelpers;
  private readonly diffWorker: BaseJsonDiff;

  /**
   * Remove the editor event listener.
   */
  cleanup: () => void;

  get manager(): RemirrorManager<Remirror.AllExtensionUnion> {
    return this.helpers.props.manager;
  }

  private get context(): DevStoreContext {
    return this.helpers.get();
  }

  private get view(): EditorView {
    return this.manager.view;
  }

  constructor(helpers: DevStateHelpers) {
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
        history: updatedHistory || this.context.history,
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
  selectTab = (tab: TabName) => {
    this.helpers.state.tab.select(tab);
  };

  toggleSelection = () => {
    this.helpers.set((previous) => ({ selectionExpanded: !previous.selectionExpanded }));
  };

  selectNode = (selectedNode: NodeWithPosition | undefined) => {
    this.helpers.set({ selectedNode });
  };

  selectPlugin = (selectedPlugin: number) => {
    this.helpers.set({ selectedPlugin });
  };

  activatePicker = () => {
    this.helpers.set({
      nodePicker: { ...NODE_PICKER_DEFAULT, active: true },
    });
  };

  deactivatePicker = () => {
    if (!this.context.nodePicker.active) {
      return;
    }

    this.helpers.set({ nodePicker: NODE_PICKER_DEFAULT });
  };

  updateNodePickerPosition = (target: Node) => {
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

  selectNodePicker = (target: Node) => {
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
   * Save a snapshot of the current state.
   */
  saveSnapshot = async (name: string) => {
    if (!name) {
      return;
    }

    const { doc: content, selection } = this.manager.store.helpers.getStateJSON();
    const snapshot = { name, content, selection, timestamp: Date.now() };

    this.helpers.set((previous) => {
      const snapshots = [...previous.snapshots, snapshot];
      set(SNAPSHOTS_KEY, snapshots);

      return { snapshots };
    });
  };

  loadSnapshot = ({ content, selection }: DevSnapshot) => {
    const state = this.manager.createState({ content, selection });

    this.helpers.set({
      history: [createHistoryEntry(state)],
      state,
    });

    this.view.updateState(state);
  };

  deleteSnapshot = (snapshot: DevSnapshot) => {
    this.helpers.set((previous) => {
      const snapshots = previous.snapshots.filter((item) => item !== snapshot);
      set(SNAPSHOTS_KEY, snapshots);

      return { snapshots };
    });
  };

  logNodeFromJSON = (doc: RemirrorJSON, node: RemirrorJSON) => {
    const fullDoc = this.context.state.doc;
    const path = generateJsonNodePath(doc, node);

    if (path) {
    } else {
    }
  };

  selectHistoryItem = (selectedHistoryIndex: number) => {
    return this.helpers.set({ selectedHistoryIndex });
  };

  rollbackHistory = (index: number) => {
    const historyEntry = this.context.history[index];

    if (!historyEntry) {
      return;
    }

    const state = this.manager.createState({
      content: historyEntry.state,
    });

    this.view.updateState(state);
    this.manager.store.chain
      .custom(state.tr)
      .setMeta('addToHistory', false)
      .setMeta('_skip-dev-tools-history_', true)
      .focus()
      .run();

    this.helpers.set({
      state,
      historyRolledBackTo: index,
    });
  };
}
