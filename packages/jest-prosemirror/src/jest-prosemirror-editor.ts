import {
  CommandFunction,
  EditorSchema,
  EditorStateParams,
  findElementAtPosition,
  InputRule,
  isElementDOMNode,
  isTextDOMNode,
  pick,
  PlainObject,
  Plugin,
  PosParams,
  SelectionParams,
  TextParams,
} from '@remirror/core';
import { EventType, fireEvent } from '@testing-library/dom';
import { inputRules } from 'prosemirror-inputrules';
import { AllSelection, NodeSelection, TextSelection } from 'prosemirror-state';
import { TaggedProsemirrorNode } from 'prosemirror-test-builder';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import { Keyboard } from 'test-keyboard';
import { createEvents } from './jest-prosemirror-events';
import { createState, pm, selectionFor, taggedDocHasSelection } from './jest-prosemirror-nodes';
import { TaggedDocParams, TestEditorView, TestEditorViewParams } from './jest-prosemirror-types';

/**
 * The return type for the apply method which
 * @remarks
 *
 * @typeParam GSchema - the editor schema used node.
 */
export interface ApplyReturn<GSchema extends EditorSchema = any>
  extends TaggedDocParams<GSchema>,
    EditorStateParams<GSchema> {
  /**
   * True when the command was applied successfully.
   */
  pass: boolean;
}

/**
 * Apply the command to the prosemirror node passed in.
 *
 * Returns a tuple matching the following structure
 * [
 *   bool => was the command successfully applied
 *   taggedDoc => the new doc as a result of the command
 *   state => The new editor state after applying the command
 * ]
 *
 * @param taggedDoc - the tagged prosemirror node see {@link TaggedProsemirrorNode}
 * @param command
 * @param [result]
 */
export const apply = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
  command: CommandFunction<GSchema>,
  result?: TaggedProsemirrorNode<GSchema>,
): ApplyReturn<GSchema> => {
  const { state, view } = createEditor(taggedDoc);
  let newState = state;
  let pass = true;
  let doc = newState.doc as TaggedProsemirrorNode<GSchema>;

  command(state, tr => (newState = state.apply(tr)), view);

  if (!pm.eq(newState.doc, result || taggedDoc)) {
    pass = false;
  }

  if (result && taggedDocHasSelection(result)) {
    pass = pm.eq(newState.selection, selectionFor(result));
    doc = result || taggedDoc;
  }

  return { pass, taggedDoc: doc, state: newState };
};

/**
 * Find the first text node with the provided string.
 */
