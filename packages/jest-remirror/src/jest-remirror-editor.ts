import { prettyDOM } from '@testing-library/dom';
import {
  dispatchAllSelection,
  dispatchCellSelection,
  dispatchNodeSelection,
  dispatchTextSelection,
  fireEventAtPosition,
  FireParameter,
  insertText,
  pasteContent,
  press,
  shortcut,
  TestEditorView,
} from 'jest-prosemirror';

import {
  ActiveFromCombined,
  AnyCombinedUnion,
  CommandFunctionParameter,
  CommandsFromCombined,
  EditorState,
  GetMarkNameUnion,
  GetNodeNameUnion,
  HelpersFromCombined,
  isFunction,
  isMarkExtension,
  isNodeExtension,
  object,
  pick,
  ProsemirrorAttributes,
  ProsemirrorNode,
  range,
  RemirrorManager,
  SchemaFromCombined,
  Transaction,
} from 'remirror/core';
import { createDomEditor, createDomManager } from 'remirror/dom';

import { markFactory, nodeFactory } from './jest-remirror-builder';
import {
  MarkWithAttributes,
  MarkWithoutAttributes,
  NodeWithAttributes,
  NodeWithoutAttributes,
  RenderEditorParameter,
  TaggedProsemirrorNode,
  Tags,
} from './jest-remirror-types';
import { replaceSelection } from './jest-remirror-utils';

const elements = new Set<Element>();

/**
 * This is the renderEditor test helper.
 *
 * @remarks
 *
 * This can be used to render your editor to the dom with all the desired
 * extensions and it returns chainable methods for inserting text and
 * dispatching commands.
 *
 * By default it already has the core preset applied.
 */
export function renderEditor<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  { props, autoClean = true, ...options }: RenderEditorParameter<Combined> = object(),
) {
  const element = createElement(props?.element, autoClean);
  const manager = createDomManager([...combined], options);

  // TODO add the editor to the remirror test chain
  createDomEditor({ ...props, element, manager });

  return RemirrorTestChain.create(manager);
}

/**
 * This creates a chainable test helper for testing your remirror presets,
 * extensions and commands.
 */
export class RemirrorTestChain<Combined extends AnyCombinedUnion> {
  static create<Combined extends AnyCombinedUnion>(manager: RemirrorManager<Combined>) {
    return new RemirrorTestChain(manager);
  }

  /** The editor manager */
  #manager: RemirrorManager<Combined>;

  /** Additional custom tags */
  #tags?: Tags;

  /**
   * Utilities provided by `@testing-library/react`.
   */

  /**
   * The nodes available for building the prosemirror document.
   */
  readonly nodes: Omit<NodeWithoutAttributes<this['manager']['~N'] | 'p'>, 'text'> = object();

  /**
   * The marks available for building up the prosemirror document.
   */
  readonly marks: MarkWithoutAttributes<this['manager']['~M']> = object();

  /**
   * The nodes available for building the prosemirror document as a function
   * that accepts custom attributes.
   *
   * Use this when testing nodes that can take custom attributes.
   */
  readonly attributeNodes: Omit<NodeWithAttributes<this['manager']['~N']>, 'text'> = object();

  /**
   * The marks available for building the prosemirror document as a function
   * that accepts custom attributes.
   *
   * Use this when testing marks that can take custom attributes.
   */
  readonly attributeMarks: MarkWithAttributes<this['manager']['~M']> = object();

  /**
   * Provide access to the editor manager.
   */
  get manager(): RemirrorManager<Combined> {
    return this.#manager;
  }

  /**
   * The editor view.
   */
  get view(): TestEditorView {
    return this.#manager.view as TestEditorView<SchemaFromCombined<Combined>>;
  }

  /**
   * The editor state.
   */
  get state(): EditorState<SchemaFromCombined<Combined>> {
    return this.view.state;
  }

  /**
   * The editor state.
   */
  get tr(): Transaction<SchemaFromCombined<Combined>> {
    return this.view.state.tr;
  }

  /**
   * The editor schema.
   */
  get schema() {
    return this.manager.schema;
  }

  /**
   * The root node for the editor.
   */
  get doc(): ProsemirrorNode<SchemaFromCombined<Combined>> {
    return this.state.doc;
  }

  /**
   * The commands available in the editor. When updating the content of the
   * TestEditor make sure not to use a stale copy of the actions otherwise it
   * will throw errors due to using an outdated state.
   */
  get commands(): CommandsFromCombined<Combined> {
    return this.#manager.store.commands;
  }

