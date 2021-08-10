import { EditorState, Plugin, Transaction } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { ActionType, PlaceholderPluginAction } from './file-placeholder-actions';

interface PlaceholderPluginData {
  set: DecorationSet;
  payloads: Map<unknown, any>;
}

export const placeholderPlugin = new Plugin<PlaceholderPluginData>({
  state: {
    init(): PlaceholderPluginData {
      return { set: DecorationSet.empty, payloads: new Map<unknown, any>() };
    },
    apply(tr, { set, payloads }: PlaceholderPluginData): PlaceholderPluginData {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      const action = tr.getMeta(this) as PlaceholderPluginAction | null;

      if (action) {
        if (action.type === ActionType.ADD_PLACEHOLDER) {
          const widget = document.createElement('placeholder');
          const deco = Decoration.widget(action.pos, widget, { id: action.id });
          set = set.add(tr.doc, [deco]);
          payloads.set(action.id, action.payload);
        } else if (action.type === ActionType.REMOVE_PLACEHOLDER) {
          set = set.remove(set.find(undefined, undefined, (spec) => spec.id === action.id));
          payloads.delete(action.id);
        }
      }

      return { set, payloads };
    },
  },
  props: {
    decorations(state) {
      return this.getState(state).set;
    },
  },
});

export function findPlaceholderPos(state: EditorState, id: unknown): number | undefined {
  const set = placeholderPlugin.getState(state).set;
  const found = set.find(undefined, undefined, (spec) => spec.id === id);
  return found[0]?.from;
}

export function findPlaceholderPayload(state: EditorState, id: unknown): any | undefined {
  const payloads = placeholderPlugin.getState(state).payloads;
  return payloads.get(id);
}

export function setPlaceholderAction(
  tr: Transaction,
  action: PlaceholderPluginAction,
): Transaction {
  return tr.setMeta(placeholderPlugin, action);
}
