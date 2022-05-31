import { fireEvent, prettyDOM } from '@testing-library/dom';
import { Keyboard } from 'test-keyboard';
import { isString, object, pick } from '@remirror/core-helpers';
import type {
  AnchorHeadProps,
  CommandFunction,
  EditorState,
  EditorStateProps,
  InputRule,
  PosProps,
  PrimitiveSelection,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  ProsemirrorPlugin,
  SelectionProps,
  Shape,
  TextProps,
} from '@remirror/core-types';
import {
  findElementAtPosition,
  getTextSelection,
  isElementDomNode,
  isTextDomNode,
} from '@remirror/core-utils';
import { inputRules } from '@remirror/pm/inputrules';
import { Schema, Slice } from '@remirror/pm/model';
import { AllSelection, NodeSelection, Selection, TextSelection } from '@remirror/pm/state';
import { cellAround, CellSelection } from '@remirror/pm/tables';
import {
  // @ts-expect-error: __parseFromClipboard is not typed
  __parseFromClipboard as parseFromClipboard,
  DirectEditorProps,
  EditorView,
} from '@remirror/pm/view';

import { createEvents, EventType } from './jest-prosemirror-events';
import { createState, pm, selectionFor, taggedDocHasSelection } from './jest-prosemirror-nodes';
import type { TaggedDocProps, TestEditorView, TestEditorViewProps } from './jest-prosemirror-types';

const cleanupItems = new Set<[TestEditorView, HTMLElement]>();

afterEach(() => {
  for (const [view, element] of cleanupItems) {
    view.destroy();

    if (element.parentNode) {
      element.remove();
    }
  }
});

/**
 * Create a test prosemirror editor an pass back helper properties and methods.
 *
 * @remarks
 *
 * The call to create editor can be chained with various commands to enable
 * testing of the editor at each step along it's state without the need for
 * intermediate holding variables.
 *
 * The created editor is automatically cleaned after each test.
 *
 * ```ts
 * import { createEditor } from 'jest-remirror';
 *
 * test('`keyBindings`', () => {
 * const keyBindings = {
 *  Enter: jest.fn((params: SuggestKeyBindingProps) => {
 *    params.command();
 *  }),
 * };
 *
 * const plugin = suggest({char: '@', name: 'at', keyBindings, matchOffset: 0,
 *   createCommand: ({ view }) => () =>
 *     view.dispatch(view.state.tr.insertText('awesome')),
 * });
 *
 * createEditor(doc(p('<cursor>')), { plugins: [plugin] }) .insertText('@')
 *   .press('Enter')
 *   .callback(content => {
 *     expect(content.state.doc).toEqualProsemirrorNode(doc(p('@awesome')));
 *   });
 * });
 * ```
 *
 * @param taggedDoc - the tagged prosemirror node to inject into the editor.
 * @param options - the {@link CreateEditorOptions} interface which includes all
 * {@link http://prosemirror.net/docs/ref/#view.DirectEditorProps | DirectEditorProps}
 * except for `state`.
 */
export function createEditor(
  taggedDocument: ProsemirrorNode,
  options: CreateEditorOptions = object(),
): ProsemirrorTestChain {
  const { plugins = [], rules = [], autoClean = true, ...editorOptions } = options;
  const element = document.createElement('div');
  const state = createState(taggedDocument, [...plugins, inputRules({ rules })]);
  const view = new EditorView(element, {
    state,
    plugins: [],
    ...editorOptions,
  }) as TestEditorView;

  document.body.append(element);

  if (autoClean) {
    cleanupItems.add([view, element]);
  }

  return new ProsemirrorTestChain(view);
}

/**
 * Flushes the dom
 */
export function flush(view: TestEditorView): void {
  view.domObserver.flush();
}

/**
 * A very basic broken paste implementation for jsdom and prosemirror.
 */
export function pasteContent(
  props: TestEditorViewProps & TestEditorViewProps & { content: ProsemirrorNode | string },
): void {
  const { view, content } = props;
  let slice: Slice;

  if (isString(content)) {
    const parsedSlice = parseFromClipboard(view, content, '', true, view.state.selection.$head);

    if (!parsedSlice) {
      throw new Error('No content to paste');
    }

    slice = parsedSlice;
  } else {
    const { from, to } =
      content.type.name === 'doc'
        ? { from: 1, to: content.nodeSize - 2 }
        : { from: 0, to: undefined };

    slice = content.slice(from, to);
    view.someProp('transformPasted', (f) => {
      slice = f(slice);
    });
  }

  view.dispatch(view.state.tr.replaceSelection(slice));
}

