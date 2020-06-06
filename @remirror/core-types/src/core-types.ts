import type {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { MarkSpec, NodeSpec } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';

import {
  EditorSchema,
  EditorState,
  EditorView,
  Mark,
  NodeView,
  ProsemirrorNode,
  Transaction,
} from './alias-types';
import { ObjectNode as RemirrorJSON, ProsemirrorAttributes, RegexTuple } from './base-types';
import {
  EditorStateParameter,
  EditorViewParameter,
  TransactionParameter,
} from './parameter-builders';

type GetAttributesFunction = (p: string[] | string) => ProsemirrorAttributes | undefined;

/**
 * A function which takes a regex match array (strings) or a single string match
 * and transforms it into an `Attributes` object.
 */
export type GetAttributes = ProsemirrorAttributes | GetAttributesFunction;

export interface GetAttributesParameter {
  /**
   * A helper function for setting receiving a match array / string and setting
   * the attributes for a node.
   */
  getAttributes: GetAttributes;
}

/**
 * Supported content for the remirror editor.
 *
 * @remarks
 *
 * Content can either be
 * - a string (which will be parsed by the stringHandler)
 * - JSON object matching Prosemirror expected shape
 * - A top level ProsemirrorNode
 *
 * @typeParam Schema - the underlying editor schema.
 */
export type RemirrorContentType<Schema extends EditorSchema = any> =
  | string
  | RemirrorJSON
  | ProsemirrorNode<Schema>
  | EditorState<Schema>;

/**
 * Utility type for matching the name of a node to via a string or function.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export type NodeMatch<Schema extends EditorSchema = any> =
  | string
  | ((name: string, node: ProsemirrorNode<Schema>) => boolean)
  | RegexTuple;

/**
 * Used to apply the Prosemirror transaction to the current {@link EditorState}.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export type DispatchFunction<Schema extends EditorSchema = any> = (tr: Transaction<Schema>) => void;

/**
 * This is the type signature for commands within the prosemirror editor.
 *
 * @remarks
 *
 * A command function takes an editor state and optionally a dispatch function
 * that it can use to dispatch a transaction. It should return a boolean that
 * indicates whether it could perform any action.
 *
 * When no dispatch callback is passed, the command should do a 'dry run',
 * determining whether it is applicable, but not actually performing any action.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export type ProsemirrorCommandFunction<Schema extends EditorSchema = any> = (
  state: EditorState<Schema>,
  dispatch: DispatchFunction<Schema> | undefined,
  view: EditorView<Schema> | undefined,
) => boolean;

/**
 * A command method for running commands in your editor.
 *
 * @typeParam Schema - the underlying editor schema.
 * @typeParam ExtraParameter - extra parameters to add to the command function.
 *
 * @remarks
 *
 * This groups all the prosemirror command arguments into a single parameter.
 *
 * tldr; When `dispatch=undefined` make sure the command function is **idempotent**.
 *
 * One thing to be aware of is that when creating a command function the
 * `tr` should only be updated when the `dispatch` method is available. This is
 * because by convention calling the command function with `dispatch=undefined`
 * is used to check if the function returns `true`, an indicator that it is
 * enabled, or returns `false` to indicate it is not enabled.
 *
 * If the transaction has been updated outside of the `dispatch=true` condition
 * then running the command again will result in multiple transaction updates
 * and unpredictable behavior.
 *
 * @see {@link ProsemirrorCommandFunction}
 */
export type CommandFunction<
  Schema extends EditorSchema = any,
  ExtraParameter extends object = object
> = (params: CommandFunctionParameter<Schema> & ExtraParameter) => boolean;

/**
 * Chained commands take a transaction and act on it before returning the
 * transaction.
 *
 * @remarks
 *
 * They allow for commands to be chained together before being used to update
 * the state and allow the composition of complex commands. They are
 * automatically created from `CommandFunction`'s by providing a fake dispatch
 * method to the command function which captures the updated `transaction` and
 * passes it onto the next chainable command.
 */
export type ChainedCommandFunction<Schema extends EditorSchema = any> = (
  transaction: TransactionParameter<Schema>,
) => void;

/**
 * A parameter builder interface for the remirror `CommandFunction`.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface CommandFunctionParameter<Schema extends EditorSchema = any>
  extends Partial<EditorViewParameter<Schema>>,
    EditorStateParameter<Schema> {
  /**
   * The dispatch function which causes the command to be performed.
   *
   * @remarks
   *
   * `dispatch` can be `undefined`. When no `dispatch` callback is provided the
   * command should perform a 'dry run', determining whether the command is
   * applicable (`return true`), but not actually performing the action.
   */
  dispatch?: DispatchFunction<Schema>;
}

