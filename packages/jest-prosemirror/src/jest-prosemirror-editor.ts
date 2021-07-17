import { fireEvent, prettyDOM } from '@testing-library/dom';
import type { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { Keyboard } from 'test-keyboard';
import { isString, object, pick } from '@remirror/core-helpers';
import type {
  AnchorHeadProps,
  CommandFunction,
  EditorSchema,
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
import { DOMParser, Slice } from '@remirror/pm/model';
import { AllSelection, NodeSelection, Selection, TextSelection } from '@remirror/pm/state';
import { cellAround, CellSelection } from '@remirror/pm/tables';
import { DirectEditorProps, EditorView } from '@remirror/pm/view';

import { createEvents, EventType } from './jest-prosemirror-events';
import { createState, pm, selectionFor, taggedDocHasSelection } from './jest-prosemirror-nodes';
import type { TaggedDocProps, TestEditorView, TestEditorViewProps } from './jest-prosemirror-types';

const cleanupItems = new Set<[TestEditorView<any>, HTMLElement]>();

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
export function createEditor<Schema extends EditorSchema = EditorSchema>(
  taggedDocument: TaggedProsemirrorNode<Schema>,
  options: CreateEditorOptions = object(),
): ProsemirrorTestChain<Schema> {
  const { plugins = [], rules = [], autoClean = true, ...editorOptions } = options;
  const element = document.createElement('div');
  const state = createState(taggedDocument, [...plugins, inputRules({ rules })]);
  const view = new EditorView<Schema>(element, {
    state,
    ...editorOptions,
  }) as TestEditorView<Schema>;

  document.body.append(element);

  if (autoClean) {
    cleanupItems.add([view, element]);
  }

  return new ProsemirrorTestChain(view);
}

/**
 * Flushes the dom
 */
export function flush<Schema extends EditorSchema = EditorSchema>(
  view: TestEditorView<Schema>,
): void {
  view.domObserver.flush();
}

/**
 * A very basic broken paste implementation for jsdom and prosemirror.
 */
export function pasteContent<Schema extends EditorSchema = EditorSchema>(
  props: TestEditorViewProps<Schema> &
    TestEditorViewProps<Schema> & { content: ProsemirrorNode | string },
): void {
  const { view, content } = props;
  let slice: ProsemirrorNode[] | Slice | Slice[];

  if (isString(content)) {
    const element = document.createElement('div');
    element.innerHTML = content;
    slice = DOMParser.fromSchema(view.state.schema).parseSlice(element, {
      context: view.state.selection.$head,
      preserveWhitespace: true,
    });
  } else {
    const { from, to } =
      content.type.name === 'doc'
        ? { from: 1, to: content.nodeSize - 2 }
        : { from: 0, to: undefined };

    slice = content.slice(from, to);
  }

  view.someProp('transformPasted', (f) => {
    slice = f(slice);
  });

  view.dispatch(view.state.tr.replaceSelection(slice));
}

export interface InsertTextProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema>,
    TextProps {
  /**
   * The start point of text insertion
   */
  start: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to
 * better simulate calls to handleTextInput.
 */
export function insertText<Schema extends EditorSchema = EditorSchema>(
  props: InsertTextProps<Schema>,
): void {
  const { view, text, start } = props;
  const keys = Keyboard.create({
    target: view.dom,
  }).start();

  let pos = start;

  text.split('').forEach((character) => {
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

interface DispatchTextSelectionProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema> {
  /**
   * This defaults to the anchor.
   */
  start: number;
  end?: number;
}

/**
 * Dispatch a text selection from start to [end]
 */
export function dispatchTextSelection<Schema extends EditorSchema = EditorSchema>(
  props: DispatchTextSelectionProps<Schema>,
): void {
  const { view, start, end } = props;
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, start, end));

  view.dispatch(tr);
}

interface DispatchAnchorTextSelectionProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema>,
    AnchorHeadProps {}

/**
 * Dispatch a text selection from start to [end]
 */
export function dispatchAnchorTextSelection<Schema extends EditorSchema = EditorSchema>(
  props: DispatchAnchorTextSelectionProps<Schema>,
): void {
  const { view, anchor, head } = props;
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));

  view.dispatch(tr);
}

/**
 * Select everything in the current doc.
 */
export function dispatchAllSelection<Schema extends EditorSchema = EditorSchema>(
  view: TestEditorView<Schema>,
): void {
  const { tr, doc } = view.state;
  view.dispatch(tr.setSelection(new AllSelection(doc)));
}

interface DispatchNodeSelectionProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema>,
    PosProps {}

/**
 * Dispatch a text selection from the provided pos.
 */
export function dispatchNodeSelection<Schema extends EditorSchema = EditorSchema>(
  props: DispatchNodeSelectionProps<Schema>,
): void {
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

export function dispatchCellSelection<Schema extends EditorSchema = EditorSchema>(
  props: DispatchNodeSelectionProps<Schema>,
): void {
  const { view, pos } = props;
  const { state } = view;
  const $anchor = cellAround(state.doc.resolve(pos));

  if (!$anchor) {
    return;
  }

  const tr = state.tr.setSelection(new CellSelection<Schema>($anchor) as any);
  view.dispatch(tr);
}

interface PressProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema> {
  /**
   * The keyboard shortcut to run
   */
  char: string;
}

/**
 * Press a key.
 */
export function press<Schema extends EditorSchema = EditorSchema>(props: PressProps<Schema>): void {
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

interface BackspaceProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema> {
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
export function backspace<Schema extends EditorSchema = EditorSchema>(
  props: BackspaceProps<Schema>,
): void {
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
export function forwardDelete<Schema extends EditorSchema = EditorSchema>(
  props: BackspaceProps<Schema>,
): void {
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

interface KeyboardShortcutProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema> {
  /**
   * The keyboard shortcut to run
   */
  shortcut: string;
}

/**
 * Runs a keyboard shortcut.
 */
export function shortcut<Schema extends EditorSchema = EditorSchema>(
  props: KeyboardShortcutProps<Schema>,
): void {
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

interface FireEventAtPositionProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema>,
    FireProps {}

/**
 * Fires an event at the provided position or the current selected position in
 * the dom.
 */
export function fireEventAtPosition<Schema extends EditorSchema = EditorSchema>(
  props: FireEventAtPositionProps<Schema>,
): void {
  const { view, event, options = object<Shape>(), position = view.state.selection.anchor } = props;
  const element = findElementAtPosition(position, view);
  const syntheticEvents = createEvents(event, options);

  syntheticEvents.forEach((syntheticEvent) => fireEvent(element, syntheticEvent));

  if (
    event === ('tripleClick' as any) &&
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
export interface ApplyReturn<Schema extends EditorSchema = EditorSchema>
  extends TaggedDocProps<Schema>,
    EditorStateProps<Schema> {
  /**
   * True when the command was applied successfully.
   */
  pass: boolean;
}

export interface CreateEditorOptions extends Omit<DirectEditorProps, 'state'> {
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
export class ProsemirrorTestChain<Schema extends EditorSchema = EditorSchema> {
  /**
   * A static helper utility for creating new TestReturn values.
   */
  static of<Schema extends EditorSchema = EditorSchema>(
    view: TestEditorView<Schema>,
  ): ProsemirrorTestChain<Schema> {
    return new ProsemirrorTestChain(view);
  }

  /**
   * The prosemirror view.
   */
  view: TestEditorView<Schema>;

  /**
   * The current prosemirror node document
   */
  get doc(): ProsemirrorNode<Schema> {
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
  get state(): EditorState<Schema> {
    return this.view.state;
  }

  /**
   * The prosemirror selection.
   */
  get selection(): Selection<Schema> {
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

  constructor(view: TestEditorView<Schema>) {
    this.view = view;
  }

  /**
   * Overwrite all the current content within the editor.
   *
   * @param newDoc - the new content to use
   */
  overwrite(newDocument: TaggedProsemirrorNode<Schema>): this {
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
  command(command: ProsemirrorCommandFunction<Schema>): this {
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
  readonly remirrorCommand = (command: CommandFunction<Schema>): this => {
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
    console.log(prettyDOM(this.view.dom as HTMLElement));
    return this;
  };

  /**
   * Fire an event in the editor (very hit and miss).
   *
   * @param props - the props when firing an event
   */
  fire(props: Omit<FireEventAtPositionProps<Schema>, 'view'>): this {
    fireEventAtPosition({ view: this.view, ...props });
    return this;
  }

  /**
   * Callback function which receives the `start`, `end`, `state`, `view`,
   * `schema` and `selection` properties and allows for easier testing of the
   * current state of the editor.
   */
  callback(fn: (content: ReturnValueCallbackProps<Schema>) => void): this {
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

export interface ReturnValueCallbackProps<Schema extends EditorSchema = EditorSchema>
  extends TestEditorViewProps<Schema>,
    EditorStateProps<Schema>,
    SelectionProps<Schema> {
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
 *
 * @param taggedDoc - the tagged prosemirror node see
 * {@link TaggedProsemirrorNode}
 * @param command
 * @param [result]
 */
export function apply<Schema extends EditorSchema = EditorSchema>(
  taggedDocument: TaggedProsemirrorNode<Schema>,
  command: ProsemirrorCommandFunction<Schema>,
  result?: TaggedProsemirrorNode<Schema>,
): ApplyReturn<Schema> {
  const { state, view } = createEditor(taggedDocument);
  let newState = state;
  let pass = true;
  let doc = newState.doc as TaggedProsemirrorNode<Schema>;

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