export interface InsertTextProps extends TestEditorViewProps, TextProps {
  /**
   * The start point of text insertion
   */
  start: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to
 * better simulate calls to handleTextInput.
 */
export function insertText(props: InsertTextProps): void {
  const { view, text, start } = props;
  const keys = Keyboard.create({
    target: view.dom,
  }).start();

  let pos = start;

  [...text].forEach((character) => {
    keys.char({ text: character, typing: true });

    if (!view.someProp('handleTextInput', (f) => f(view, pos, pos, character))) {
      view.dispatch(view.state.tr.insertText(character, pos, pos));
    }

    // Update the position based on the current state selection. This allows
    // plugins and commands to make changes to the size of the editor while
    // typing and as long as there is a selection position this function won't
    // fail.
    pos = view.state.selection.anchor;
  });

  keys.end();
}

interface DispatchTextSelectionProps extends TestEditorViewProps {
  /**
   * This defaults to the anchor.
   */
  start: number;
  end?: number;
}

/**
 * Dispatch a text selection from start to [end]
 */
export function dispatchTextSelection(props: DispatchTextSelectionProps): void {
  const { view, start, end } = props;
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, start, end));

  view.dispatch(tr);
}

interface DispatchAnchorTextSelectionProps extends TestEditorViewProps, AnchorHeadProps {}

/**
 * Dispatch a text selection from start to [end]
 */
export function dispatchAnchorTextSelection(props: DispatchAnchorTextSelectionProps): void {
  const { view, anchor, head } = props;
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));

  view.dispatch(tr);
}

/**
 * Select everything in the current doc.
 */
export function dispatchAllSelection(view: TestEditorView): void {
  const { tr, doc } = view.state;
  view.dispatch(tr.setSelection(new AllSelection(doc)));
}

interface DispatchNodeSelectionProps extends TestEditorViewProps, PosProps {}

/**
 * Dispatch a text selection from the provided pos.
 */
export function dispatchNodeSelection(props: DispatchNodeSelectionProps): void {
  const { view, pos } = props;
  const { state } = view;
  const tr = state.tr.setSelection(
    // Node selections should always be at the start of their nodes. This is
    // impossible to annotate since the first text position is always the `node
    // + 1` place.
    NodeSelection.create(state.doc, state.doc.resolve(pos).before()),
  );
  view.dispatch(tr);
}

export function dispatchCellSelection(props: DispatchNodeSelectionProps): void {
  const { view, pos } = props;
  const { state } = view;
  const $anchor = cellAround(state.doc.resolve(pos));

  if (!$anchor) {
    return;
  }

  const tr = state.tr.setSelection(new CellSelection($anchor) as any);
  view.dispatch(tr);
}

interface PressProps extends TestEditorViewProps {
  /**
   * The keyboard shortcut to run
   */
  char: string;
}

/**
 * Press a key.
 */
export function press(props: PressProps): void {
  const { view, char } = props;
  Keyboard.create({
    target: view.dom,
    batch: true,
  })
    .start()
    .char({ text: char })
    .forEach(({ event }) => {
      view.dispatchEvent(event);
      flush(view);
    });
}

interface BackspaceProps extends TestEditorViewProps {
  /**
   * The number of times to activate backspace.
   *
   * @default 1
   */
  times?: number;
}

/**
 * Simulate a backspace key press.
 */
export function backspace(props: BackspaceProps): void {
  const { view, times = 1 } = props;
  const { selection, tr } = view.state;
  const { from, empty } = selection;

  if (empty) {
    view.dispatch(tr.delete(from - times, from));
    return;
  }

  tr.deleteSelection();

  if (times > 1) {
    tr.delete(from - (times - 1), from);
  }

  view.dispatch(tr);
}

/**
 * Simulate a backspace key press.
 */
export function forwardDelete(props: BackspaceProps): void {
  const { view, times = 1 } = props;
  const { selection, tr } = view.state;
  const { from, empty } = selection;

  if (empty) {
    view.dispatch(tr.delete(from, from + times));
    return;
  }

  tr.deleteSelection();

  if (times > 1) {
    tr.delete(from, from + (times - 1));
  }

  view.dispatch(tr);
}

interface KeyboardShortcutProps extends TestEditorViewProps {
  /**
   * The keyboard shortcut to run
   */
  shortcut: string;
}

/**
 * Runs a keyboard shortcut.
 */
export function shortcut(props: KeyboardShortcutProps): void {
  const { view, shortcut: text } = props;

  Keyboard.create({
    target: view.dom,
    batch: true,
  })
    .start()
    .mod({ text })
    .forEach(({ event }) => {
      view.dispatchEvent(event);
      flush(view);
    });
}

export interface FireProps {
  /**
   * The event to fire on the view
   */
  event: EventType;

  /**
   * Options passed into the event
   */
  options?: Shape;

