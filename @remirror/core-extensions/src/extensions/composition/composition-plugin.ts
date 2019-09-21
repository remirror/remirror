import { Extension } from '@remirror/core';
import { Cast, isAndroidOS } from '@remirror/core-helpers';
import { EditorView } from '@remirror/core-types';
import { getPluginState, isTextSelection, nodeNameMatchesList } from '@remirror/core-utils';
import { Plugin, Selection } from 'prosemirror-state';
import { CompositionExtensionOptions, InputEvent } from '../../core-extension-types';
import { CompositionState } from './composition-state';

/**
 * Improve android composition handling.
 *
 * @remarks
 *
 * Borrowed from https://bitbucket.org/atlassian/atlaskit-mk-2/src/14c0461025a93936d83117ccdd5b34e3623b7a16/packages/editor/editor-core/src/plugins/composition/events/deleteContentBackward.ts?at=master&fileviewer=file-view-default
 *
 * This should be called on a `beforeinput` event.
 *
 * Android composition events aren't handled well by Prosemirror
 * We've added a couple of beforeinput hooks to help PM out when trying to delete
 * certain nodes. We can remove these when PM has better composition support.
 * ~~@see https://github.com/ProseMirror/prosemirror/issues/543~~ **FIXED**
 * @see https://github.com/ProseMirror/prosemirror/issues/837
 */
export const patchDeleteContentBackward = (
  options: Required<CompositionExtensionOptions>,
  view: EditorView,
  event: InputEvent,
  pluginState: CompositionState,
) => {
  const { state, dispatch } = view;
  const { $from } = state.selection;
  const { ensureNodeDeletion } = options;
  const { tr, selection } = state;

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
    tr.delete($from.pos - $from.nodeBefore.nodeSize, $from.pos);
    const newSelection = Selection.near(
      tr.doc.resolve(tr.mapping.map($from.pos - $from.nodeBefore.nodeSize)),
    );
    tr.setSelection(newSelection);
    dispatch(tr);
    pluginState.endDelete(newSelection);
    return true;
  }

  /**
   * This block caters for highlighting the defined nodes when a selection has been made
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

/**
 * Creates the plugin for composition.
 *
 * @remarks
 *
 * "Borrowed" from `@atlaskit`
 *
 * A workaround or composition events when using `gboard` on Android.
 *
 * Ideally this plugin should be deleted once Composition events are handled correctly.
 * TODO verify whether it can be deleted
 *
 * @see https://www.w3.org/TR/input-events-2/
 *
 */
export const createCompositionPlugin = (ctx: Extension<CompositionExtensionOptions>) => {
  return new Plugin({
    key: ctx.pluginKey,
    appendTransaction: (transactions, _b, state) => {
      return getPluginState<CompositionState>(ctx.pluginKey, state).appendTransaction(transactions);
    },
    state: {
      init: () => new CompositionState(),
      apply: (_, pluginState: CompositionState) => {
        return pluginState.apply();
      },
    },
    view: view => {
      getPluginState<CompositionState>(ctx.pluginKey, view.state).init(view);
      return {};
    },
    props: {
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
          const event = Cast<InputEvent>(ev);
          if (event.inputType === 'deleteContentBackward' && isAndroidOS()) {
            const pluginState = getPluginState<CompositionState>(ctx.pluginKey, view.state);
            pluginState.startDelete();
            return patchDeleteContentBackward(ctx.options, view, event, pluginState);
          }
          return true;
        },
      },
    },
  });
};
