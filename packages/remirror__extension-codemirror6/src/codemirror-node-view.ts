import type { LanguageSupport } from '@codemirror/language';
import {
  Compartment,
  EditorState as CodeMirrorEditorState,
  Extension as CodeMirrorExtension,
  Transaction as CodeMirrorTransaction,
} from '@codemirror/state';
import {
  Command as CodeMirrorCommand,
  EditorView as CodeMirrorEditorView,
  KeyBinding as CodeMirrorKeyBinding,
  keymap,
} from '@codemirror/view';
import { assertGet, isPromise, replaceNodeAtPosition } from '@remirror/core';
import type { EditorSchema, EditorView, NodeView, ProsemirrorNode } from '@remirror/pm';
import { exitCode } from '@remirror/pm/commands';
import { Selection, TextSelection } from '@remirror/pm/state';

type LoadLanguage = (lang: string) => Promise<LanguageSupport> | LanguageSupport | void;

export class CodeMirror6NodeView implements NodeView {
  public dom: HTMLElement;

  private node: ProsemirrorNode;
  private readonly view: EditorView;
  private readonly getPos: () => number;
  private readonly schema: EditorSchema;
  private readonly cm: CodeMirrorEditorView;
  private updating = false;
  private readonly loadLanguage: LoadLanguage;
  private readonly languageConf: Compartment;
  private languageName: string;
  private readonly toggleName: string;

