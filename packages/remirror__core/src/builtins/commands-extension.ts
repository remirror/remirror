import { ErrorConstant, ExtensionPriority, NamedShortcut } from '@remirror/core-constants';
import {
  entries,
  invariant,
  isEmptyArray,
  isEmptyObject,
  isString,
  object,
  uniqueArray,
} from '@remirror/core-helpers';
import type {
  AnyFunction,
  CommandFunction,
  CommandFunctionProps,
  DispatchFunction,
  EditorSchema,
  EmptyShape,
  Fragment,
  FromToProps,
  LiteralUnion,
  MarkType,
  NodeType,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
  RemirrorContentType,
  Shape,
  Static,
  Transaction,
} from '@remirror/core-types';
import {
  environment,
  getMarkRange,
  getTextSelection,
  htmlToProsemirrorNode,
  isEmptyBlockNode,
  isProsemirrorFragment,
  isProsemirrorNode,
  isTextSelection,
  removeMark,
  RemoveMarkProps,
  replaceText,
  ReplaceTextProps,
  setBlockType,
  toggleBlockItem,
  ToggleBlockItemProps,
  toggleWrap,
  wrapIn,
} from '@remirror/core-utils';
import { CoreMessages as Messages } from '@remirror/messages';
import { Mark } from '@remirror/pm/model';
import { TextSelection } from '@remirror/pm/state';
import type { EditorView } from '@remirror/pm/view';

