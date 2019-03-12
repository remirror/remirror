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
  EditorView,
  Extension,
  getPluginState,
  isTextSelection,
  KeyboardBindings,
  NodeMatch,
  nodeNameMatchesList,
  SchemaParams,
} from '@remirror/core';
import { Plugin, Selection } from 'prosemirror-state';
import { InputEvent } from '../types';

export interface CompositionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: NodeMatch[];
}

class CompositionState {
  private _deleteInProgress: boolean = false;

  /** Keeps tracks of whether a composition action is happening now or not */
  get deleteInProgress(): boolean {
    return this._deleteInProgress;
  }

  public startDelete() {
    console.log('starting delete');
    this._deleteInProgress = true;
  }

  public endDelete() {
    console.log('ending delete');
    this._deleteInProgress = false;
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

  // public keys(): KeyboardBindings {
  //   return {
  //     Backspace: (state, dispatch, view) => {
  //       console.log('BACKSPACE HAPPENING');
  //       const pluginState = getPluginState<CompositionState>(this.pluginKey, state);
  //       if (pluginState.deleteInProgress) {
  //         // pluginState.endDelete();
  //         return true;
  //       }
  //       return false;
  //     },
  //   };
  // }

  public plugin({  }: SchemaParams) {
    return new Plugin({
      key: this.pluginKey,
      appendTransaction(_a, _b, state) {
        const { from, to } = state.selection;
        console.log('Current selection', from, to);
      },
      // state: {
      //   init: () => new CompositionState(),
      //   apply: (transaction, value: CompositionState, oldState, newState) => {
      //     return value;
      //   },
      // },
      props: {
        handleKeyDown: (view, event) => {
          if (event.keyCode === 8) {
            console.log('key down event happening');
          }
          return false;
        },
        handleKeyPress: (view, event) => {
          console.log('key PRESS event happening');
          return false;
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
              // const pluginState = getPluginState<CompositionState>(this.pluginKey, view.state);
              // pluginState.startDelete();
              console.log('deleting content backwards');
              return patchDeleteContentBackward(this.options, view, event);
            }

            return true;
          },
          compositionstart: (view, event) => {
            console.log('composition STARTED', event);
            return false;
          },
          compositionend: (view, event) => {
            console.log('composition ENDED', event);
            return false;
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
