/**
 * Reference: https://prosemirror.net/examples/codemirror/
 */

import { entries } from '@remirror/core';
import type { EditorSchema, EditorView, NodeView, ProsemirrorNode } from '@remirror/pm';
import { exitCode } from '@remirror/pm/commands';
import { redo, undo } from '@remirror/pm/history';
import { Selection, TextSelection } from '@remirror/pm/state';

import ref from './codemirror-ref';
import type { CodeMirrorExtensionAttributes } from './codemirror-types';
import { parseLanguageToMode } from './codemirror-utils';

export class CodeMirrorNodeView implements NodeView {
  /**
   * The dom element which wraps the CodeMirror editor element. This is directly
   * controlled by ProseMirror.
   */
  dom: HTMLElement;

  /**
   * The ProseMirror Node represented by this instance of the
   * [[`CodeMirrorNodeView`]].
   */
  #node: ProsemirrorNode;

  /**
   * The CodeMirror editor instance being controlled by this NodeView.
   */
  readonly #cm: CodeMirror.Editor;

  /**
   * The schema for the current editor.
   */
  readonly #schema: EditorSchema;

  /**
   * The `EditorView` being used.
   */
  readonly #view: EditorView;

  /**
   * A method for retrieving the current position from the editor.
   */
  readonly #getPos: () => number;

  /**
   * A flag used to identify whether there are any changes that are incoming. It
   * is used along with `this.#updating` to prevent cursorActivity changes from
   * being forwarded to the ProseMirror editor.
   */
  #incomingChanges = false;

  /**
   * This flag is used to avoid an update loop between the outer and inner
   * editor.
   *
   * - `true` when the CodeMirror editor is being updated right now.
   */
  #updating = false;

