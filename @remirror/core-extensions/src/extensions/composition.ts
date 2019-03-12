/**
 * "Borrowed" from `@atlaskit`
 * Please note that this is not a complete implementation of composition events
 * but merely a workaround, until ProseMirror has some proper support for these events.
 *
 * Ideally this plugin should be deleted once Composition events are handled correctly.
 *
 * @see https://www.w3.org/TR/input-events-2/
 */

import {
  Cast,
  EditorState,
  EditorView,
  Extension,
  getPluginState,
  isTextSelection,
  NodeMatch,
  nodeNameMatchesList,
  SchemaParams,
  Transaction,
  // ZERO_WIDTH_SPACE_CHAR,
} from '@remirror/core';
import { Plugin, Selection } from 'prosemirror-state';
// import { Decoration, DecorationSet } from 'prosemirror-view';
import { InputEvent } from '../types';

export interface CompositionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
}

class CompositionState {
  public deleteInProgress: boolean = false;
  public decorationTicks = 0;
  public active = false;
  public selection?: Selection;
  public lastTransactionFiltered = false;
  public setViewFocus = false;
  private view!: EditorView;

  public init(view: EditorView) {
    this.view = view;
    return this;
  }
  public startDelete() {
    // console.log('starting delete');
    this.deleteInProgress = true;
    this.active = true;
    return this;
  }

  public endDelete(selection: Selection) {
    // console.log('ending delete');
    this.deleteInProgress = false;
    this.selection = selection;
    return this;
  }

  private resetState() {
    // console.log('resetting the compositionState');
    this.active = false;
    this.deleteInProgress = false;
    this.selection = undefined;
    this.lastTransactionFiltered = false;
    this.setViewFocus = false;
    return this;
  }

  public apply() {
    if (this.lastTransactionFiltered) {
      // console.log('apply: resetting state in apply');
      this.resetState();

      // console.log('apply: dispatching state selection');
      // this.view.dispatch(tr.setSelection(state.selection));
    }
    return this;
  }

  public appendTransaction(transactions: Transaction[]) {
    if (this.lastTransactionFiltered) {
      return undefined;
    }
    if (transactions.length !== 1) {
      return undefined;
    }
    const tr = transactions[0];
    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      // console.log('appendTransaction: resetting state');
      // this.resetState();
      // console.log('appendTransaction: setting lastTransactionFiltered=true');
      this.lastTransactionFiltered = true;
      // console.log('appendTransaction: dispatching the stored selection');
      // this.view.dispatch(tr.setSelection(this.selection));
      // console.log('appendTransaction: returning transaction');
      return tr.setSelection(this.selection);
    }
    return undefined;
  }

  public filterTransaction(tr: Transaction) {
    if (this.lastTransactionFiltered) {
      return true;
    }
    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      // console.log('filterTransaction: setting lastTransactionFiltered=true');
      this.lastTransactionFiltered = true;
      // console.log('filterTransaction: dispatching the stored selection');
      this.view.dispatch(tr.setSelection(this.selection));
      // console.log('filterTransaction: resetting state');
      this.resetState();
      this.setViewFocus = true;
      // console.log('filterTransaction: focusing the view');
      // this.view.focus();
      // console.log('filterTransaction: returning false');
      // return false;
    }
    return true;
  }

  public viewUpdate() {
    if (this.setViewFocus) {
      // console.log('viewUpdate: setting view focus', this.view.hasFocus());
      if (this.view.hasFocus()) {
        return;
        // (this.view.dom as HTMLElement).blur();
      }
      this.view.focus();
      this.view.dispatch(this.view.state.tr.setSelection(this.selection!));
      this.resetState();
    }
  }

  public decoration(_state: EditorState) {
    // const { doc, selection } = state;
    // const { $from } = selection;
    // if (!nodeNameMatchesList($from.nodeBefore, ['emoji'])) {
    //   // console.log('not emoji before');
    //   this.decorationTicks = 0;
    //   return null;
    // }
    // if (this.deleteInProgress) {
    //   // console.log('delete in progress');
    //   this.decorationTicks = 2;
    // }
    // if (this.decorationTicks > 0) {
    //   // console.log('decoration: being added');
    //   this.decorationTicks--;
    //   const node = document.createElement('span');
    //   node.appendChild(document.createTextNode(ZERO_WIDTH_SPACE_CHAR));

    //   const decoration = Decoration.widget($from.pos, node, {
    //     raw: true,
    //     side: 1,
    //   } as any);

    //   return DecorationSet.create(doc, [decoration]);
    // }
    // console.log('decoration: being removed');
    return null;
  }
}

export class Composition extends Extension {
  get name(): 'composition' {
    return 'composition';
  }

  get defaultOptions() {
    return {
      ensureNodeDeletion: ['emoji', (name: string) => name.includes('mentions')],
    };
  }

