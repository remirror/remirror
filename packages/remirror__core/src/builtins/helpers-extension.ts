import { ErrorConstant, NULL_CHARACTER } from '@remirror/core-constants';
import { entries, isEmptyObject, object } from '@remirror/core-helpers';
import type {
  AnyFunction,
  CommandFunction,
  EditorState,
  EditorStateProps,
  EmptyShape,
  Fragment,
  LiteralUnion,
  ProsemirrorAttributes,
  ProsemirrorNode,
  RemirrorJSON,
  Shape,
  StateJSON,
} from '@remirror/core-types';
import {
  FragmentStringHandlerOptions,
  getActiveNode,
  getMarkRange,
  htmlToProsemirrorNode,
  isMarkActive,
  isNodeActive,
  isSelectionEmpty,
  NodeStringHandlerOptions,
  prosemirrorNodeToHtml,
  StringHandlerOptions,
} from '@remirror/core-utils';

import {
  ActiveFromExtensions,
  AnyExtension,
  AttrsFromExtensions,
  extension,
  Helper,
  HelperNames,
  HelpersFromExtensions,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import type { ExtensionHelperReturn } from '../types';
import { command, helper, HelperDecoratorOptions } from './builtin-decorators';
import { InsertNodeOptions } from './commands-extension';

/**
 * Helpers are custom methods that can provide extra functionality to the
 * editor.
 *
 * @remarks
 *
 * They can be used for pulling information from the editor or performing custom
 * async commands.
 *
 * Also provides the default helpers used within the extension.
 *
 * @category Builtin Extension
 */
@extension({})
export class HelpersExtension extends PlainExtension {
  get name() {
    return 'helpers' as const;
  }

  /**
   * Add the `html` and `text` string handlers to the editor.
   */
  onCreate(): void {
    this.store.setStringHandler('text', this.textToProsemirrorNode.bind(this));
    this.store.setStringHandler('html', htmlToProsemirrorNode);

    const helpers: Record<string, AnyFunction> = object();
    const active: Record<string, AnyFunction> = object();
    const attrs: Record<string, AnyFunction> = object();
    const names = new Set<string>();

    for (const extension of this.store.extensions) {
      if (isNodeExtension(extension)) {
        active[extension.name] = (attrs?: ProsemirrorAttributes) => {
          return isNodeActive({ state: this.store.getState(), type: extension.type, attrs });
        };

        attrs[extension.name] = (attrs?: ProsemirrorAttributes) => {
          return getActiveNode({ state: this.store.getState(), type: extension.type, attrs })?.node
            .attrs;
        };
      }

      if (isMarkExtension(extension)) {
        active[extension.name] = () => {
          return isMarkActive({ trState: this.store.getState(), type: extension.type });
        };

        attrs[extension.name] = () => {
          return getMarkRange(this.store.getState().selection.$from, extension.type)?.mark.attrs;
        };
      }

      const extensionHelpers = extension.createHelpers?.() ?? {};

      for (const helperName of Object.keys(extension.decoratedHelpers ?? {})) {
        extensionHelpers[helperName] = (extension as Shape)[helperName].bind(extension);
      }

      if (isEmptyObject(extensionHelpers)) {
        continue;
      }

      for (const [name, helper] of entries(extensionHelpers)) {
        throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_HELPER_NAMES });
        helpers[name] = helper;
      }
    }

    this.store.setStoreKey('attrs', attrs);
    this.store.setStoreKey('active', active);
    this.store.setStoreKey('helpers', helpers as any);
    this.store.setExtensionStore('attrs', attrs);
    this.store.setExtensionStore('active', active);
    this.store.setExtensionStore('helpers', helpers as any);
  }

  /**
   * Check whether the selection is empty.
   */
  @helper()
  isSelectionEmpty(state: EditorState = this.store.getState()): Helper<boolean> {
    return isSelectionEmpty(state);
  }

  /**
   * Get the full JSON output for the ProseMirror editor state object.
   */
  @helper()
  getStateJSON(state: EditorState = this.store.getState()): Helper<StateJSON> {
    return state.toJSON() as StateJSON;
  }

  /**
   * Get the JSON output for the main ProseMirror `doc` node.
   *
   * This can be used to persist data between sessions and can be passed as
   * content to the `initialContent` prop.
   */
  @helper()
  getJSON(state: EditorState = this.store.getState()): Helper<RemirrorJSON> {
    return state.doc.toJSON() as RemirrorJSON;
  }

  /**
   * @deprecated use `getJSON` instead.
   */
  @helper()
  getRemirrorJSON(state: EditorState = this.store.getState()): Helper<RemirrorJSON> {
    return this.getJSON(state);
  }

  /**
   * Insert a html string as a ProseMirror Node.
   *
   * @category Builtin Command
   */
  @command()
  insertHtml(html: string, options?: InsertNodeOptions): CommandFunction {
    return (props) => {
      const { state } = props;
      const fragment = htmlToProsemirrorNode({
        content: html,
        schema: state.schema,
        fragment: true,
      });

      return this.store.commands.insertNode.original(fragment, options)(props);
    };
  }

  /**
   * A method to get all the content in the editor as text. Depending on the
   * content in your editor, it is not guaranteed to preserve it 100%, so it's
   * best to test that it meets your needs before consuming.
   */
  @helper()
  getText({
    lineBreakDivider = '\n\n',
    state = this.store.getState(),
  }: GetTextHelperOptions = {}): Helper<string> {
    return state.doc.textBetween(0, state.doc.content.size, lineBreakDivider, NULL_CHARACTER);
  }

  @helper()
  getTextBetween(
    from: number,
    to: number,
    doc: ProsemirrorNode = this.store.getState().doc,
  ): Helper<string> {
    return doc.textBetween(from, to, '\n\n', NULL_CHARACTER);
  }

  /**
   * Get the html from the current state, or provide a custom state.
   */
  @helper()
  getHTML(state: EditorState = this.store.getState()): Helper<string> {
    return prosemirrorNodeToHtml(state.doc, this.store.document);
  }

  /**
   * Wrap the content in a pre tag to preserve whitespace and see what the
   * editor does with it.
   */
  private textToProsemirrorNode(options: FragmentStringHandlerOptions): Fragment;
  private textToProsemirrorNode(options: NodeStringHandlerOptions): ProsemirrorNode;
  private textToProsemirrorNode(options: StringHandlerOptions): ProsemirrorNode | Fragment {
    const content = `<pre>${options.content}</pre>`;

    return this.store.stringHandlers.html({ ...(options as NodeStringHandlerOptions), content });
  }
}