export const findTextNode = (node: Node, text: string): Node | undefined => {
  if (isTextDOMNode(node)) {
    return node;
  } else if (isElementDOMNode(node)) {
    for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
      const found = findTextNode(ch, text);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

/**
 * Flushes the dom
 */
export const flush = (view: TestEditorView) => {
  view.domObserver.flush();
};

export interface CreateEditorOptions extends Omit<DirectEditorProps, 'state'> {
  /**
   * Whether to auto remove the editor from the dom after each test.
   * It is advisable to leave this unchanged.
   *
   * @defaultValue true
   */
  autoClean?: boolean;
  /**
   * The plugins that the test editor should use.
   *
   * @defaultValue `[]`
   */
  plugins?: Plugin[];

  /**
   * The input rules that the test editor should use.
   *
   * @defaultValue `[]`
   */
  rules?: InputRule[];
}

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
 *  Enter: jest.fn((params: SuggestKeyBindingParams) => {
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
export const createEditor = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
  { plugins = [], rules = [], autoClean = true, ...editorOptions }: CreateEditorOptions = {},
) => {
  const place = document.body.appendChild(document.createElement('div'));
  const state = createState(taggedDoc, [...plugins, inputRules({ rules })]);
  const view = new EditorView<GSchema>(place, { state, ...editorOptions }) as TestEditorView<GSchema>;

  if (autoClean) {
    afterEach(() => {
      view.destroy();
      if (place && place.parentNode) {
        place.parentNode.removeChild(place);
      }
    });
  }

  const createReturnValue = () => {
    const { selection, doc } = view.state;
    const returnValue = {
      /**
       * The start of the current selection.
       */
      start: selection.from,
      /**
       * The end of the current selection.
       */
      end: selection.to,

      /**
       * The prosemirror selection.
       */
      selection,

      /**
       * The prosemirror schema.
       */
      schema: view.state.schema,

      /**
       * The prosemirror state.
       */
      state: view.state,

      /**
       * The prosemirror view.
       */
      view,

      /**
       * Overwrite all the current content within the editor.
       *
       * @param newDoc - the new content to use
       */
      overwrite: (newDoc: TaggedProsemirrorNode<GSchema>) => {
        const tr = view.state.tr.replaceWith(0, view.state.doc.nodeSize - 2, newDoc);
        tr.setMeta('addToHistory', false);
        view.dispatch(tr);
        return createReturnValue();
      },

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
      command: (command: CommandFunction) => {
        command(view.state, view.dispatch, view);
        return createReturnValue();
      },

      /**
       * Insert text into the editor at the current position.
       *
       * @param text - the text to insert
       */
      insertText: (text: string) => {
        const { from } = view.state.selection;
        insertText({ start: from, text, view });
        return createReturnValue();
      },

      /**
       * Jump to the specified position in the editor.
       *
       * @param start - a number position or the shorthand 'start' | 'end'
       * @param [end] - the option end position of the new selection
       */
      jumpTo: (start: 'start' | 'end' | number, end?: number) => {
        if (start === 'start') {
          dispatchTextSelection({ view, start: 1 });
        } else if (start === 'end') {
          dispatchTextSelection({ view, start: doc.content.size - 1 });
        } else {
          dispatchTextSelection({ view, start, end });
        }
        return createReturnValue();
      },

      /**
       * Type a keyboard shortcut - e.g. `Mod-Enter`.
       *
       * **NOTE** This only simulates the events. For example an `Mod-Enter` would run all enter key
       * handlers but not actually create a new line.
       *
       * @param mod - the keyboard shortcut to type
       */
      shortcut: (mod: string) => {
        shortcut({ shortcut: mod, view });
        return createReturnValue();
      },

      /**
       * Simulate a keypress which is run through the editor's key handlers.
       *
       * **NOTE** This only simulates the events. For example an `Enter` would run all enter key
       * handlers but not actually create a new line.
       *
       * @param char - the character to type
       */
      press: (char: string) => {
        press({ char, view });
        return createReturnValue();
      },

      /**
       * Fire an event in the editor (very hit and miss).
       *
       * @param params - the fire event parameters
       */
      fire: (params: Omit<FireEventAtPositionParams<GSchema>, 'view'>) => {
        fireEventAtPosition({ view, ...params });
        return createReturnValue();
      },

      /**
       * Callback function which receives the `start`, `end`, `state`, `view`, `schema` and `selection` properties and allows
       * for easier testing of the current state of the editor.
       */
      callback: (fn: (content: ReturnValueCallbackParams<GSchema>) => void) => {
        fn(pick(returnValue, ['start', 'end', 'state', 'view', 'schema', 'selection']));
        return createReturnValue();
      },
    };

    return returnValue;
  };

  return createReturnValue();
};

interface ReturnValueCallbackParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema>,
    EditorStateParams<GSchema>,
    SelectionParams<GSchema> {
  start: number;
  end: number;
  schema: GSchema;
}

export interface InsertTextParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema>,
    TextParams {
  /**
   * The start point of text insertion
   */
  start: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to better simulate
 * calls to handleTextInput.
 */
export const insertText = <GSchema extends EditorSchema = any>({
  view,
  text,
  start: from,
}: InsertTextParams<GSchema>) => {
  const keys = Keyboard.create({
    target: view.dom,
  }).start();
  let pos = from;
  text.split('').forEach(character => {
    keys.char({ text: character, typing: true });

    if (!view.someProp('handleTextInput', f => f(view, pos, pos, character))) {
      view.dispatch(view.state.tr.insertText(character, pos, pos));
    }

    // Update the position based on the current state selection. This allows plugins and commands to make changes to the
    // size of the editor while typing and as long as there is a selection position this function won't fail.
    pos = view.state.selection.anchor;
  });

  keys.end();
};

interface DispatchTextSelectionParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema> {
  start: number;
  end?: number;
}

/**
 * Dispatch a text selection from start to [end]
 *
 * @param param
 * @param param.view
 * @param param.start
 * @param [param.end]
 */
export const dispatchTextSelection = <GSchema extends EditorSchema = any>({
  view,
  start,
  end,
}: DispatchTextSelectionParams<GSchema>) => {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, start, end));

  view.dispatch(tr);
};

/**
 * Select everything in the current doc.
 *
 * @param param
 * @param param.view
 * @param param.taggedDoc
 */
export const dispatchAllSelection = <GSchema extends EditorSchema = any>({
  view,
}: TestEditorViewParams<GSchema>) => {
  const { tr, doc } = view.state;
  view.dispatch(tr.setSelection(new AllSelection(doc)));
};

interface DispatchNodeSelectionParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema>,
    PosParams {}

/**
 * Dispatch a text selection from start to end
 *
 * @param param
 * @param param.view
 * @param param.pos
 */
export const dispatchNodeSelection = <GSchema extends EditorSchema = any>({
  view,
  pos,
}: DispatchNodeSelectionParams<GSchema>) => {
  const { state } = view;
  const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
  view.dispatch(tr);
};

interface PressParams<GSchema extends EditorSchema = any> extends TestEditorViewParams<GSchema> {
  /**
   * The keyboard shortcut to run
   */
  char: string;
}

/**
 * Press a key.
 */
export const press = <GSchema extends EditorSchema = any>({ view, char }: PressParams<GSchema>) => {
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
};

interface KeyboardShortcutParams<GSchema extends EditorSchema = any> extends TestEditorViewParams<GSchema> {
  /**
   * The keyboard shortcut to run
   */
  shortcut: string;
}

/**
 * Runs a keyboard shortcut.
 */
export const shortcut = <GSchema extends EditorSchema = any>({
  view,
  shortcut: text,
}: KeyboardShortcutParams<GSchema>) => {
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
};

export interface FireParams {
  /**
   * The event to fire on the view
   */
  event: EventType;

  /**
   * Options passed into the event
   */
  options?: PlainObject;

  /**
   * Override the default position to use
   */
  position?: number;
}

interface FireEventAtPositionParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema>,
    FireParams {}

/**
 * Fires an event at the provided position or the current selected position in the dom.
 */
export const fireEventAtPosition = <GSchema extends EditorSchema = any>({
  view,
  event,
  options = {},
  position = view.state.selection.anchor,
}: FireEventAtPositionParams<GSchema>) => {
  const element = findElementAtPosition(position, view)!;
  const syntheticEvents = createEvents(event, options);

  syntheticEvents.forEach(syntheticEvent => fireEvent(element, syntheticEvent));

  if (
    event === ('tripleClick' as any) &&
    !view.someProp('handleTripleClick', f => f(view, position, syntheticEvents[2]))
  ) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }
  if (
    event === 'dblClick' &&
    !view.someProp('handleDoubleClick', f => f(view, position, syntheticEvents[0]))
  ) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }
  if (event === 'click' && !view.someProp('handleClick', f => f(view, position, syntheticEvents[0]))) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }

  flush(view);
};