  constructor(
    node: ProsemirrorNode,
    view: EditorView,
    getPos: () => number,
    config?: CodeMirror.EditorConfiguration,
  ) {
    // Store for later
    this.#node = node;
    this.#schema = node.type.schema;
    this.#view = view;
    this.#getPos = getPos;

    // Create a CodeMirror instance
    this.#cm = ref.CodeMirror(null as unknown as HTMLElement, {
      value: this.#node.textContent,
      extraKeys: this.codeMirrorKeymap(),
      ...config,
    });

    // The editor's outer node is our DOM representation
    this.dom = this.#cm.getWrapperElement();
    this.setupCodeMirrorHandlers();
  }

  /**
   * Create the event listeners for managing updates from CodeMirror.
   */
  private setupCodeMirrorHandlers() {
    // CodeMirror needs to be in the DOM to properly initialize, so schedule it
    // to update itself.
    setTimeout(() => this.#cm.refresh(), 20);

    //
    this.#updating = false;

    // Track whether changes are have been made but not yet propagated.
    this.#cm.on('beforeChange', () => (this.#incomingChanges = true));

    // Propagate updates from the code editor to ProseMirror.
    this.#cm.on('cursorActivity', () => {
      if (!this.#updating && !this.#incomingChanges) {
        this.forwardSelection();
      }
    });

    // Listen to changes within the code editor.
    this.#cm.on('changes', () => {
      if (!this.#updating) {
        this.valueChanged();
        this.forwardSelection();
      }

      this.#incomingChanges = false;
    });

    this.#cm.on('focus', () => this.forwardSelection());
  }

  /**
   * When the code editor is focused, we can keep the selection of the outer
   * editor synchronized with the inner one, so that any commands executed on
   * the outer editor see an accurate selection.
   */
  forwardSelection(): void {
    if (!this.#cm.hasFocus()) {
      return;
    }

    const state = this.#view.state;
    const selection = this.asProseMirrorSelection(state.doc);

    if (!selection.eq(state.selection)) {
      this.#view.dispatch(state.tr.setSelection(selection));
    }
  }

  /**
   * This helper function translates from a CodeMirror selection to a
   * ProseMirror selection. Because CodeMirror uses a line/column based indexing
   * system, `indexFromPos` is used to convert to an actual character index.
   */
  asProseMirrorSelection(doc: ProsemirrorNode): TextSelection {
    const offset = this.#getPos() + 1;
    const anchor = this.#cm.indexFromPos(this.#cm.getCursor('anchor')) + offset;
    const head = this.#cm.indexFromPos(this.#cm.getCursor('head')) + offset;
    return TextSelection.create(doc, anchor, head);
  }

  /**
   * Selections are also synchronized the other way, from ProseMirror to
   * CodeMirror, using the view's `setSelection` method.
   */
  setSelection(anchor: number, head: number): void {
    this.#cm.focus();
    this.#updating = true;
    this.#cm.setSelection(this.#cm.posFromIndex(anchor), this.#cm.posFromIndex(head));
    this.#updating = false;
  }

  /**
   * When the actual content of the code editor is changed, the event handler
   * registered in the node view's constructor calls this method. It'll compare
   * the code block node's current value to the value in the editor, and
   * dispatch a transaction if there is a difference.
   */
  valueChanged(): void {
    const change = computeTextChange(this.#node.textContent, this.#cm.getValue());

    // Return early when nothings has changed.
    if (!change) {
      return;
    }

    const start = this.#getPos() + 1;
    const tr = this.#view.state.tr.replaceWith(
      start + change.from,
      start + change.to,
      change.text ? this.#schema.text(change.text) : [],
    );
    this.#view.dispatch(tr);
  }

  /**
   * A somewhat tricky aspect of nesting editor like this is handling cursor
   * motion across the edges of the inner editor. This node view will have to
   * take care of allowing the user to move the selection out of the code
   * editor. For that purpose, it binds the arrow keys to handlers that check if
   * further motion would ‘escape’ the editor, and if so, return the selection
   * and focus to the outer editor.
   *
   * The keymap also binds keys for undo and redo, which the outer editor will
   * handle, and for ctrl-enter, which, in ProseMirror's base keymap, creates a
   * new paragraph after a code block.
   */
  codeMirrorKeymap(): CodeMirror.KeyMap {
    const view = this.#view;
    const mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl';
    return ref.CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      'Ctrl-Enter': () => {
        if (exitCode(view.state, view.dispatch)) {
          view.focus();
        }
      },
      [`${mod}-Z`]: () => undo(view.state, view.dispatch),
      [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
      [`${mod}-Y`]: () => redo(view.state, view.dispatch),
    });
  }

  maybeEscape(unit: 'line' | 'char', dir: 1 | -1): null | typeof ref.CodeMirror.Pass {
    const pos = this.#cm.getCursor();

    if (
      this.#cm.somethingSelected() ||
      pos.line !== (dir < 0 ? this.#cm.firstLine() : this.#cm.lastLine()) ||
      (unit === 'char' && pos.ch !== (dir < 0 ? 0 : this.#cm.getLine(pos.line).length))
    ) {
      return ref.CodeMirror.Pass;
    }

    this.#view.focus();
    const targetPos = this.#getPos() + (dir < 0 ? 0 : this.#node.nodeSize);
    const selection = Selection.near(this.#view.state.doc.resolve(targetPos), dir);
    this.#view.dispatch(this.#view.state.tr.setSelection(selection).scrollIntoView());
    this.#view.focus();
    return null;
  }

  /**
   * When an update comes in from the editor, for example because of an undo
   * action, we kind of have to do the inverse of what `valueChanged` did—check
   * for text changes, and if present, propagate them from the outer to the
   * inner editor.
   */
  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.#node.type) {
      return false;
    }

    const textChange = computeTextChange(this.#cm.getValue(), node.textContent);
    const attrsChange = computeAttrsChange(this.#node.attrs, node.attrs);

    this.#node = node;

    if (textChange || attrsChange) {
      this.#updating = true;

      if (textChange) {
        this.#cm.replaceRange(
          textChange.text,
          this.#cm.posFromIndex(textChange.from),
          this.#cm.posFromIndex(textChange.to),
        );
      }

      if (attrsChange) {
        for (const k of Object.keys(attrsChange) as Array<keyof typeof attrsChange>) {
          this.#cm.setOption(k, attrsChange[k]);
        }
      }

      this.#updating = false;
    }

    return true;
  }

  selectNode(): void {
    this.#cm.focus();
  }
  stopEvent(): boolean {
    return true;
  }
}

/**
 * `computeTextChange` compare two strings and find the minimal change between
 * them.
 *
 * It iterates from the start and end of the strings, until it hits a
 * difference, and returns an object giving the change's start, end, and
 * replacement text, or `null` if there was no change.
 */
function computeTextChange(
  previousText: string,
  currentText: string,
): { from: number; to: number; text: string } | null {
  // Exit early if the strings are identical.
  if (previousText === currentText) {
    return null;
  }

  // Keep track of where the change starts.
  let from = 0;

  // Track the end position of relative to the original value.
  let to = previousText.length;

  // Track the end position relative the the current value.
  let currentTo = currentText.length;

  // Step forwards from the starting point until a changed value is encountered
  // and store the index of that changed value.
  while (from < to && previousText.charCodeAt(from) === currentText.charCodeAt(from)) {
    ++from;
  }

  // Step backwards from the end of the text values until a character which
  // doesn't match is encoutered. Store the index where the change happened in
  // both the `previousText` and the `currentText`.
  while (
    to > from &&
    currentTo > from &&
    previousText.charCodeAt(to - 1) === currentText.charCodeAt(currentTo - 1)
  ) {
    to--;
    currentTo--;
  }

  return { from, to, text: currentText.slice(from, currentTo) };
}

function computeAttrsChange(
  oldAttrs: CodeMirrorExtensionAttributes,
  newAttrs: CodeMirrorExtensionAttributes,
): CodeMirror.EditorConfiguration | null {
  let updated = false;

  const deltaConfig: CodeMirror.EditorConfiguration = {};
  const oldConfig: CodeMirror.EditorConfiguration = oldAttrs.codeMirrorConfig ?? {};
  const newConfig: CodeMirror.EditorConfiguration = newAttrs.codeMirrorConfig ?? {};

  for (const [key, value] of entries(oldConfig)) {
    if (value !== newConfig[key]) {
      deltaConfig[key] = newConfig[key] as any;
      updated = true;
    }
  }

  if (oldAttrs.language !== newAttrs.language) {
    deltaConfig.mode = parseLanguageToMode(newAttrs.language) ?? undefined;
    updated = true;
  }

  if (updated) {
    return deltaConfig;
  }

  return null;
}