import { applyMark, insertText, InsertTextOptions, toggleMark, ToggleMarkProps } from '../commands';
import {
  AnyExtension,
  ChainedCommandProps,
  ChainedFromExtensions,
  CommandNames,
  CommandsFromExtensions,
  extension,
  Helper,
  PlainExtension,
  UiCommandNames,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import type {
  CommandShape,
  CreateExtensionPlugin,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
  FocusType,
  StateUpdateLifecycleProps,
} from '../types';
import { command, CommandDecoratorOptions, helper } from './builtin-decorators';

export interface CommandOptions {
  /**
   * The className that is added to all tracker positions
   *
   * '@default 'remirror-tracker-position'
   */
  trackerClassName?: Static<string>;

  /**
   * The default element that is used for all trackers.
   *
   * @default 'span'
   */
  trackerNodeName?: Static<string>;
}

/**
 * Generate chained and unchained commands for making changes to the editor.
 *
 * @remarks
 *
 * Typically actions are used to create interactive menus. For example a menu
 * can use a command to toggle bold formatting or to undo the last action.
 *
 * @category Builtin Extension
 */
@extension<CommandOptions>({
  defaultPriority: ExtensionPriority.Highest,
  defaultOptions: { trackerClassName: 'remirror-tracker-position', trackerNodeName: 'span' },
  staticKeys: ['trackerClassName', 'trackerNodeName'],
})
export class CommandsExtension extends PlainExtension<CommandOptions> {
  get name() {
    return 'commands' as const;
  }

  /**
   * The current transaction which allows for making commands chainable.
   *
   * It is shared by all the commands helpers and can even be used in the
   * [[`KeymapExtension`]].
   *
   * @internal
   */
  get transaction(): Transaction {
    // Make sure we have the most up to date state.
    const state = this.store.getState();

    if (!this._transaction) {
      // Since there is currently no transaction set, make sure to create a new
      // one. Behind the scenes `state.tr` creates a new transaction for us to
      // use.
      this._transaction = state.tr;
    }

    // Check that the current transaction is valid.
    const isValid = this._transaction.before.eq(state.doc);

    // Check whether the current transaction has any already applied to it.
    const hasSteps = !isEmptyArray(this._transaction.steps);

    if (!isValid) {
      // Since the transaction is not valid we create a new one to prevent any
      // `mismatched` transaction errors.
      const tr = state.tr;

      // Now checking if any steps had been added to the previous transaction
      // and adding them to the newly created transaction.
      if (hasSteps) {
        for (const step of this._transaction.steps) {
          tr.step(step);
        }
      }

      // Make sure to store the transaction value to the instance of this
      // extension.
      this._transaction = tr;
    }

    return this._transaction;
  }

  /**
   * This is the holder for the shared transaction which is shared by commands
   * in order to support chaining.
   *
   * @internal
   */
  private _transaction?: Transaction;

  /**
   * Track the decorated command data.
   */
  private readonly decorated = new Map<string, WithName<CommandDecoratorOptions>>();

  onCreate(): void {
    this.store.setStoreKey('getForcedUpdates', this.getForcedUpdates.bind(this));
  }

  /**
   * Attach commands once the view is attached.
   */
  onView(view: EditorView<EditorSchema>): void {
    const { extensions, helpers } = this.store;
    const commands: Record<string, CommandShape> = object();
    const names = new Set<string>();
    let allDecoratedCommands: Record<string, CommandDecoratorOptions> = object();

    const chain = (tr?: Transaction) => {
      // This function allows for custom chaining.
      const customChain: Record<string, any> & ChainedCommandProps = object();
      const getTr = () => tr ?? this.transaction;
      let commandChain: Array<(dispatch?: DispatchFunction) => boolean> = [];
      const getChain = () => commandChain;

      for (const [name, command] of Object.entries(commands)) {
        if (allDecoratedCommands[name]?.disableChaining) {
          continue;
        }

        customChain[name] = this.chainedFactory({
          chain: customChain,
          command: command.original,
          getTr,
          getChain,
        });
      }

      /**
       * This function is used in place of the `view.dispatch` method which is
       * passed through to all commands.
       *
       * It is responsible for checking that the transaction which was
       * dispatched is the same as the shared transaction which makes chainable
       * commands possible.
       */
      const dispatch: DispatchFunction = (transaction) => {
        // Throw an error if the transaction being dispatched is not the same as
        // the currently stored transaction.
        invariant(transaction === getTr(), {
          message:
            'Chaining currently only supports `CommandFunction` methods which do not use the `state.tr` property. Instead you should use the provided `tr` property.',
        });
      };

      customChain.run = (options = {}) => {
        const commands = commandChain;
        commandChain = [];

        for (const cmd of commands) {
          // Exit early when the command returns false and the option is
          // provided.
          if (!cmd(dispatch) && options.exitEarly) {
            return;
          }
        }

        view.dispatch(getTr());
      };

      customChain.tr = () => {
        const commands = commandChain;
        commandChain = [];

        for (const cmd of commands) {
          cmd(dispatch);
        }

        return getTr();
      };

      customChain.enabled = () => {
        for (const cmd of commandChain) {
          if (!cmd()) {
            return false;
          }
        }

        return true;
      };

      return customChain;
    };

    for (const extension of extensions) {
      const extensionCommands: ExtensionCommandReturn = extension.createCommands?.() ?? {};
      const decoratedCommands = extension.decoratedCommands ?? {};
      const active: Record<string, () => boolean> = {};

      // Augment the decorated commands.
      allDecoratedCommands = { ...allDecoratedCommands, decoratedCommands };

      for (const [commandName, options] of Object.entries(decoratedCommands)) {
        const shortcut =
          isString(options.shortcut) && options.shortcut.startsWith('_|')
            ? { shortcut: helpers.getNamedShortcut(options.shortcut, extension.options) }
            : undefined;
        this.updateDecorated(commandName, { ...options, name: extension.name, ...shortcut });

        extensionCommands[commandName] = (extension as Shape)[commandName].bind(extension);

        if (options.active) {
          active[commandName] = () => options.active?.(extension.options, this.store) ?? false;
        }
      }

      if (isEmptyObject(extensionCommands)) {
        continue;
      }

      // Gather the returned commands object from the extension.
      this.addCommands({ active, names, commands, extensionCommands });
    }

    const chainProperty = chain();

    for (const [key, command] of Object.entries(chainProperty)) {
      (chain as Record<string, any>)[key] = command;
    }

    this.store.setStoreKey('commands', commands as any);
    this.store.setStoreKey('chain', chain as any);
    this.store.setExtensionStore('commands', commands as any);
    this.store.setExtensionStore('chain', chain as any);
  }

  /**
   * Update the cached transaction whenever the state is updated.
   */
  onStateUpdate({ state }: StateUpdateLifecycleProps): void {
    this._transaction = state.tr;
  }

  /**
   * Create a plugin that solely exists to track forced updates via the
   * generated plugin key.
   */
  createPlugin(): CreateExtensionPlugin {
    return {};
  }

  /**
   * Enable custom commands to be used within the editor by users.
   *
   * This is preferred to the initial idea of setting commands on the
   * manager or even as a prop. The problem is that there's no typechecking
   * and it should be just fine to add your custom commands here to see the
   * dispatched immediately.
   *
   * To use it, firstly define the command.
   *
   * ```ts
   * import { CommandFunction } from 'remirror';
   *
   * const myCustomCommand: CommandFunction = ({ tr, dispatch }) => {
   *   dispatch?.(tr.insertText('My Custom Command'));
   *
   *   return true;
   * }
   * ```
   *
   * And then use it within the component.
   *
   * ```ts
   * import React, { useCallback } from 'react';
   * import { useRemirror } from '@remirror/react';
   *
   * const MyEditorButton = () => {
   *   const { commands } = useRemirror();
   *   const onClick = useCallback(() => {
   *     commands.customDispatch(myCustomCommand);
   *   }, [commands])
   *
   *   return <button onClick={onClick}>Custom Command</button>
   * }
   * ```
   *
   * An alternative is to use a custom command directly from a
   * `prosemirror-*` library. This can be accomplished in the following way.
   *
   *
   * ```ts
   * import { joinDown } from 'prosemirror-commands';
   * import { convertCommand } from 'remirror';
   *
   * const MyEditorButton = () => {
   *   const { commands } = useRemirror();
   *   const onClick = useCallback(() => {
   *     commands.customDispatch(convertCommand(joinDown));
   *   }, [commands]);
   *
   *   return <button onClick={onClick}>Custom Command</button>;
   * };
   * ```
   */
  @command()
  customDispatch(command: CommandFunction): CommandFunction {
    return command;
  }

  /**
   * Insert text into the dom at the current location by default. If a
   * promise is provided instead of text the resolved value will be inserted
   * at the tracked position.
   */
  @command()
  insertText(
    text: string | (() => Promise<string>),
    options: InsertTextOptions = {},
  ): CommandFunction {
    if (isString(text)) {
      return insertText(text, options);
    }

    return this.store
      .createPlaceholderCommand({
        promise: text,
        placeholder: { type: 'inline' },
        onSuccess: (value, range, props) => {
          return this.insertText(value, { ...options, ...range })(props);
        },
      })
      .generateCommand();
  }

  /**
   * Select the text within the provided range.
   *
   * Here are some ways it can be used.
   *
   * ```ts
   * // Set to the end of the document.
   * commands.setSelection('end');
   *
   * // Set the selection to the start of the document.
   * commands.setSelection('start');
   *
   * // Select all the text in the document.
   * commands.setSelection('all')
   *
   * // Select a range of text. It's up to you to make sure the selected
   * // range is valid.
   * commands.setSelection({ from: 10, to: 15 });
   *
   * // Specify the anchor and range in the selection.
   * commands.setSelection({ anchor: 10, head: 15 });
   *
   * // Set to a specific position.
   * commands.setSelection(10);
   *
   * // Use a ProseMirror selection
   * commands.setSelection(new TextSelection(state.doc.resolve(10)))
   * ```
   *
   * Although this is called `selectText` you can provide your own selection
   * option which can be any type of selection.
   */
  @command()
  selectText(
    selection: PrimitiveSelection,
    options: { forceUpdate?: boolean } = {},
  ): CommandFunction {
    return ({ tr, dispatch }) => {
      const textSelection = getTextSelection(selection, tr.doc);

      // Check if the selection is unchanged (for example when refocusing on the
      // editor) and if it is, then the text doesn't need to be reselected.
      const selectionUnchanged =
        tr.selection.anchor === textSelection.anchor && tr.selection.head === textSelection.head;

      if (selectionUnchanged && !options.forceUpdate) {
        // Do nothing if the selection is unchanged.
        return false;
      }

      dispatch?.(tr.setSelection(textSelection));

      return true;
    };
  }

  /**
   * Select the link at the current location.
   */
  @command()
  selectMark(type: string | MarkType): CommandFunction {
    return (props) => {
      const { tr } = props;
      const range = getMarkRange(tr.selection.$from, type);

      if (!range) {
        return false;
      }

      return this.store.commands.selectText.original({ from: range.from, to: range.to })(props);
    };
  }

  /**
   * Delete the provided range or current selection.
   */
  @command()
  delete(range?: FromToProps): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = range ?? tr.selection;
      dispatch?.(tr.delete(from, to));

      return true;
    };
  }

  /**
   * Fire an empty update to trigger an update to all decorations, and state
   * that may not yet have run.
   *
   * This can be used in extensions to trigger updates certain options that
   * affect the editor state have updated.
   *
   * @param action - provide an action which is called just before the empty
   * update is dispatched (only when dispatch is available). This can be used in
   * chainable editor scenarios when you want to lazily invoke an action at the
   * point the update is about to be applied.
   */
  @command()
  emptyUpdate(action?: () => void): CommandFunction {
    return ({ tr, dispatch }) => {
      if (dispatch) {
        action?.();
        dispatch(tr);
      }

      return true;
    };
  }

  /**
   * Force an update of the specific updatable ProseMirror props.
   *
   * This command is always available as a builtin command.
   *
   * @category Builtin Command
   */
  @command()
  forceUpdate(...keys: UpdatableViewProps[]): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(this.forceUpdateTransaction(tr, ...keys));

      return true;
    };
  }

  /**
   * Update the attributes for the node at the specified `pos` in the
   * editor.
   *
   * @category Builtin Command
   */
  @command()
  updateNodeAttributes<Type extends object>(
    pos: number,
    attrs: ProsemirrorAttributes<Type>,
  ): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.setNodeMarkup(pos, undefined, attrs));

      return true;
    };
  }

  /**
   * Set the content of the editor while preserving history.
   *
   * Under the hood this is replacing the content in the document with the new
   * state.doc of the provided content.
   *
   * If the content is a string you will need to ensure you have the proper
   * string handler set up in the editor.
   */
  @command()
  setContent(content: RemirrorContentType, selection?: PrimitiveSelection): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
      const state = this.store.manager.createState({ content, selection });

      if (!state) {
        return false;
      }

      dispatch?.(tr.replaceRangeWith(0, tr.doc.nodeSize - 2, state.doc));
      return true;
    };
  }

  /**
   * Reset the content of the editor while preserving the history.
   *
   * This means that undo and redo will still be active since the doc is replaced with a new doc.
   */
  @command()
  resetContent(): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
      const doc = this.store.manager.createEmptyDoc();

      if (doc) {
        return this.setContent(doc)(props);
      }

      dispatch?.(tr.delete(0, tr.doc.nodeSize));
      return true;
    };
  }

  /**
   * Fire an update to remove the current range selection. The cursor will
   * be placed at the anchor of the current range selection.
   *
   * A range selection is a non-empty text selection.
   *
   * @category Builtin Command
   */
  @command()
  emptySelection(): CommandFunction {
    return ({ tr, dispatch }) => {
      if (tr.selection.empty) {
        return false;
      }

      dispatch?.(tr.setSelection(TextSelection.create(tr.doc, tr.selection.anchor)));
      return true;
    };
  }

  /**
   * Insert a new line into the editor.
   *
   * Depending on editor setup and where the cursor is placed this may have
   * differing impacts.
   *
   * @category Builtin Command
   */
  @command()
  insertNewLine(): CommandFunction {
    return ({ dispatch, tr }) => {
      if (!isTextSelection(tr.selection)) {
        return false;
      }

      dispatch?.(tr.insertText('\n'));

      return true;
    };
  }

  /**
   * Insert a node into the editor with the provided content.
   *
   * @category Builtin Command
   */
  @command()
  insertNode(
    node: string | NodeType | ProsemirrorNode | Fragment,
    options: InsertNodeOptions = {},
  ): CommandFunction {
    return ({ dispatch, tr, state }) => {
      const { attrs, range, selection, replaceEmptyParentBlock = false } = options;
      const { from, to, $from } = getTextSelection(selection ?? range ?? tr.selection, tr.doc);

      if (isProsemirrorNode(node) || isProsemirrorFragment(node)) {
        const pos = $from.before($from.depth);
        dispatch?.(
          replaceEmptyParentBlock && from === to && isEmptyBlockNode($from.parent)
            ? tr.replaceWith(pos, pos + $from.parent.nodeSize, node)
            : tr.replaceWith(from, to, node),
        );

        return true;
      }

      const nodeType = isString(node) ? state.schema.nodes[node] : node;

      invariant(nodeType, {
        code: ErrorConstant.SCHEMA,
        message: `The requested node type ${node} does not exist in the schema.`,
      });

      const marks: Mark[] | undefined = options.marks?.map((mark) => {
        if (mark instanceof Mark) {
          return mark;
        }

        const markType = isString(mark) ? state.schema.marks[mark] : mark;
        invariant(markType, {
          code: ErrorConstant.SCHEMA,
          message: `The requested mark type ${mark} does not exist in the schema.`,
        });

        return markType.create();
      });

      const content = nodeType.createAndFill(
        attrs,
        isString(options.content) ? state.schema.text(options.content) : options.content,
        marks,
      );

      if (!content) {
        return false;
      }

      // This should not be treated as a replacement.
      const isReplacement = from !== to;
      dispatch?.(isReplacement ? tr.replaceRangeWith(from, to, content) : tr.insert(from, content));
      return true;
    };
  }

  /**
   * Set the focus for the editor.
   *
   * If using this with chaining this should only be placed at the end of
   * the chain. It can cause hard to debug issues when used in the middle of
   * a chain.
   *
   * ```tsx
   * import { useCallback } from 'react';
   * import { useRemirrorContext } from '@remirror/react';
   *
   * const MenuButton = () => {
   *   const { chain } = useRemirrorContext();
   *   const onClick = useCallback(() => {
   *     chain
   *       .toggleBold()
   *       .focus('end')
   *       .run();
   *   }, [chain])
   *
   *   return <button onClick={onClick}>Bold</button>
   * }
   * ```
   */
  @command()
  focus(position?: FocusType): CommandFunction {
    return (props) => {
      const { dispatch, tr } = props;
      const { view } = this.store;

      if (position === false) {
        return false;
      }

      if (view.hasFocus() && (position === undefined || position === true)) {
        return false;
      }

      // Keep the current selection when position is `true` or `undefined`.
      if (position === undefined || position === true) {
        const { from = 0, to = from } = tr.selection;
        position = { from, to };
      }

      if (dispatch) {
        // Focus only when dispatch is provided.
        this.delayedFocus();
      }

      return this.selectText(position)(props);
    };
  }

  /**
   * Blur focus from the editor and also update the selection at the same
   * time.
   */
  @command()
  blur(position?: PrimitiveSelection): CommandFunction {
    return (props) => {
      const { view } = this.store;

      if (!view.hasFocus()) {
        return false;
      }

      requestAnimationFrame(() => {
        (view.dom as HTMLElement).blur();
      });

      return position ? this.selectText(position)(props) : true;
    };
  }

  /**
   * Set the block type of the current selection or the provided range.
   *
   * @param nodeType - the node type to create
   * @param attrs - the attributes to add to the node type
   * @param selection - the position in the document to set the block node
   * @param preserveAttrs - when true preserve the attributes at the provided selection
   */
  @command()
  setBlockNodeType(
    nodeType: string | NodeType,
    attrs?: ProsemirrorAttributes,
    selection?: PrimitiveSelection,
    preserveAttrs = true,
  ): CommandFunction {
    return setBlockType(nodeType, attrs, selection, preserveAttrs);
  }

  /**
   * Toggle between wrapping an inactive node with the provided node type, and
   * lifting it up into it's parent.
   *
   * @param nodeType - the node type to toggle
   * @param attrs - the attrs to use for the node
   * @param selection - the selection point in the editor to perform the action
   */
  @command()
  toggleWrappingNode(
    nodeType: string | NodeType,
    attrs?: ProsemirrorAttributes,
    selection?: PrimitiveSelection,
  ): CommandFunction {
    return toggleWrap(nodeType, attrs, selection);
  }

  /**
   * Toggle a block between the provided type and toggleType.
   */
  @command()
  toggleBlockNodeItem(toggleProps: ToggleBlockItemProps): CommandFunction {
    return toggleBlockItem(toggleProps);
  }

  /**
   * Wrap the selection or the provided text in a node of the given type with the
   * given attributes.
   */
  @command()
  wrapInNode(
    nodeType: string | NodeType,
    attrs?: ProsemirrorAttributes,
    range?: FromToProps | undefined,
  ): CommandFunction {
    return wrapIn(nodeType, attrs, range);
  }

  /**
   * Removes a mark from the current selection or provided range.
   */
  @command()
  applyMark(
    markType: string | MarkType,
    attrs?: ProsemirrorAttributes,
    selection?: PrimitiveSelection,
  ): CommandFunction {
    return applyMark(markType, attrs, selection);
  }

  /**
   * Removes a mark from the current selection or provided range.
   */
  @command()
  toggleMark(props: ToggleMarkProps): CommandFunction {
    return toggleMark(props);
  }

  /**
   * Removes a mark from the current selection or provided range.
   */
  @command()
  removeMark(props: RemoveMarkProps): CommandFunction {
    return removeMark(props);
  }

  /**
   * Set the meta data to attach to the editor on the next update.
   */
  @command()
  setMeta(name: string, value: unknown): CommandFunction {
    return ({ tr }) => {
      tr.setMeta(name, value);
      return true;
    };
  }

  /**
   * Select all text in the editor.
   */
  @command({
    description: ({ t }) => t(Messages.SELECT_ALL_DESCRIPTION),
    label: ({ t }) => t(Messages.SELECT_ALL_LABEL),
    shortcut: NamedShortcut.SelectAll,
  })
  selectAll(): CommandFunction {
    return this.selectText('all');
  }

  /**
   * Copy the selected content for non empty selections.
   */
  @command({
    description: ({ t }) => t(Messages.COPY_DESCRIPTION),
    label: ({ t }) => t(Messages.COPY_LABEL),
    shortcut: NamedShortcut.Copy,
    icon: 'fileCopyLine',
  })
  copy(): CommandFunction {
    return (props) => {
      if (props.tr.selection.empty) {
        return false;
      }

      if (props.dispatch) {
        document.execCommand('copy');
      }

      return true;
    };
  }

  /**
   * Select all text in the editor.
   */
  @command({
    description: ({ t }) => t(Messages.PASTE_DESCRIPTION),
    label: ({ t }) => t(Messages.PASTE_LABEL),
    shortcut: NamedShortcut.Paste,
    icon: 'clipboardLine',
  })
  paste(): CommandFunction {
    // Todo check if the permissions are supported first.
    // navigator.permissions.query({name: 'clipboard'})

    return this.store
      .createPlaceholderCommand({
        // TODO https://caniuse.com/?search=clipboard.read - once browser support is sufficient.
        promise: () => navigator.clipboard.readText(),
        placeholder: { type: 'inline' },
        onSuccess: (value, selection, props) => {
          return this.insertNode(
            htmlToProsemirrorNode({ content: value, schema: props.state.schema }),
            { selection },
          )(props);
        },
      })
      .generateCommand();
  }

  /**
   * Cut the selected content.
   */
  @command({
    description: ({ t }) => t(Messages.CUT_DESCRIPTION),
    label: ({ t }) => t(Messages.CUT_LABEL),
    shortcut: NamedShortcut.Cut,
    icon: 'scissorsFill',
  })
  cut(): CommandFunction {
    return (props) => {
      if (props.tr.selection.empty) {
        return false;
      }

      if (props.dispatch) {
        document.execCommand('cut');
      }

      return true;
    };
  }

  /**
   * Replaces text with an optional appended string at the end. The replacement
   * can be text, or a custom node.
   *
   * @param props - see [[`ReplaceTextProps`]]
   */
  @command()
  replaceText(props: ReplaceTextProps): CommandFunction {
    return replaceText(props);
  }

  /**
   * Get the all the decorated commands available on the editor instance.
   */
  @helper()
  getAllCommandOptions(): Helper<Record<string, WithName<CommandDecoratorOptions>>> {
    const uiCommands: Record<string, WithName<CommandDecoratorOptions>> = {};

    for (const [name, options] of this.decorated) {
      if (isEmptyObject(options)) {
        continue;
      }

      uiCommands[name] = options;
    }

    return uiCommands;
  }

  /**
   * Get the options that were passed into the provided command.
   */
  @helper()
  getCommandOptions(name: string): Helper<WithName<CommandDecoratorOptions> | undefined> {
    return this.decorated.get(name);
  }

  /**
   * A short hand way of getting the `view`, `state`, `tr` and `dispatch`
   * methods.
   */
  @helper()
  getCommandProp(): Helper<Required<CommandFunctionProps>> {
    return {
      tr: this.transaction,
      dispatch: this.store.view.dispatch,
      state: this.store.view.state,
      view: this.store.view,
    };
  }

  /**
   * Update the command options via a shallow merge of the provided options. If
   * no options are provided the entry is deleted.
   *
   * @internal
   */
  updateDecorated(name: string, options?: Partial<WithName<CommandDecoratorOptions>>): void {
    if (!options) {
      this.decorated.delete(name);
      return;
    }

    const decoratorOptions = this.decorated.get(name) ?? { name: '' };
    this.decorated.set(name, { ...decoratorOptions, ...options });
  }

  /**
   * Needed on iOS since `requestAnimationFrame` doesn't breaks the focus
   * implementation.
   */
  private handleIosFocus(): void {
    if (!environment.isIos) {
      return;
    }

    (this.store.view.dom as HTMLElement).focus();
  }

  /**
   * Focus the editor after a slight delay.
   */
  private delayedFocus(): void {
    // Manage focus on iOS.
    this.handleIosFocus();

    requestAnimationFrame(() => {
      // Use the built in focus method to refocus the editor.
      this.store.view.focus();

      // This has to be called again in order for Safari to scroll into view
      // after the focus. Perhaps there's a better way though or maybe place
      // behind a flag.
      this.store.view.dispatch(this.transaction.scrollIntoView());
    });
  }

  /**
   * A helper for forcing through updates in the view layer. The view layer can
   * check for the meta data of the transaction with
   * `manager.store.getForcedUpdate(tr)`. If that has a value then it should use
   * the unique symbol to update the key.
   */
  private readonly forceUpdateTransaction = (
    tr: Transaction,
    ...keys: UpdatableViewProps[]
  ): Transaction => {
    const { forcedUpdates } = this.getCommandMeta(tr);

    this.setCommandMeta(tr, { forcedUpdates: uniqueArray([...forcedUpdates, ...keys]) });
    return tr;
  };

  /**
   * Check for a forced update in the transaction. This pulls the meta data
   * from the transaction and if it is true then it was a forced update.
   *
   * ```ts
   * import { CommandsExtension } from 'remirror/extensions';
   *
   * const commandsExtension = manager.getExtension(CommandsExtension);
   * log(commandsExtension.getForcedUpdates(tr))
   * ```
   *
   * This can be used for updating:
   *
   * - `nodeViews`
   * - `editable` status of the editor
   * - `attributes` - for the top level node
   *
   * @internal
   */
  private getForcedUpdates(tr: Transaction): ForcedUpdateMeta {
    return this.getCommandMeta(tr).forcedUpdates;
  }

  /**
   * Get the command metadata.
   */
  private getCommandMeta(tr: Transaction): Required<CommandExtensionMeta> {
    const meta = tr.getMeta(this.pluginKey) ?? {};
    return { ...DEFAULT_COMMAND_META, ...meta };
  }

  private setCommandMeta(tr: Transaction, update: CommandExtensionMeta) {
    const meta = this.getCommandMeta(tr);
    tr.setMeta(this.pluginKey, { ...meta, ...update });
  }

  /**
   * Add the commands from the provided `commands` property to the `chained`,
   * `original` and `unchained` objects.
   */
  private addCommands(props: AddCommandsProps) {
    const { extensionCommands, commands, names, active } = props;

    for (const [name, command] of entries(extensionCommands)) {
      // Command names must be unique.
      throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_COMMAND_NAMES });

      // Make sure the command name is not forbidden.
      invariant(!forbiddenNames.has(name), {
        code: ErrorConstant.DUPLICATE_COMMAND_NAMES,
        message: 'The command name you chose is forbidden.',
      });

      // Create the unchained command.
      commands[name] = this.createUnchainedCommand(command, active[name]);
    }
  }

  /**
   * Create an unchained command method.
   */
  private unchainedFactory(props: UnchainedFactoryProps) {
    return (...args: unknown[]) => {
      const { shouldDispatch = true, command } = props;
      const { view } = this.store;
      const { state } = view;

      let dispatch: DispatchFunction | undefined;

      if (shouldDispatch) {
        dispatch = view.dispatch;
      }

      return command(...args)({ state, dispatch, view, tr: this.transaction });
    };
  }

  /**
   * Create the unchained command.
   */
  private createUnchainedCommand(
    command: ExtensionCommandFunction,
    active: (() => boolean) | undefined,
  ): CommandShape {
    const unchainedCommand: CommandShape = this.unchainedFactory({ command }) as any;
    unchainedCommand.enabled = this.unchainedFactory({ command, shouldDispatch: false });
    unchainedCommand.isEnabled = unchainedCommand.enabled;
    unchainedCommand.original = command;
    unchainedCommand.active = active;

    return unchainedCommand;
  }

  /**
   * Create a chained command method.
   */
  private chainedFactory(props: ChainedFactoryProps) {
    return (...args: unknown[]) => {
      const { chain: chained, command, getTr, getChain } = props;
      const lazyChain = getChain();
      const { view } = this.store;
      const { state } = view;

      lazyChain.push((dispatch?: DispatchFunction) => {
        return command(...args)({ state, dispatch, view, tr: getTr() });
      });

      return chained;
    };
  }
}

