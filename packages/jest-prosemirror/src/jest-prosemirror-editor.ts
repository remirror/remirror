import {
  Cast,
  CommandFunction,
  EditorSchema,
  EditorState,
  findElementAtPosition,
  InputRule,
  isElementDOMNode,
  isTextDOMNode,
  PlainObject,
  Plugin,
  PosParams,
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
import { TestEditorView, TestEditorViewParams } from './jest-prosemirror-types';

/**
 * Apply the command to the taggedDoc
 *
 * Returns a tuple matching the following structure
 * [
 *   bool => was the command successfully applied
 *   taggedDoc => the new doc as a result of the command
 *   state => The new editor state after applying the command
 * ]
 *
 * @param taggedDoc
 * @param command
 * @param [result]
 */
export const apply = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
  command: CommandFunction,
  result?: TaggedProsemirrorNode<GSchema>,
): [boolean, TaggedProsemirrorNode<GSchema>, EditorState<GSchema>] => {
  const { state, view } = createEditor(taggedDoc);
  let newState = state;

  command(state, tr => (newState = state.apply(tr)), view);

  if (!pm.eq(newState.doc, result || taggedDoc)) {
    return [false, Cast<TaggedProsemirrorNode<GSchema>>(newState.doc), newState];
  }
  if (result && taggedDocHasSelection(result)) {
    return [pm.eq(newState.selection, selectionFor(result)), result || taggedDoc, newState];
  }
  return [true, Cast<TaggedProsemirrorNode<GSchema>>(newState.doc), newState];
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
   * The plugins that the test editor should use.
   */
  plugins?: Plugin[];

  /**
   * The input rules that the test editor should use.
   */
  rules?: InputRule[];
}

/**
 * Create a test Prosemirror editor
 *
 * @param taggedDoc - the tagged prosemirror node to inject into the editor.
 * @param options - the CreateEditorOptions object which includes plugins, inputRules and configuration for the view.
 */
export const createEditor = <GSchema extends EditorSchema = any>(
  taggedDoc: TaggedProsemirrorNode<GSchema>,
  { plugins = [], rules = [], ...editorOptions }: CreateEditorOptions = {},
) => {
  const place = document.body.appendChild(document.createElement('div'));
  const state = createState(taggedDoc, [...plugins, inputRules({ rules })]);
  const view = new EditorView<GSchema>(place, { state, ...editorOptions }) as TestEditorView<GSchema>;

  afterEach(() => {
    view.destroy();
    if (place && place.parentNode) {
      place.parentNode.removeChild(place);
    }
  });

  const createReturnValue = () => {
    const { selection, doc } = view.state;
    return {
      start: selection.from,
      end: selection.to,
      state: view.state,
      view,
      schema: view.state.schema,
      insertText(text: string) {
        const { from } = view.state.selection;
        insertText({ start: from, text, view });
        return createReturnValue();
      },
      jumpTo: (pos: 'start' | 'end' | number, endPos?: number) => {
        if (pos === 'start') {
          dispatchTextSelection({ view, start: 1 });
        } else if (pos === 'end') {
          dispatchTextSelection({ view, start: doc.content.size - 1 });
        } else {
          dispatchTextSelection({ view, start: pos, end: endPos });
        }
        return createReturnValue();
      },
      shortcut: (text: string) => {
        shortcut({ shortcut: text, view });
        return createReturnValue();
      },
      press: (char: string) => {
        press({ char, view });
        return createReturnValue();
      },
      fire: (params: Omit<FireEventAtPositionParams<GSchema>, 'view'>) => {
        fireEventAtPosition({ view, ...params });
        return createReturnValue();
      },
    };
  };

  return createReturnValue();
};

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
    useFakeTimer: true,
    // onEventDispatch: event => {view.dispatchEvent(event)},
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
    useFakeTimer: true,
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
 * Run a keyboard shortcut.
 */
export const shortcut = <GSchema extends EditorSchema = any>({
  view,
  shortcut: text,
}: KeyboardShortcutParams<GSchema>) => {
  Keyboard.create({
    target: view.dom,
    useFakeTimer: true,
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
