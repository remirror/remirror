import { prettyDOM } from '@testing-library/dom';
import {
  backspace,
  dispatchAllSelection,
  dispatchAnchorTextSelection,
  dispatchCellSelection,
  dispatchNodeSelection,
  dispatchTextSelection,
  fireEventAtPosition,
  FireProps,
  forwardDelete,
  insertText,
  pasteContent,
  press,
  shortcut,
  TestEditorView,
} from 'jest-prosemirror';
import {
  ActiveFromExtensions,
  AnyExtension,
  BuiltinPreset,
  ChainedFromExtensions,
  CommandFunctionProps,
  CommandsFromExtensions,
  EditorState,
  getTextSelection,
  HelpersFromExtensions,
  isFunction,
  isMarkExtension,
  isNodeExtension,
  isNumber,
  object,
  pick,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
  range,
  RemirrorManager,
  Transaction,
} from '@remirror/core';
import { createDomEditor, createDomManager } from '@remirror/dom';
import type { CorePreset } from '@remirror/preset-core';

import { markFactory, nodeFactory } from './jest-remirror-builder';
import type {
  MarkWithAttributes,
  MarkWithoutAttributes,
  NodeWithAttributes,
  NodeWithoutAttributes,
  RenderEditorProps,
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
export function renderEditor<Extension extends AnyExtension>(
  extensions: Extension[] | (() => Extension[]),
  { props, autoClean, ...options }: RenderEditorProps<Extension> = object(),
): RemirrorTestChain<Extension | CorePreset | BuiltinPreset> {
  const element = createElement(props?.element, autoClean);
  const manager = createDomManager(extensions, options);

  createDomEditor<Extension | CorePreset | BuiltinPreset>({ ...props, element, manager });

  return RemirrorTestChain.create(manager);
}

/**
 * This creates a chainable test helper for testing your remirror presets,
 * extensions and commands.
 *
 * @template Extension - All the extensions being used within this editor
 */
export class RemirrorTestChain<Extension extends AnyExtension> {
  /**
   * A static method for creating the test helpers when testing your remirror
   * models.
   */
  static create<Extension extends AnyExtension = Remirror.Extensions>(
    manager: RemirrorManager<Extension>,
  ): RemirrorTestChain<Extension> {
    return new RemirrorTestChain<Extension>(manager);
  }

  /** The editor manager */
  #manager: RemirrorManager<Extension>;

  /** Additional custom tags */
  #tags?: Tags;

  /**
   * The nodes available for building the prosemirror document.
   */
  readonly nodes: Omit<NodeWithoutAttributes<this['manager']['~N'] | 'p'>, 'text'> = object();

  /**
   * The marks available for building up the prosemirror document.
   */
  readonly marks: MarkWithoutAttributes<this['manager']['~M']> = object();

  /**
   * This is similar to the `node` except that each function returned here is
   * able to receive custom attributes.
   *
   * ```ts
   * import { HeadingExtension } from 'remirror/extensions';
   *
   * const editor = renderEditor([new HeadingExtension()])
   * const { heading } = editor.attributeNodes;
   *
   * heading({ level: 4, id: '1223' })('My custom heading');
   * ```
   *
   * This attaches the attributes `level` and `id` to the `heading` node and the
   * content `My custom heading` and would be rendered to HTML as:
   * ```html
   * <h4 id="1224">My custom heading</h4>
   * ```
   *
   * Use this when testing nodes that can take custom attributes.
   */
  readonly attributeNodes: Omit<NodeWithAttributes<this['manager']['~N']>, 'text'> = object();

  /**
   * This is very similar to the `attributeNodes` except for marks which can
   * need to provide custom attributes.
   *
   * Use this when testing marks that can take custom attributes.
   */
  readonly attributeMarks: MarkWithAttributes<this['manager']['~M']> = object();

  /**
   * Provide access to the editor manager.
   */
  get manager(): RemirrorManager<Extension> {
    return this.#manager;
  }

  /**
   * The editor view.
   */
  get view(): TestEditorView<this['manager']['~Sch']> {
    return this.manager.view as TestEditorView<this['manager']['~Sch']>;
  }

  /**
   * The editor state.
   */
  get state(): EditorState<this['manager']['~Sch']> {
    return this.view.state;
  }

  /**
   * The editor state.
   */
  get tr(): Transaction<this['manager']['~Sch']> {
    return this.view.state.tr;
  }

  /**
   * The editor schema.
   */
  get schema(): this['manager']['~Sch'] {
    return this.manager.schema;
  }

  /**
   * The root node for the editor.
   */
  get doc(): ProsemirrorNode<this['manager']['~Sch']> {
    return this.state.doc;
  }

  /**
   * The commands available in the editor. When updating the content of the
   * TestEditor make sure not to use a stale copy of the actions otherwise it
   * will throw errors due to using an outdated state.
   */
  get commands(): CommandsFromExtensions<Extension> {
    return this.#manager.store.commands;
  }

  /**
   * The chainable commands available in the editor. When updating the content of the
   * TestEditor make sure not to use a stale copy of the actions otherwise it
   * will throw errors due to using an outdated state.
   */
  get chain(): ChainedFromExtensions<Extension> {
    return this.#manager.store.chain;
  }

  /**
   * Access to which nodes and marks are active under the current selection.
   */
  get active(): ActiveFromExtensions<Extension> {
    return this.#manager.store.active;
  }

  /**
   * The helpers available in the editor. When updating the content of the
   * TestEditor make sure not to use a stale copy of the helpers object
   * otherwise it will throw errors due to using an outdated state.
   */
  get helpers(): HelpersFromExtensions<Extension> {
    return this.#manager.store.helpers;
  }

  /**
   * The start of the current selection
   */
  get from(): number {
    return this.state.selection.from;
  }

  /**
   * The end of the current selection. For a cursor selection this will be the
   * same as the start.
   */
  get to(): number {
    return this.state.selection.to;
  }

  /**
   * @deprecated use `from` instead
   */
  get start(): number {
    return this.state.selection.from;
  }

  /**
   * @deprecated use `to` instead
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
  get dom(): HTMLElement {
    return this.view.dom as HTMLElement;
  }

  /**
   * The innerHTML for the editor.
   */
  get innerHTML(): string {
    return this.dom.innerHTML;
  }

  private constructor(manager: RemirrorManager<Extension>) {
    this.#manager = manager;
    this.createDocBuilders();
    this.setupCloneListener();
  }

  /**
   * Replace the manager with the newly cloned manager when cloned.
   */
  private setupCloneListener() {
    const dispose = this.#manager.addHandler('clone', (newManager) => {
      this.#manager = newManager as any;
      dispose();
      this.setupCloneListener();
    });
  }

  /**
   * Create the node and mark document builders.
   */
  private createDocBuilders() {
    type MarkNames = this['manager']['~M'];
    type NodeNames = Exclude<this['manager']['~N'], 'text'>;

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
  readonly add = (taggedDocument: TaggedProsemirrorNode<this['manager']['~Sch']>): this => {
    const { content } = taggedDocument;
    const { cursor, node, start, end, all, anchor, head, ...tags } = taggedDocument.tags;
    const view = this.view;

    this.#tags = tags;

    // Add the text to the dom
    const tr = this.tr.replaceWith(0, this.doc.nodeSize - 2, content);

    tr.setMeta('addToHistory', false);
    view.dispatch(tr);

    if (isNumber(cursor)) {
      dispatchTextSelection({ view, start: cursor });
    } else if (isNumber(start)) {
      dispatchTextSelection({
        view,
        start,
        end: isNumber(end) && start <= end ? end : taggedDocument.resolve(start).end(),
      });
    } else if (isNumber(head) && isNumber(anchor)) {
      dispatchAnchorTextSelection({ view, anchor, head });
    } else if (isNumber(node)) {
      dispatchNodeSelection({ view, pos: node });
    } else if (isNumber(all)) {
      dispatchAllSelection(view);
    } else if (isNumber(anchor)) {
      dispatchCellSelection({ view, pos: anchor });
    }

    return this;
  };

  /**
   * Alias for add.
   */
  readonly overwrite = (taggedDocument: TaggedProsemirrorNode<this['manager']['~Sch']>): this => {
    return this.add(taggedDocument);
  };

  /**
   * Updates the tags.
   */
  readonly update = (tags?: Tags): this => {
    this.#tags = { ...this.tags, ...tags };

    return this;
  };

  /**
   * Selects the text between the provided start and end.
   */
  readonly selectText = (selection: PrimitiveSelection): this => {
    const tr = this.tr;
    const textSelection = getTextSelection(selection, tr.doc);

    this.view.dispatch(tr.setSelection(textSelection));

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
        'helpers' | 'commands' | 'to' | 'state' | 'tags' | 'from' | 'start' | 'end' | 'doc' | 'view'
      >,
    ) => void,
  ): this => {
    fn(
      pick(this, [
        'helpers',
        'commands',
        'to',
        'state',
        'tags',
        'from',
        'start',
        'end',
        'doc',
        'view',
      ]),
    );

    return this;
  };

  /**
   * Runs a keyboard shortcut. e.g. `Mod-X`
   *
   * @param shortcut
   */
  readonly shortcut = (text: string): this => {
    shortcut({ shortcut: text, view: this.view });
    return this;
  };

  /**
   * A simplistic implementation of pasting content into the editor. Underneath
   * it calls the paste handler `transformPaste` and that is all.
   *
   * @param content - The text or node to paste into the document at the current
   * —ion.
   */
  readonly paste = (content: TaggedProsemirrorNode | string): this => {
    pasteContent({ view: this.view, content });
    return this;
  };

  /**
   * Presses a key on the keyboard. e.g. `Mod-X`
   *
   * @param key - the key to press (or string representing a key)
   */
  readonly press = (char: string, times = 1): this => {
    for (const _ of range(times)) {
      press({ char, view: this.view });
    }

    return this;
  };

  /**
   * Simulates a backspace keypress and deletes text backwards.
   */
  readonly backspace = (times?: number): this => {
    backspace({ view: this.view, times });

    return this;
  };

  /**
   * Simulates a forward deletion.
   */
  readonly forwardDelete = (times?: number): this => {
    forwardDelete({ view: this.view, times });

    return this;
  };

  /**
   * Takes any command as an input and dispatches it within the document
   * context.
   *
   * @param command - the command function to run with the current state and
   * view
   */
  readonly dispatchCommand = (command: (props: Required<CommandFunctionProps>) => any): this => {
    command({ state: this.state, dispatch: this.view.dispatch, view: this.view, tr: this.tr });

    return this;
  };

  /**
   * Fires a custom event at the specified dom node. e.g. `click`
   *
   * @param shortcut - the shortcut to type
   */
  readonly fire = (parameters: FireProps): this => {
    fireEventAtPosition({ view: this.view, ...parameters });

    return this;
  };

  /**
   * Set selection in the document to a certain position
   */
  readonly jumpTo = (pos: 'start' | 'end' | number, endPos?: number): this => {
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
  readonly replace = (...replacement: string[] | TaggedProsemirrorNode[]): this => {
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
  insertText = (text: string): this => {
    const { from } = this.state.selection;
    insertText({ start: from, text, view: this.view });
    return this;
  };

  /**
   * Logs the view to the dom for help debugging the html in your tests.
   */
  readonly debug = (element = this.view.dom): this => {
    // eslint-disable-next-line no-console
    console.log(prettyDOM(element));
    return this;
  };

  /**
   * Cleanup the element from the dom. Use this if you decide against automatic
   * cleanup after tests.
   */
  readonly cleanup = (): void => {
    this.view.dom.parentElement?.remove();
  };
}

/**
 * Checks whether the provided node is in the page. Used by `createElement`.
 */
function isInPage(node: Node) {
  return node === document.body ? false : document.body.contains(node);
}

/**
 * Create an element in a way that can be tracked for easier cleanup after
 * tests.
 *
 * @param element - the element to create or undefined if the element should be
 * created by this function. When left undefined the element defaults to a
 * `div`.
 * @param autoClean - Whether to automatically cleanup this element after the
 * test. Defaults to `true`.
 */
function createElement(element: Element | undefined, autoClean = true): Element {
  if (!element) {
    // Default to using a `div` when no element provided.
    element = document.createElement('div');
  }

  // Make sure the element hasn't been previously added to the document body
  // adding it.
  if (!isInPage(element)) {
    document.body.append(element);
  }

  // Auto clean works by tracking elements in a `Set` and at the end of a test
  // all elements that are included will be deleted.
  if (autoClean) {
    elements.add(element);
  }

  return element;
}

/**
 * Removes all the element added during the test, which where marked for
 */
function cleanup() {
  for (const element of elements) {
    if (element.parentNode === document.body) {
      element.remove();
    }

    elements.delete(element);
  }
}

// Cleanup the created elements after each test.
if (isFunction(afterEach)) {
  // In a jest environment this should always be true (and this is the only
  // environment supported by `jest-remirror`).
  afterEach(() => {
    cleanup();
  });
}
