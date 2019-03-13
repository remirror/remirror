import {
  Cast,
  EditorView,
  Extension,
  getPluginState,
  isTextSelection,
  nodeNameMatchesList,
} from '@remirror/core';
import { Plugin, Selection } from 'prosemirror-state';
import { InputEvent } from '../../types';
import { CompositionOptions } from '../types';
import { CompositionState } from './state';

/**
 * "Borrowed" from `@atlaskit`
 * Please note that this is not a complete implementation of composition events
 * but merely a workaround, until ProseMirror has some proper support for these events.
 *
 * Ideally this plugin should be deleted once Composition events are handled correctly.
 *
 * @see https://www.w3.org/TR/input-events-2/
 */
export const createCompositionPlugin = (ctx: Extension<CompositionOptions>) => {
  return new Plugin({
    key: ctx.pluginKey,
    appendTransaction: (transactions, _b, state) => {
      // const { from, to } = state.selection;
      // console.log('APPEND_TRANSACTION selection', from, to, transactions);
      return getPluginState<CompositionState>(ctx.pluginKey, state).appendTransaction(transactions);
    },
    filterTransaction: (_tr, _state) => {
      // const { from, to } = state.selection;
      // console.log('FILTER_TRANSACTION selection', from, to, tr);
      // return getPluginState<CompositionState>(ctx.pluginKey, state).filterTransaction(tr);
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
      getPluginState<CompositionState>(ctx.pluginKey, view.state).init(view);
      return {
        update: () => {
          getPluginState<CompositionState>(ctx.pluginKey, view.state).viewUpdate();
        },
      };
    },
    props: {
      decorations: state => {
        const compositionState = getPluginState<CompositionState>(ctx.pluginKey, state);
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
            const pluginState = getPluginState<CompositionState>(ctx.pluginKey, view.state);
            pluginState.startDelete();
            console.log('deleting content backwards');
            return patchDeleteContentBackward(ctx.options, view, event, pluginState);
          }
          return true;
        },
      },
    },
  });
};

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
  const { $from } = state.selection;
  const { ensureNodeDeletion } = options;
  const { tr, selection } = state;
  // console.log('current selection', from, to);

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
    // console.log('node size', $from.nodeBefore.nodeSize);
    // console.log('deleting position', $from.pos - $from.nodeBefore.nodeSize, $from.pos);
    tr.delete($from.pos - $from.nodeBefore.nodeSize, $from.pos);
    const newSelection = Selection.near(
      tr.doc.resolve(tr.mapping.map($from.pos - $from.nodeBefore.nodeSize)),
    );
    // console.log(newSelection, newSelection.from);
    tr.setSelection(newSelection);
    dispatch(tr);
    pluginState.endDelete(newSelection);
    // console.log('the event has been dispatched', newSelection.from, newSelection.to);
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