export interface NextParameter<Schema extends EditorSchema = any>
  extends CommandFunctionParameter<Schema> {
  /**
   * A method to run the next (lower priority) command in the chain of
   * keybindings.
   *
   * @remarks
   *
   * This can be used to chain together keyboard commands between extensions.
   * It's possible that you will need to combine actions when a key is pressed
   * while still running the default action. This method allows for the
   * greater degree of control.
   *
   * By default, matching keyboard commands from the different extension are
   * chained together (in order of priority) until one returns `true`. Calling
   * `next` changes this default behaviour. The default keyboard chaining
   * stops and you are given full control of the keyboard command chain.
   */
  next: () => boolean;
}

/**
 * The command function passed to any of the keybindings.
 */
export type KeyBindingCommandFunction<Schema extends EditorSchema = any> = CommandFunction<
  Schema,
  NextParameter<Schema>
>;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a
 * editing actions).
 *
 * @typeParam Schema - the underlying editor schema.
 *
 * @remarks
 *
 * Each keyboard binding returns an object mapping the keys pressed to the
 * {@link KeyBindingCommandFunction}. By default the highest priority extension
 * will be run first. If it returns true, then nothing else will be run after.
 * If it returns `false` then the next (lower priority) extension defining the
 * same keybinding will be run.
 *
 * It is possible to combine the commands being run by using the `next`
 * parameter. When called it will run the keybinding command function for the
 * proceeding (lower priority) extension. The act of calling the `next` method
 * will prevent the default flow from executing.
 */
export type KeyBindings<Schema extends EditorSchema = EditorSchema> = Record<
  string,
  KeyBindingCommandFunction<Schema>
>;

export type ProsemirrorKeyBindings<Schema extends EditorSchema = EditorSchema> = Record<
  string,
  ProsemirrorCommandFunction<Schema>
>;

type DOMCompatible = string;

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, { [attr: string]: DOMCompatible }, 0];

/**
 * Defines the return type of the toDom methods for both Nodes and marks
 *
 * @remarks
 * This differs from the default Prosemirror type definition which seemed didn't
 * work at the time of writing.
 *
 * Additionally we don't want to support domNodes in the toDOM spec since this
 * will create problems once SSR is fully supported
 */
export type DOMOutputSpec =
  | string
  | [string, 0?]
  | [string, 0?]
  | [string, { [attr: string]: DOMCompatible }, 0?]
  | [
      string,
      DOMOutputSpecPos1?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
    ];

/**
 * The schema spec definition for a node extension
 */
export interface NodeExtensionSpec
  extends Pick<
    NodeSpec,
    | 'content'
    | 'marks'
    | 'group'
    | 'inline'
    | 'atom'
    | 'attrs'
    | 'selectable'
    | 'draggable'
    | 'code'
    | 'defining'
    | 'isolating'
    | 'parseDOM'
    | 'toDebugString'
  > {
  /**
   * Defines the default way a node of this type should be serialized to
   * DOM/HTML (as used by
   * [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
   *
   * Should return a {@link DOMOutputSpec} that describes a DOM node, with an
   * optional number zero (“hole”) in it to indicate where the node's content
   * should be inserted.
   */
  toDOM?: (node: ProsemirrorNode) => DOMOutputSpec;
}

/**
 * The schema spec definition for a mark extension
 */
export interface MarkExtensionSpec
  extends Pick<MarkSpec, 'attrs' | 'inclusive' | 'excludes' | 'group' | 'spanning' | 'parseDOM'> {
  /**
   * Defines the default way marks of this type should be serialized to
   * DOM/HTML.
   */
  toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec;
}

/**
 * The method signature used to call the Prosemirror `nodeViews`
 *
 * @param node - the node which uses this nodeView
 * @param view - the editor view used by this nodeView
 * @param getPos - a utility method to get the absolute cursor position of the
 * node.
 * @param decorations - a list of the decorations affecting this node view (in
 * case the node view needs to update it's presentation)
 */
export type NodeViewMethod<GNodeView extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[],
) => GNodeView;

/**
 * The core shape of any remirror specific object.
 */
export interface RemirrorIdentifierShape {
  [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;
}