export interface InsertNodeOptions {
  attrs?: ProsemirrorAttributes;
  marks?: Array<Mark | string | MarkType>;

  /**
   * The content to insert.
   */
  content?: Fragment | ProsemirrorNode | ProsemirrorNode[] | string;

  /**
   * @deprecated use selection property instead.
   */
  range?: FromToProps;

  /**
   * Set the selection where the command should occur.
   */
  selection?: PrimitiveSelection;

  /**
   * Set this to true to replace an empty parent block with this content (if the
   * content is a block node).
   */
  replaceEmptyParentBlock?: boolean;
}

const DEFAULT_COMMAND_META: Required<CommandExtensionMeta> = {
  forcedUpdates: [],
};

/**
 * Provides the list of Prosemirror EditorView props that should be updated/
 */
export type ForcedUpdateMeta = UpdatableViewProps[];
export type UpdatableViewProps = 'attributes' | 'editable';

export interface CommandExtensionMeta {
  forcedUpdates?: UpdatableViewProps[];
}

interface AddCommandsProps {
  /**
   * Some commands can declare that they are active.
   */
  active: Record<string, () => boolean>;

  /**
   * The currently amassed commands (unchained) to mutate for each extension.
   */
  commands: Record<string, CommandShape>;

  /**
   * The untransformed commands which need to be added to the extension.
   */
  extensionCommands: ExtensionCommandReturn;

