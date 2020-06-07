import { render, RenderResult } from '@testing-library/react/pure';
import {
  dispatchAllSelection,
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
import React from 'react';

import {
  ActiveFromCombined,
  AnyCombinedUnion,
  CommandFunction,
  CommandsFromCombined,
  EditorManager,
  EditorState,
  GetMarkNameUnion,
  GetNodeNameUnion,
  HelpersFromCombined,
  isMarkExtension,
  isNodeExtension,
  object,
  pick,
  ProsemirrorAttributes,
  ProsemirrorNode,
  SchemaFromCombined,
} from 'remirror/core';
import { CorePreset } from 'remirror/preset/core';
import { RenderEditor } from 'remirror/react';

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

/**
 * Render the editor for test purposes.
 *
 * By default it already has the core preset applied.
 */
export function renderEditor<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  { settings, props }: RenderEditorParameter<Combined> = object(),
) {
  const corePreset = new CorePreset();

  const manager = EditorManager.create([...combined, corePreset], settings);

  const utils = render(
    <RenderEditor {...props} manager={manager}>
      {(param) => {
        if (props?.children) {
          return props.children(param);
        }

        return <div />;
      }}
    </RenderEditor>,
  );

  return new RemirrorTestChain(manager, utils);
}

/**
 * This creates a chainable test helper for testing your remirror presets,
 * extensions and commands.
 */
export class RemirrorTestChain<Combined extends AnyCombinedUnion> {
  /** The editor manager */
  #manager: EditorManager<Combined>;

  /** Additional custom tags */
  #tags?: Tags;

  /**
   * Utilities provided by `@testing-library/react`.
   */
  readonly utils: RenderResult;

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
  get manager(): EditorManager<Combined> {
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
   * The editor schema.
   */
  get schema() {
    return this.state.schema;
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

  constructor(manager: EditorManager<Combined>, utils: RenderResult) {
    this.#manager = manager;
    this.utils = utils;

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
  add = (taggedDocument: TaggedProsemirrorNode<SchemaFromCombined<Combined>>) => {
    const { content } = taggedDocument;
    const { cursor, node, start, end, all, ...tags } = taggedDocument.tags;

    this.#tags = tags;

    // Add the text to the dom
    const tr = this.state.tr.replaceWith(0, this.doc.nodeSize - 2, content);

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

    return this;
  };

  /**
   * Alias for add.
   */
  overwrite = (taggedDocument: TaggedProsemirrorNode<SchemaFromCombined<Combined>>) => {
    return this.add(taggedDocument);
  };

  /**
   * Updates the tags.
   */
  update(tags?: Tags) {
    this.#tags = { ...this.tags, ...tags };

    return this;
  }

  /**
   * Selects the text between the provided start and end.
   */
  selectText = (start: number, end?: number) => {
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
  callback = (
    fn: (
      content: Pick<
        this,
        'helpers' | 'commands' | 'end' | 'state' | 'tags' | 'start' | 'doc' | 'view' | 'utils'
      >,
    ) => void,
  ) => {
    fn(
      pick(this, ['helpers', 'commands', 'end', 'state', 'tags', 'start', 'doc', 'view', 'utils']),
    );

    return this;
  };

  /**
   * Runs a keyboard shortcut. e.g. `Mod-X`
   *
   * @param shortcut
   */
  shortcut = (text: string) => {
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
  paste = (content: TaggedProsemirrorNode | string) => {
    pasteContent({ view: this.view, content });
    return this;
  };

  /**
   * Presses a key on the keyboard. e.g. `Mod-X`
   *
   * @param key - the key to press (or string representing a key)
   */
  press = (char: string) => {
    press({ char, view: this.view });
    return this;
  };

  /**
   * Takes any command as an input and dispatches it within the document
   * context.
   *
   * @param command - the command function to run with the current state and
   * view
   */
  dispatchCommand = (command: CommandFunction) => {
    command({ state: this.state, dispatch: this.view.dispatch, view: this.view });

    return this;
  };

  /**
   * Fires a custom event at the specified dom node. e.g. `click`
   *
   * @param shortcut - the shortcut to type
   */
  fire = (parameters: FireParameter) => {
    fireEventAtPosition({ view: this.view, ...parameters });

    return this;
  };

  /**
   * Set selection in the document to a certain position
   */
  jumpTo = (pos: 'start' | 'end' | number, endPos?: number) => {
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
  replace = (...replacement: string[]) => {
    replaceSelection({ view: this.view, content: replacement });
    return this;
  };

  /**
   * Insert text at the current starting point for the cursor. Text will be
   * typed out with keys each firing a keyboard event.
   *
   * ! This doesn't currently support the use of tags and cursors. ! Also adding
   * multiple strings which create nodes also creates an out of position error
   */
  insertText = (text: string) => {
    const { from } = this.state.selection;

    insertText({ start: from, text, view: this.view });
    return this;
  };

  /**
   * Logs the view to the dom for help debugging the html in your tests.
   */
  debug = () => {
    this.utils.debug(this.view.dom as HTMLElement);
    return this;
  };
}