  /**
   * Access to which nodes and marks are active under the current selection.
   */
  get active(): ActiveFromCombined<Combined> {
    return this.#manager.store.active;
  }

  /**
   * The helpers available in the editor. When updating the content of the
   * TestEditor make sure not to use a stale copy of the helpers object
   * otherwise it will throw errors due to using an outdated state.
   */
  get helpers(): HelpersFromCombined<Combined> {
    return this.#manager.store.helpers;
  }

  /**
   * The start of the current selection
   */
  get start(): number {
    return this.state.selection.from;
  }

  /**
   * The end of the current selection. For a cursor selection this will be the
   * same as the start.
   */
  get end(): number {
    return this.state.selection.to;
  }

  /**
   * All custom tags that have been added  *not including* the following
   * - `<start>`
   * - `<end>`
   * - `<node>`
   * - `<cursor>`
   * - `<all>`
   * - `<anchor>`
   *
   * Which are all part of the formal cursor and selection API.
   */
  get tags(): Tags {
    return this.#tags ?? {};
  }

  /**
   * The dom node holding the view.
   */
  get dom(): Element {
    return this.view.dom;
  }

  /**
   * The innerHTML for the editor.
   */
  get innerHTML(): string {
    return this.dom.innerHTML;
  }

  private constructor(manager: RemirrorManager<Combined>) {
    this.#manager = manager;

    this.createDocBuilders();
  }

  /**
   * Create the node and mark document builders.
   */
  private createDocBuilders() {
    type MarkNames = GetMarkNameUnion<this['manager']['~E']>;
    type NodeNames = Exclude<GetNodeNameUnion<this['manager']['~E']>, 'text'>;

    this.nodes.p = nodeFactory({ name: 'paragraph', schema: this.schema });

    for (const extension of this.#manager.extensions) {
      if (isMarkExtension(extension)) {
        this.marks[extension.name as MarkNames] = markFactory({
          name: extension.name,
          schema: this.schema,
        });

        this.attributeMarks[extension.name as MarkNames] = (
          attrs: ProsemirrorAttributes = object(),
        ) => markFactory({ name: extension.name, schema: this.schema, attrs });
      }

      if (isNodeExtension(extension)) {
        this.nodes[extension.name as NodeNames] = nodeFactory({
          name: extension.name,
          schema: this.schema,
        });

        this.attributeNodes[extension.name as NodeNames] = (
          attrs: ProsemirrorAttributes = object(),
        ) => nodeFactory({ name: extension.name, schema: this.schema, attrs });
      }
    }
  }

  /**
   * Add content to the editor.
   *
   * If content already exists it will be overwritten.
   */
  readonly add = (taggedDocument: TaggedProsemirrorNode<SchemaFromCombined<Combined>>) => {
    const { content } = taggedDocument;
    const { cursor, node, start, end, all, anchor, ...tags } = taggedDocument.tags;

    this.#tags = tags;

    // Add the text to the dom
    const tr = this.tr.replaceWith(0, this.doc.nodeSize - 2, content);

    tr.setMeta('addToHistory', false);
    this.view.dispatch(tr);

    if (cursor) {
      dispatchTextSelection({ view: this.view, start: cursor });
    }

    if (start) {
      dispatchTextSelection({
        view: this.view,
        start,
        end: end && start <= end ? end : taggedDocument.resolve(start).end(),
      });
    }

    if (node) {
      dispatchNodeSelection({ view: this.view, pos: node });
    }

    if (all) {
      dispatchAllSelection(this.view);
    }

    if (anchor) {
      dispatchCellSelection({ view: this.view, pos: anchor });
    }

    return this;
  };

  /**
   * Alias for add.
   */
  readonly overwrite = (taggedDocument: TaggedProsemirrorNode<SchemaFromCombined<Combined>>) => {
    return this.add(taggedDocument);
  };

  /**
   * Updates the tags.
   */
  readonly update = (tags?: Tags) => {
    this.#tags = { ...this.tags, ...tags };

    return this;
  };

  /**
   * Selects the text between the provided start and end.
   */
  readonly selectText = (start: number, end?: number) => {
    dispatchTextSelection({
      view: this.view,
      start,
      end: end && start <= end ? end : this.doc.resolve(start).end(),
    });

    return this;
  };