  /**
   * The names of the commands amassed. This allows for a uniqueness test.
   */
  names: Set<string>;
}

interface UnchainedFactoryProps {
  /**
   * All the commands.
   */
  command: ExtensionCommandFunction;

  /**
   * When false the dispatch is not provided (making this an `isEnabled` check).
   *
   * @default true
   */
  shouldDispatch?: boolean;
}

/**
 * A type with a name property.
 */
type WithName<Type> = Type & { name: string };

interface ChainedFactoryProps {
  /**
   * All the commands.
   */
  command: ExtensionCommandFunction;

  /**
   * All the chained commands
   */
  chain: Record<string, any>;

  /**
   * A custom transaction getter to apply to all the commands in the chain.
   */
  getTr: () => Transaction;

  /**
   * Get the list of lazy commands.
   */
  getChain: () => Array<(dispatch?: DispatchFunction) => boolean>;
}

/**
 * The names that are forbidden from being used as a command name.
 */
const forbiddenNames = new Set(['run', 'chain', 'original', 'raw', 'enabled', 'tr']);

declare global {
  namespace Remirror {
    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * Get the forced updates from the provided transaction.
       */
      getForcedUpdates: (tr: Transaction) => ForcedUpdateMeta;

      /**
       * Enables the use of custom commands created by extensions which extend
       * the functionality of your editor in an expressive way.
       *
       * @remarks
       *
       * Commands are synchronous and immediately dispatched. This means that
       * they can be used to create menu items when the functionality you need
       * is already available by the commands.
       *
       * ```ts
       * if (commands.toggleBold.isEnabled()) {
       *   commands.toggleBold();
       * }
       * ```
       */
      commands: CommandsFromExtensions<Extension>;

      /**
       * Chainable commands for composing functionality together in quaint and
       * beautiful ways
       *
       * @remarks
       *
       * You can use this property to create expressive and complex commands
       * that build up the transaction until it can be run.
       *
       * The way chainable commands work is by adding multiple steps to a shared
       * transaction which is then dispatched when the `run` command is called.
       * This requires making sure that commands within your code use the `tr`
       * that is provided rather than the `state.tr` property. `state.tr`
       * creates a new transaction which is not shared by the other steps in a
       * chainable command.
       *
       * The aim is to make as many commands as possible chainable as explained
       * [here](https://github.com/remirror/remirror/issues/418#issuecomment-666922209).
       *
       * There are certain commands that can't be made chainable.
       *
       * - undo
       * - redo
       *
       * ```ts
       * chain
       *   .toggleBold()
       *   .insertText('Hi')
       *   .setSelection('all')
       *   .run();
       * ```
       *
       * The `run()` method ends the chain and dispatches the command.
       */
      chain: ChainedFromExtensions<Extension>;
    }

    interface BaseExtension {
      /**
       * `ExtensionCommands`
       *
       * This pseudo property makes it easier to infer Generic types of this
       * class.
       *
       * @internal
       */
      ['~C']: this['createCommands'] extends AnyFunction
        ? ReturnType<this['createCommands']>
        : EmptyShape;

      /**
       * @experimental
       *
       * Stores all the command names for this decoration that have been added
       * as decorators to the extension instance. This is used by the
       * `CommandsExtension` to pick the commands and store meta data attached
       * to each command.
       *
       * @internal
       */
      decoratedCommands?: Record<string, CommandDecoratorOptions>;

      /**
       * Create and register commands for that can be called within the editor.
       *
       * These are typically used to create menu's actions and as a direct
       * response to user actions.
       *
       * @remarks
       *
       * The `createCommands` method should return an object with each key being
       * unique within the editor. To ensure that this is the case it is
       * recommended that the keys of the command are namespaced with the name
       * of the extension.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands() {
       *     return {
       *       haveFun() {
       *         return ({ state, dispatch }) => {
       *           if (dispatch) {
       *             dispatch(tr.insertText('Have fun!'));
       *           }
       *
       *           return true; // True return signifies that this command is enabled.
       *         }
       *       },
       *     }
       *   }
       * })
       * ```
       *
       * The actions available in this case would be `undoHistory` and
       * `redoHistory`. It is unlikely that any other extension would override
       * these commands.
       *
       * Another benefit of commands is that they are picked up by typescript
       * and can provide code completion for consumers of the extension.
       */
      createCommands?(): ExtensionCommandReturn;
    }

    interface ExtensionStore {
      /**
       * A property containing all the available commands in the editor.
       *
       * This should only be accessed after the `onView` lifecycle method
       * otherwise it will throw an error. If you want to use it in the
       * `createCommands` function then make sure it is used within the returned
       * function scope and not in the outer scope.
       */
      commands: CommandsFromExtensions<Extensions | (AnyExtension & { _T: false })>;

      /**
       * A method that returns an object with all the chainable commands
       * available to be run.
       *
       * @remarks
       *
       * Each chainable command mutates the states transaction so after running
       * all your commands. you should dispatch the desired transaction.
       *
       * This should only be called when the view has been initialized (i.e.)
       * within the `createCommands` method calls.
       *
       * ```ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyExtension = ExtensionFactory.plain({
       *   name: 'myExtension',
       *   version: '1.0.0',
       *   createCommands: () => {
       *     // This will throw since it can only be called within the returned
       *     methods.
       *     const chain = this.store.chain; // ❌
       *
       *     return {
       *       // This is good 😋
       *       haveFun() {
       *         return ({ state, dispatch }) =>
       *         this.store.chain.insertText('fun!').run(); ✅
       *       },
       *     }
       *   }
       * })
       * ```
       *
       * This should only be accessed after the `EditorView` has been fully
       * attached to the `RemirrorManager`.
       *
       * The chain can also be called as a function with a custom `tr`
       * parameter. This allows you to provide a custom transaction to use
       * within the chainable commands.
       *
       * Use the command at the beginning of the command chain to override the
       * shared transaction.
       *
       * There are times when you want to be sure of the transaction which is
       * being updated.
       *
       * To restore the previous transaction call the `restore` chained method.
       *
       * @param tr - the transaction to set
       */
      chain: ChainedFromExtensions<Extensions | (AnyExtension & { _T: false })>;
    }

    interface AllExtensions {
      commands: CommandsExtension;
    }

    /**
     * The command names for all core extensions.
     */
    type AllCommandNames = LiteralUnion<CommandNames<Remirror.Extensions>, string>;

    /**
     * The command names for all core extensions.
     */
    type AllUiCommandNames = LiteralUnion<UiCommandNames<Remirror.Extensions>, string>;
  }
}