  constructor({
    node,
    view,
    getPos,
    extensions,
    loadLanguage,
    toggleName,
  }: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    extensions: CodeMirrorExtension[] | null;
    loadLanguage: LoadLanguage;
    toggleName: string;
  }) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.schema = node.type.schema;
    this.loadLanguage = loadLanguage;
    this.languageConf = new Compartment();
    this.languageName = '';
    this.toggleName = toggleName;

    const changeFilter = CodeMirrorEditorState.changeFilter.of((tr: CodeMirrorTransaction) => {
      if (!tr.docChanged && !this.updating) {
        this.forwardSelection();
      }

      return true;
    });

    // Create the initial CodeMirror state
    const startState = CodeMirrorEditorState.create({
      doc: this.node.textContent,
      extensions: [
        keymap.of(this.codeMirrorKeymap()),
        changeFilter,
        this.languageConf.of([]),
        ...(extensions ?? []),
      ],
    });

    // Create a CodeMirror instance
    this.cm = new CodeMirrorEditorView({
      state: startState,
      dispatch: this.valueChanged.bind(this),
    });

    // The editor's outer node is our DOM representation
    this.dom = this.cm.dom;

    // Try to find and load the language
    this.updateLanguage();
  }

  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.updateLanguage();
    const change = computeChange(this.cm.state.doc.toString(), node.textContent);

    if (change) {
      this.updating = true;
      this.cm.dispatch({
        changes: { from: change.from, to: change.to, insert: change.text },
      });
      this.updating = false;
    }

    return true;
  }

  private updateLanguage() {
    const languageName = this.node.attrs.language;

    if (languageName === this.languageName) {
      return;
    }

    const language = this.loadLanguage(languageName);

    if (!language) {
      return;
    }

    if (isPromise(language)) {
      language.then((lang) => {
        this.setLanguage(lang);
        this.languageName = languageName;
      });
      return;
    }

    this.setLanguage(language);
    this.languageName = languageName;
  }

  private setLanguage(language: LanguageSupport) {
    this.cm.dispatch({
      effects: this.languageConf.reconfigure(language),
    });
  }

  /**
   * Synchronize the selections from ProseMirror to CodeMirrror
   */
  setSelection(anchor: number, head: number): void {
    this.cm.focus();
    this.updating = true;
    this.cm.dispatch({ selection: { anchor, head } });
    this.updating = false;
  }

  selectNode(): void {
    this.focus();
  }

  focus(): void {
    this.cm.focus();
    this.forwardSelection();
  }

  stopEvent(): boolean {
    return true;
  }

  destroy(): void {
    this.cm.destroy();
  }

  /**
   * When the code editor is focused, we can keep the selection of the outer
   * editor synchronized with the inner one, so that any commands executed on
   * the outer editor see an accurate selection.
   */
  private forwardSelection() {
    if (!this.cm.hasFocus) {
      return;
    }

    const state = this.view.state;
    const selection = this.asProseMirrorSelection(state.doc);

    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection));
    }
  }

  /**
   * This helper function translates from a CodeMirror selection to a
   * ProseMirror selection.
   */
  private asProseMirrorSelection(doc: ProsemirrorNode) {
    const start = this.getPos() + 1;
    const { anchor, head } = this.cm.state.selection.main;
    return TextSelection.between(doc.resolve(anchor + start), doc.resolve(head + start));
  }

  /**
   * A somewhat tricky aspect of nesting editor like this is handling cursor
   * motion across the edges of the inner editor. This node view will have to
   * take care of allowing the user to move the selection out of the code
   * editor. For that purpose, it binds the arrow keys to handlers that check if
   * further motion would ‘escape’ the editor, and if so, return the selection
   * and focus to the outer editor.
   *
   * The keymap also binds ctrl-enter, which, in ProseMirror's base keymap,
   * creates a  new paragraph after a code block.
   */
  private codeMirrorKeymap(): CodeMirrorKeyBinding[] {
    return [
      {
        key: 'ArrowUp',
        run: this.maybeEscape('line', -1),
      },
      {
        key: 'ArrowLeft',
        run: this.maybeEscape('char', -1),
      },
      {
        key: 'ArrowDown',
        run: this.maybeEscape('line', 1),
      },
      {
        key: 'ArrowRight',
        run: this.maybeEscape('char', 1),
      },
      {
        key: 'Ctrl-Enter',
        run: () => {
          if (exitCode(this.view.state, this.view.dispatch)) {
            this.view.focus();
            return true;
          }

          return false;
        },
      },
      {
        key: 'Backspace',
        run: () => {
          const ranges = this.cm.state.selection.ranges;

          if (ranges.length > 1) {
            return false;
          }

          const selection = ranges[0];

          if (selection && (!selection.empty || selection.anchor > 0)) {
            return false;
          }

          // We don't want to convert a multi-line code block into a paragraph
          // because newline characters are invalid in a paragraph node.
          if (this.cm.state.doc.lines >= 2) {
            return false;
          }

          const state = this.view.state;
          const toggleNode = assertGet(state.schema.nodes, this.toggleName);
          const pos = this.getPos();
          const tr = replaceNodeAtPosition({
            pos: pos,
            tr: state.tr,
            content: toggleNode.createChecked({}, this.node.content),
          });

          tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));

          this.view.dispatch(tr);
          this.view.focus();
          return true;
        },
      },
    ];
  }

  /**
   * When the actual content of the code editor is changed, the event handler
   * registered in the node view's constructor calls this method. It'll compare
   * the code block node's current value to the value in the editor, and
   * dispatch a transaction if there is a difference.
   */
  private valueChanged(tr: CodeMirrorTransaction): void {
    this.cm.update([tr]);

    if (!tr.docChanged || this.updating) {
      return;
    }

    const change = computeChange(this.node.textContent, tr.state.doc.toString());

    if (change) {
      const start = this.getPos() + 1;
      const tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? this.schema.text(change.text) : [],
      );
      this.view.dispatch(tr);
    }
  }

  private maybeEscape(unit: 'line' | 'char', dir: 1 | -1): CodeMirrorCommand {
    return (view: CodeMirrorEditorView) => {
      const { state } = view;

      // Exit if the selection is not empty
      if (state.selection.ranges.some((range) => !range.empty)) {
        return false;
      }

      const anchor = state.selection.main.anchor;
      const line = state.doc.lineAt(anchor);
      const lineOffset = anchor - line.from;

      if (
        line.number !== (dir < 0 ? 1 : state.doc.lines) ||
        (unit === 'char' && lineOffset !== (dir < 0 ? 0 : line.length))
      ) {
        return false;
      }

      const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
      const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
      this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView());
      this.view.focus();
      return true;
    };
  }
}

/**
 * Compare two strings and find the minimal change between them
 *
 * It iterates from the start and end of the strings, until it hits a difference, and returns an object
 * giving the change's start, end, and replacement text, or null if there was no change.
 */
function computeChange(
  oldVal: string,
  newVal: string,
): { from: number; to: number; text: string } | null {
  if (oldVal === newVal) {
    return null;
  }

  let start = 0;
  let oldEnd = oldVal.length;
  let newEnd = newVal.length;

  while (start < oldEnd && oldVal.charCodeAt(start) === newVal.charCodeAt(start)) {
    ++start;
  }

  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }

  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}