  /**
   * Override the default position to use
   */
  position?: number;
}

interface FireEventAtPositionProps extends TestEditorViewProps, FireProps {}

/**
 * Fires an event at the provided position or the current selected position in
 * the dom.
 */
export function fireEventAtPosition(props: FireEventAtPositionProps): void {
  const { view, event, options = object<Shape>(), position = view.state.selection.anchor } = props;
  const element = findElementAtPosition(position, view);
  const syntheticEvents = createEvents<MouseEvent>(event, options);

  syntheticEvents.forEach((syntheticEvent) => fireEvent(element, syntheticEvent));

  if (
    event === 'tripleClick' &&
    !view.someProp('handleTripleClick', (f) => f(view, position, syntheticEvents[2]))
  ) {
    syntheticEvents.forEach((syntheticEvent) => view.dispatchEvent(syntheticEvent));
  }

  if (
    event === 'dblClick' &&
    !view.someProp('handleDoubleClick', (f) => f(view, position, syntheticEvents[0]))
  ) {
    syntheticEvents.forEach((syntheticEvent) => view.dispatchEvent(syntheticEvent));
  }

  if (
    event === 'click' &&
    !view.someProp('handleClick', (f) => f(view, position, syntheticEvents[0]))
  ) {
    syntheticEvents.forEach((syntheticEvent) => view.dispatchEvent(syntheticEvent));
  }

  flush(view);
}

/**
 * The return type for the apply method which
 * @remarks
 *
 * @template Schema - the editor schema used node.
 */
export interface ApplyReturn extends TaggedDocProps, EditorStateProps {
  /**
   * True when the command was applied successfully.
   */
  pass: boolean;
}

export interface CreateEditorOptions extends Omit<DirectEditorProps, 'state' | 'plugins'> {
  /**
   * Whether to auto remove the editor from the dom after each test. It is
   * advisable to leave this unchanged.
   *
   * @default true
   */
  autoClean?: boolean;
  /**
   * The plugins that the test editor should use.
   *
   * @default []
   */
  plugins?: ProsemirrorPlugin[];

  /**
   * The input rules that the test editor should use.
   *
   * @default []
   */
  rules?: InputRule[];
}

/**
 * An instance of this class is returned when using `createEditor`. It allows
 * for chaining of test operations and adds some useful helpers to your testing
 * toolkit.
 */
export class ProsemirrorTestChain {
  /**
   * A static helper utility for creating new TestReturn values.
   */
  static of(view: TestEditorView): ProsemirrorTestChain {
    return new ProsemirrorTestChain(view);
  }

  /**
   * The prosemirror view.
   */
  view: TestEditorView;

  /**
   * The current prosemirror node document
   */
  get doc(): ProsemirrorNode {
    return this.state.doc;
  }

  /**
   * The prosemirror schema.
   */
  get schema(): Schema {
    return this.state.schema;
  }

  /**
   * The prosemirror state.
   */
  get state(): EditorState {
    return this.view.state;
  }

  /**
   * The prosemirror selection.
   */
  get selection(): Selection {
    return this.state.selection;
  }

  /**
   * The start of the current selection.
   */
  get start(): number {
    return this.state.selection.from;
  }

  /**
   * The end of the current selection.
   */
  get end(): number {
    return this.state.selection.to;
  }

  constructor(view: TestEditorView) {
    this.view = view;
  }

  /**
   * Overwrite all the current content within the editor.
   *
   * @param newDoc - the new content to use
   */
  overwrite(newDocument: ProsemirrorNode): this {
    const tr = this.state.tr.replaceWith(0, this.view.state.doc.nodeSize - 2, newDocument);
    tr.setMeta('addToHistory', false);
    this.view.dispatch(tr);
    return this;
  }

  /**
   * Run the command within the prosemirror editor.
   *
   * @remarks
   *
   * ```ts
   * test('commands are run', () => {
   *   createEditor(doc(p('<cursor>')))
   *     .command((state, dispatch) => {
   *        if (dispatch) {
   *          dispatch(state.tr.insertText('hello'));
   *        }
   *     })
   *     .callback(content => {
   *       expect(content.state.doc).toEqualProsemirrorDocument(doc(p('hello')));
   *     })
   * })
   * ```
   *
   * @param command - the command function to run
   */
  command(command: ProsemirrorCommandFunction): this {
    command(this.state, this.view.dispatch, this.view);
    return this;
  }

  /**
   * Takes any remirror command as an input and dispatches it within the
   * document context.
   *
   * @param command - the command function to run with the current state and
   * view
   */
  readonly remirrorCommand = (command: CommandFunction): this => {
    command({
      state: this.state,
      dispatch: this.view.dispatch,
      view: this.view,
      tr: this.state.tr,
    });

    return this;
  };

