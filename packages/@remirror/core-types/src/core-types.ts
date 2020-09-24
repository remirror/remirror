import type {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import type {
  CommandFunction,
  CommandFunctionParameter,
  EditorSchema,
  EditorState,
  EditorView,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  Selection,
} from '@remirror/pm';
import type { MarkSpec, NodeSpec } from '@remirror/pm/model';
import type { Decoration, NodeView } from '@remirror/pm/view';

import type { Literal, ObjectMark, ProsemirrorAttributes } from './base-types';
import type { FromToParameter, MarkWithAttributes, NodeWithAttributes } from './parameter-builders';

/**
 * A JSON representation of the prosemirror Node.
 *
 * @remarks
 * This is used to represent the top level doc nodes content.
 */
export interface RemirrorJSON {
  type: string;
  marks?: Array<ObjectMark | string>;
  text?: string;
  content?: RemirrorJSON[];
  attrs?: Record<string, Literal>;
}

export interface StateJSON {
  [key: string]: unknown;
  doc: RemirrorJSON;
  selection: FromToParameter;
}

type GetAttributesFunction = (p: string[]) => ProsemirrorAttributes | undefined;

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
export type RemirrorContentType<Schema extends EditorSchema = EditorSchema> =
  | string
  | RemirrorJSON
  | ProsemirrorNode<Schema>
  | EditorState<Schema>;

export interface NextParameter<Schema extends EditorSchema = EditorSchema>
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
export type KeyBindingCommandFunction<Schema extends EditorSchema = EditorSchema> = CommandFunction<
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
export type KeyBindings<Schema extends EditorSchema = EditorSchema> = Partial<
  Record<
    'Enter' | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Esc' | 'Delete' | 'Backspace',
    KeyBindingCommandFunction<Schema>
  >
> &
  Record<string, KeyBindingCommandFunction<Schema>>;

export type ProsemirrorKeyBindings<Schema extends EditorSchema = EditorSchema> = Record<
  string,
  ProsemirrorCommandFunction<Schema>
>;

export interface DOMCompatibleAttributes {
  [attribute: string]: string | number | undefined;
}

type DOMOutputSpecPos1 = DOMOutputSpecPosX | DOMCompatibleAttributes;
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, DOMCompatibleAttributes, 0];

/**
 * Defines the return type of the toDOM methods for both Nodes and marks
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
  | [string, DOMCompatibleAttributes, 0?]
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
   * DOM/HTML (as used by [[`DOMSerializer.fromSchema`]].
   *
   * Should return a [[`DOMOutputSpec`]] that describes a DOM node, with an
   * optional number zero (“hole”) in it to indicate where the node's content
   * should be inserted.
   */
  toDOM?: (node: NodeWithAttributes) => DOMOutputSpec;
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
  toDOM?: (mark: MarkWithAttributes, inline: boolean) => DOMOutputSpec;
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
export type NodeViewMethod<View extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[],
) => View;

/**
 * The core shape of any remirror specific object.
 */
export interface RemirrorIdentifierShape {
  [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;
}

/**
 * A parameter for a non empty selection which defines the anchor (the non
 * movable part of the selection) and the head (the movable part of the
 * selection).
 */
export interface AnchorHeadParameter {
  /**
   * The non-movable part of the selection.
   */
  anchor: number;

  /**
   * The movable part of the selection.
   */
  head: number;
}

/**
 * The type of arguments acceptable for a selection.
 *
 * - Can be a selection
 * - A range of `{ from: number; to: number }`
 * - A single position with a `number`
 * - `'start' | 'end'`
 */
export type PrimitiveSelection =
  | Selection
  | FromToParameter
  | AnchorHeadParameter
  | number
  | 'start'
  | 'end'
  | 'all';
