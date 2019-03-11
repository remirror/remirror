/**
 * Please note that this is not a complete implementation of composition events
 * but merely a workaround, until ProseMirror has some proper support for these events.
 *
 * Ideally this plugin should be deleted once Composition events are handled correctly.
 *
 * @see ED-5924
 * @see https://www.w3.org/TR/input-events-2/
 */

import { Cast, EditorSchema, EditorView, Extension, SchemaParams } from '@remirror/core';
import { Plugin, Selection, TextSelection } from 'prosemirror-state';
import { InputEvent } from '../types';

export interface CompositionOptions {
  /**
   * The nodes that need to be deleted when backspace is pressed
   */
  ensureNodeDeletion?: Array<string | ((name: string) => boolean)>;
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
            if (event.inputType === 'deleteContentBackward') {
              console.log('deleting content backwards');
              return patchDeleteContentBackward(this.options, view, event);
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
) => {
  const { state, dispatch } = view;
  const { $from } = state.selection;
  const { ensureNodeDeletion } = options;

  /**
   * If text contains marks, composition events won't delete any characters.
   */
  if ($from.nodeBefore && $from.nodeBefore.type.name === 'text' && $from.nodeBefore.marks.length) {
    console.log('inside 1');
    event.preventDefault();
    const tr = state.tr;
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
  if ($from.nodeBefore && canBeDeleted($from.nodeBefore.type.name, ensureNodeDeletion)) {
    console.log('inside 2');
    event.preventDefault();
    const tr = state.tr;
    dispatch(
      tr
        .delete($from.pos - $from.nodeBefore.nodeSize, $from.pos)
        .setSelection(Selection.near(tr.doc.resolve(tr.mapping.map($from.pos - $from.nodeBefore.nodeSize)))),
    );
    return true;
  }

  /**
   * This block caters for highlighting the defined nodes.
   */
  const { selection } = state;
  if (
    isTextSelection(selection) &&
    selection.$cursor === null &&
    $from.nodeAfter &&
    ensureNodeDeletion.indexOf($from.nodeAfter.type.name) !== -1
  ) {
    console.log('inside 3');
    event.preventDefault();
    dispatch(state.tr.deleteSelection());
    return true;
  }

  console.log('none activated');
  return false;
};

const isTextSelection = (selection: Selection<EditorSchema>): selection is TextSelection<EditorSchema> =>
  selection instanceof TextSelection;

const canBeDeleted = (
  name: string,
  ensureNodeDeletion: Required<CompositionOptions>['ensureNodeDeletion'],
) => {
  return ensureNodeDeletion.some(checker => {
    if (typeof checker === 'function') {
      return checker(name);
    }

    return checker === name;
  });
};