  /**
   * Insert text into the editor at the current position.
   *
   * @param text - the text to insert
   */
  insertText(text: string): this {
    const { from } = this.selection;
    insertText({ start: from, text, view: this.view });
    return this;
  }

  /**
   * Jump to the specified position in the editor.
   *
   * @param start - a number position or the shorthand 'start' | 'end'
   * @param [end] - the option end position of the new selection
   *
   * @deprecated - use `selectText` instead.
   */
  jumpTo(start: 'start' | 'end' | number, end?: number): this {
    if (start === 'start') {
      dispatchTextSelection({ view: this.view, start: 1 });
    } else if (start === 'end') {
      dispatchTextSelection({ view: this.view, start: this.doc.content.size - 1 });
    } else {
      dispatchTextSelection({ view: this.view, start, end });
    }

    return this;
  }

  /**
   * Selects the text between the provided selection primitive.
   */
  readonly selectText = (selection: PrimitiveSelection): this => {
    const tr = this.state.tr;
    const textSelection = getTextSelection(selection, tr.doc);

    this.view.dispatch(tr.setSelection(textSelection));

    return this;
  };

  /**
   * Type a keyboard shortcut - e.g. `Mod-Enter`.
   *
   * **NOTE** This only simulates the events. For example an `Mod-Enter` would
   * run all enter key handlers but not actually create a new line.
   *
   * @param mod - the keyboard shortcut to type
   */
  shortcut(mod: string): this {
    shortcut({ shortcut: mod, view: this.view });
    return this;
  }

  /**
   * Simulate a keypress which is run through the editor's key handlers.
   *
   * **NOTE** This only simulates the events. For example an `Enter` would run
   * all enter key handlers but not actually create a new line.
   *
   * @param char - the character to type
   */
  press(char: string): this {
    press({ char, view: this.view });
    return this;
  }

  /**
   * Simulates a backspace keypress and deletes text backwards.
   */
  backspace(times?: number): this {
    backspace({ view: this.view, times });
    return this;
  }

  /**
   * Logs to the dom for help debugging your tests.
   */
  debug = (): this => {
    // eslint-disable-next-line no-console
    console.log(prettyDOM(this.view.dom));
    return this;
  };

  /**
   * Fire an event in the editor (very hit and miss).
   *
   * @param props - the props when firing an event
   */
  fire(props: Omit<FireEventAtPositionProps, 'view'>): this {
    fireEventAtPosition({ view: this.view, ...props });
    return this;
  }

  /**
   * Callback function which receives the `start`, `end`, `state`, `view`,
   * `schema` and `selection` properties and allows for easier testing of the
   * current state of the editor.
   */
  callback(fn: (content: ReturnValueCallbackProps) => void): this {
    fn(pick(this, ['start', 'end', 'state', 'view', 'schema', 'selection', 'doc', 'debug']));
    return this;
  }

  /**
   * Paste text into the editor.
   *
   * TODO - this is overly simplistic and doesn't fully express what prosemirror
   * can do so will need to be improved.
   */
  paste(content: ProsemirrorNode | string): this {
    pasteContent({ view: this.view, content });
    return this;
  }
}

export interface ReturnValueCallbackProps
  extends TestEditorViewProps,
    EditorStateProps,
    SelectionProps {
  start: number;
  end: number;
  schema: Schema;
  doc: ProsemirrorNode;
  /**
   * Pretty log the current view to the dom.
   */
  debug: () => void;
}

/**
 * Apply the command to the prosemirror node passed in.
 *
 * Returns a tuple matching the following structure
 * [
 *   bool => was the command successfully applied taggedDoc => the new doc as a
 *   result of the command state => The new editor state after applying the
 *   command
 * ]
 */
export function apply(
  taggedDocument: ProsemirrorNode,
  command: ProsemirrorCommandFunction,
  result?: ProsemirrorNode,
): ApplyReturn {
  const { state, view } = createEditor(taggedDocument);
  let newState = state;
  let pass = true;
  let doc = newState.doc;

  command(state, (tr) => (newState = state.apply(tr)), view);

  if (!pm.eq(newState.doc, result || taggedDocument)) {
    pass = false;
  }

  if (result && taggedDocHasSelection(result)) {
    pass = pm.eq(newState.selection, selectionFor(result));
    doc = result;
  }

  return { pass, taggedDoc: doc, state: newState };
}

/**
 * Find the first text node with the provided string.
 */
export function findTextNode(node: Node, text: string): Node | undefined {
  if (isTextDomNode(node)) {
    return node;
  } else if (isElementDomNode(node)) {
    for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
      const found = findTextNode(ch, text);

      if (found) {
        return found;
      }
    }
  }

  return;
}