interface GetTextHelperOptions extends Partial<EditorStateProps> {
  /**
   * The divider used to separate text blocks.
   *
   * @default '\n\n'
   */
  lineBreakDivider?: string;
}

declare global {
  namespace Remirror {
    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * The helpers provided by the extensions used.
       */
      helpers: HelpersFromExtensions<Extension>;

      /**
       * Check which nodes and marks are active under the current user
       * selection.
       *
       * ```ts
       * const { active } = manager.store;
       *
       * return active.bold() ? 'bold' : 'regular';
       * ```
       */
      active: ActiveFromExtensions<Extension>;

      /**
       * Get the attributes for the named node or mark from the current user
       * selection.
       *
       * ```ts
       * const { attrs } = manager.store;
       *
       * attrs.heading(); // => { id: 'i1238ha', level: 1 }
       * ```
       */
      attrs: AttrsFromExtensions<Extension>;
    }

    interface BaseExtension {
      /**
       * `ExtensionHelpers`
       *
       * This pseudo property makes it easier to infer Generic types of this
       * class.
       *
       * @internal
       */
      ['~H']: this['createHelpers'] extends AnyFunction
        ? ReturnType<this['createHelpers']>
        : EmptyShape;

      /**
       * @experimental
       *
       * Stores all the helpers that have been added via decorators to the
       * extension instance. This is used by the `HelpersExtension` to pick the
       * helpers.
       *
       * @internal
       */
      decoratedHelpers?: Record<string, HelperDecoratorOptions>;

      /**
       * A helper method is a function that takes in arguments and returns a
       * value depicting the state of the editor specific to this extension.
       *
       * @remarks
       *
       * Unlike commands they can return anything and may not effect the
       * behavior of the editor.
       *
       * Below is an example which should provide some idea on how to add
       * helpers to the app.
       *
       * ```tsx
       * // extension.ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyBeautifulExtension = ExtensionFactory.plain({
       *   name: 'beautiful',
       *   createHelpers: () => ({
       *     checkBeautyLevel: () => 100
       *   }),
       * })
       * ```
       *
       * ```
       * // app.tsx
       * import { useRemirrorContext } from '@remirror/react';
       *
       * const MyEditor = () => {
       *   const { helpers } = useRemirrorContext({ autoUpdate: true });
       *
       *   return helpers.beautiful.checkBeautyLevel() > 50
       *     ? (<span>😍</span>)
       *     : (<span>😢</span>);
       * };
       * ```
       */
      createHelpers?(): ExtensionHelperReturn;
    }

    interface StringHandlers {
      /**
       * Register the plain `text` string handler which renders a text string
       * inside a `<pre />`.
       */
      text: HelpersExtension;

      /**
       * Register the html string handler, which converts a html string to a
       * prosemirror node.
       */
      html: HelpersExtension;
    }

    interface ExtensionStore {
      /**
       * Helper method to provide information about the content of the editor.
       * Each extension can register its own helpers.
       *
       * This should only be accessed after the `onView` lifecycle method
       * otherwise it will throw an error.
       */
      helpers: HelpersFromExtensions<Extensions>;

      /**
       * Check which nodes and marks are active under the current user
       * selection.
       *
       * ```ts
       * const { active } = manager.store;
       *
       * return active.bold() ? 'bold' : 'regular';
       * ```
       */
      active: ActiveFromExtensions<Extensions>;

      /**
       * Get the attributes for the named node or mark from the current user
       * selection.
       *
       * ```ts
       * const { attrs } = manager.store;
       *
       * attrs.heading(); // => { id: 'i1238ha', level: 1 }
       * ```
       */
      attrs: AttrsFromExtensions<Extensions>;
    }

    interface ListenerProperties<Extension extends AnyExtension> {
      helpers: HelpersFromExtensions<Extension>;
    }

    interface AllExtensions {
      helpers: HelpersExtension;
    }
  }

  /**
   * The helpers name for all extension defined in the current project.
   */
  type AllHelperNames = LiteralUnion<HelperNames<Remirror.Extensions>, string>;
}