  public plugin({  }: SchemaParams) {
    return new Plugin({
      key: this.pluginKey,
      appendTransaction: (transactions, _b, state) => {
        // const { from, to } = state.selection;
        // console.log('APPEND_TRANSACTION selection', from, to, transactions);
        return getPluginState<CompositionState>(this.pluginKey, state).appendTransaction(transactions);
      },
      filterTransaction: (_tr, _state) => {
        // const { from, to } = state.selection;
        // console.log('FILTER_TRANSACTION selection', from, to, tr);
        // return getPluginState<CompositionState>(this.pluginKey, state).filterTransaction(tr);
        return true;
      },

      state: {
        init: () => new CompositionState(),
        apply: (_, value: CompositionState) => {
          // console.log('APPLY called on state', transaction);
          return value.apply();
        },
      },
      view: view => {
        getPluginState<CompositionState>(this.pluginKey, view.state).init(view);
        return {
          update: () => {
            getPluginState<CompositionState>(this.pluginKey, view.state).viewUpdate();
          },
        };
      },
      props: {
        decorations: state => {
          const compositionState = getPluginState<CompositionState>(this.pluginKey, state);
          // console.log('inside decorations', compositionState);
          return compositionState.decoration(state);
        },
        handleDOMEvents: {
          /**
           * Borrowed from https://bitbucket.org/atlassian/atlaskit-mk-2/src/14c0461025a93936d83117ccdd5b34e3623b7a16/packages/editor/editor-core/src/plugins/composition/index.ts?at=master&fileviewer=file-view-default
           *
           * Android composition events aren't handled well by Prosemirror
           * We've added a couple of beforeinput hooks to help PM out when trying to delete
           * certain nodes. We can remove these when PM has better composition support.
           * @see https://github.com/ProseMirror/prosemirror/issues/543
           */
          beforeinput: (view, ev: Event) => {
            console.log('beforeinput running', ev);
            const event = Cast<InputEvent>(ev);
            if (event.inputType === 'deleteContentBackward') {
              const pluginState = getPluginState<CompositionState>(this.pluginKey, view.state);
              pluginState.startDelete();
              console.log('deleting content backwards');
              return patchDeleteContentBackward(this.options, view, event, pluginState);
            }

            return true;
          },
        },
      },
    });
  }
}

/**
 * Borrowed from https://bitbucket.org/atlassian/atlaskit-mk-2/src/14c0461025a93936d83117ccdd5b34e3623b7a16/packages/editor/editor-core/src/plugins/composition/events/deleteContentBackward.ts?at=master&fileviewer=file-view-default
 *
 * This should be called on a `beforeinput` event.
 *
 * Android composition events aren't handled well by Prosemirror
 * We've added a couple of beforeinput hooks to help PM out when trying to delete
 * certain nodes. We can remove these when PM has better composition support.
 * @see https://github.com/ProseMirror/prosemirror/issues/543
 */
export const patchDeleteContentBackward = (
  options: Required<CompositionOptions>,
  view: EditorView,
  event: InputEvent,
  pluginState: CompositionState,
) => {
  const { state, dispatch } = view;
  const { $from, from, to } = state.selection;
  const { ensureNodeDeletion } = options;
  const { tr, selection } = state;

  console.log('current selection', from, to);

  /**
   * If text contains marks, composition events won't delete any characters.
   */
  if ($from.nodeBefore && $from.nodeBefore.type.name === 'text' && $from.nodeBefore.marks.length) {
    event.preventDefault();
    dispatch(
      tr
        .delete($from.pos - 1, $from.pos)
        .setSelection(Selection.near(tr.doc.resolve(tr.mapping.map($from.pos - 1)))),
    );

    return true;
  }

  /**
   * This block caters for the standard composition backspace.
   * We check to see if the previous node is one we want to ensure is deleted
   */
  if ($from.nodeBefore && nodeNameMatchesList($from.nodeBefore, ensureNodeDeletion)) {
    event.preventDefault();
    console.log('node size', $from.nodeBefore.nodeSize);
    // console.log('deleting position', $from.pos - $from.nodeBefore.nodeSize, $from.pos);
    tr.delete($from.pos - $from.nodeBefore.nodeSize, $from.pos);
    const newSelection = Selection.near(
      tr.doc.resolve(tr.mapping.map($from.pos - $from.nodeBefore.nodeSize)),
    );
    // console.log(newSelection, newSelection.from);
    tr.setSelection(newSelection);
    dispatch(tr);
    pluginState.endDelete(newSelection);
    console.log('the event has been dispatched', newSelection.from, newSelection.to);
    return true;
  }

  /**
   * This block caters for highlighting the defined nodes.
   */
  if (
    isTextSelection(selection) &&
    selection.$cursor === null &&
    $from.nodeAfter &&
    nodeNameMatchesList($from.nodeBefore, ensureNodeDeletion)
  ) {
    event.preventDefault();
    dispatch(state.tr.deleteSelection());
    return true;
  }

  return false;
};