  /**
   * Allows for the chaining of calls and is useful for running tests after
   * actions.
   *
   * You shouldn't use it to call any mutative functions that would change the
   * editor state.
   *
   * ```ts
   * const create = () => renderEditor({ plainNodes: [], others: [new EmojiExtension()] });
   * const {
   *   nodes: { p, doc },
   *   add,
   * } = create();
   *
   * add(doc(p('<cursor>'))).insertText(':-)')
   *   .callback(content => {
   *     expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
   *   })
   *   .insertText(' awesome')
   *   .callback(content => {
   *      expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 awesome')));
   *   });
   * ```
   */
  readonly callback = (
    fn: (
      content: Pick<
        this,
        'helpers' | 'commands' | 'end' | 'state' | 'tags' | 'start' | 'doc' | 'view'
      >,
    ) => void,
  ) => {
    fn(pick(this, ['helpers', 'commands', 'end', 'state', 'tags', 'start', 'doc', 'view']));

    return this;
  };

  /**
   * Runs a keyboard shortcut. e.g. `Mod-X`
   *
   * @param shortcut
   */
  readonly shortcut = (text: string) => {
    shortcut({ shortcut: text, view: this.view });
    return this;
  };

  /**
   * A simplistic implementation of pasting content into the editor. Underneath
   * it calls the paste handler `transformPaste` and that is all.
   *
   * @param content - The text or node to paste into the document at the current
   * selection.
   */
  readonly paste = (content: TaggedProsemirrorNode | string) => {
    pasteContent({ view: this.view, content });
    return this;
  };

  /**
   * Presses a key on the keyboard. e.g. `Mod-X`
   *
   * @param key - the key to press (or string representing a key)
   */
  readonly press = (char: string, times = 1) => {
    for (const _ of range(times)) {
      press({ char, view: this.view });
    }

    return this;
  };

  /**
   * Takes any command as an input and dispatches it within the document
   * context.
   *
   * @param command - the command function to run with the current state and
   * view
   */
  readonly dispatchCommand = (command: (parameter: Required<CommandFunctionParameter>) => any) => {
    command({ state: this.state, dispatch: this.view.dispatch, view: this.view, tr: this.tr });

    return this;
  };

  /**
   * Fires a custom event at the specified dom node. e.g. `click`
   *
   * @param shortcut - the shortcut to type
   */
  readonly fire = (parameters: FireParameter) => {
    fireEventAtPosition({ view: this.view, ...parameters });

    return this;
  };

  /**
   * Set selection in the document to a certain position
   */
  readonly jumpTo = (pos: 'start' | 'end' | number, endPos?: number) => {
    if (pos === 'start') {
      dispatchTextSelection({ view: this.view, start: 1 });
      return this;
    }

    if (pos === 'end') {
      dispatchTextSelection({ view: this.view, start: this.doc.content.size - 1 });
      return this;
    }

    dispatchTextSelection({ view: this.view, start: pos, end: endPos });
    return this;
  };

  /**
   * A function which replaces the current selection with the new content.
   *
   * This should be used to add new content to the dom.
   */
  readonly replace = (...replacement: string[] | TaggedProsemirrorNode[]) => {
    replaceSelection({ view: this.view, content: replacement });
    return this;
  };

  /**
   * Insert text at the current starting point for the cursor. Text will be
   * typed out with keys each firing a keyboard event.
   *
   * ! This doesn't currently support the use of tags and cursors.
   *
   * ! Adding multiple strings which create nodes creates an out of
   * position error
   */
  insertText = (text: string) => {
    const { from } = this.state.selection;

    insertText({ start: from, text, view: this.view });
    return this;
  };

  /**
   * Logs the view to the dom for help debugging the html in your tests.
   */
  readonly debug = () => {
    console.log(prettyDOM(this.view.dom as HTMLElement));
    return this;
  };

  /**
   * Cleanup the element from the dom. Use this if you decide against automatic
   * cleanup after tests.
   */
  readonly cleanup = () => {
    this.view.dom.parentElement?.remove();
  };
}

function isInPage(node: Node) {
  return node === document.body ? false : document.body.contains(node);
}

function createElement(element: Element | undefined, autoClean?: boolean) {
  if (!element) {
    element = document.createElement('div');
  }

  if (!isInPage(element)) {
    document.body.append(element);
  }

  if (autoClean) {
    elements.add(element);
  }

  return element;
}

function cleanup() {
  for (const element of elements) {
    if (element.parentNode === document.body) {
      element.remove();
    }

    elements.delete(element);
  }
}

if (isFunction(afterEach)) {
  afterEach(() => {
    cleanup();
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
} else if (isFunction(teardown)) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  teardown(() => {
    cleanup();
  });
}
