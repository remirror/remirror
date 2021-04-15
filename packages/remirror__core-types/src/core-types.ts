import type {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import type {
  CommandFunctionProps,
  EditorSchema,
  EditorState,
  EditorView,
  Mark,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  ResolvedPos,
  Selection,
} from '@remirror/pm';
import type { MarkSpec, NodeSpec } from '@remirror/pm/model';
import type { Decoration, NodeView } from '@remirror/pm/view';
import type { Literal, ObjectMark, ProsemirrorAttributes } from '@remirror/types';

import type { FromToProps, MarkWithAttributes, NodeWithAttributes } from './props-types';

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
  /**
   * This allows for plugin state to be stored, although this is not currently
   * used in remirror.
   */
  [key: string]: unknown;

  /**
   * The main `ProseMirror` doc.
   */
  doc: RemirrorJSON;

  /**
   * The current selection.
   */
  selection: FromToProps;
}

/**
 * The matches array. `matches[0]` is the full match.
 */
type GetAttributesFunction = (matches: string[]) => ProsemirrorAttributes | undefined;

/**
 * A function which takes a regex match array (strings) or a single string match
 * and transforms it into an `Attributes` object.
 */
export type GetAttributes = ProsemirrorAttributes | GetAttributesFunction;

export interface GetAttributesProps {
  /**
   * A helper function for setting the attributes for a transformation .
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
 * @template Schema - the underlying editor schema.
 */
export type RemirrorContentType<Schema extends EditorSchema = EditorSchema> =
  | string
  | RemirrorJSON
  | ProsemirrorNode<Schema>
  | EditorState<Schema>;

export interface KeyBindingProps<Schema extends EditorSchema = EditorSchema>
  extends CommandFunctionProps<Schema> {
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
export type KeyBindingCommandFunction<Schema extends EditorSchema = EditorSchema> = (
  params: KeyBindingProps<Schema>,
) => boolean;

/**
 * Some commonly used keybinding names to help with auto complete.
 */
export type KeyBindingNames =
  | 'Enter'
  | 'ArrowDown'
  | 'ArrowUp'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'PageUp'
  | 'PageDown'
  | 'Home'
  | 'End'
  | 'Escape'
  | 'Delete'
  | 'Backspace'
  | 'Tab'
  | 'Shift-Tab';

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a
 * editing actions).
 *
 * @template Schema - the underlying editor schema.
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
  Record<KeyBindingNames, KeyBindingCommandFunction<Schema>>
> &
  Record<string, KeyBindingCommandFunction<Schema>>;

export type ProsemirrorKeyBindings<Schema extends EditorSchema = EditorSchema> = Record<
  string,
  ProsemirrorCommandFunction<Schema>
>;

export interface DOMCompatibleAttributes {
  [attribute: string]: string | number | undefined;
}

/**
 * Defines the return type of the toDOM methods for both nodes and marks
 *
 * @remarks
 *
 * This differs from the default Prosemirror type definition which seemed didn't
 * work at the time of writing.
 *
 * Additionally we don't want to support domNodes in the toDOM spec since this
 * will create problems once SSR is fully supported
 *
 * DOMOutputSpec is a description of a DOM structure. Can be either a string,
 * which is interpreted as a text node, a DOM node (not supported by remirror),
 * which is interpreted as itself, a {dom: Node, contentDOM: ?Node} object (not
 * supported by remirror), or an array (DOMOutputSpecArray).
 *
 * An array (DOMOutputSpecArray) describes a DOM element. The first value in the
 * array should be a string—the name of the DOM element, optionally prefixed by
 * a namespace URL and a space. If the second element is plain object (DOMCompatibleAttributes),
 * it is interpreted as a set of attributes for the element. Any elements
 * after that (including the 2nd if it's not an attribute object) are
 * interpreted as children of the DOM elements, and must either be valid
 * DOMOutputSpec values, or the number zero.
 *
 * The number zero (pronounced “hole”) is used to indicate the place where a
 * node's child nodes should be inserted. If it occurs in an output spec, it
 * should be the only child element in its parent node.
 */
export type DOMOutputSpec = string | DOMOutputSpecArray;

type DOMOutputSpecArray =
  | [string, ...DOMOutputSpec[]]
  | [string, DOMCompatibleAttributes, ...DOMOutputSpec[]]
  | [string, 0]
  | [string, DOMCompatibleAttributes, 0];

/**
 * The schema spec definition for a node extension
 */
export interface NodeExtensionSpec
  extends Partial<
    Pick<
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
      | 'allowGapCursor'
    >
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

export type NodeSpecOverride = Pick<
  NodeSpec,
  | 'content'
  | 'marks'
  | 'group'
  | 'inline'
  | 'atom'
  | 'selectable'
  | 'draggable'
  | 'code'
  | 'defining'
  | 'isolating'
  | 'parseDOM'
>;

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

export type MarkSpecOverride = Pick<
  MarkSpec,
  'inclusive' | 'excludes' | 'group' | 'spanning' | 'parseDOM'
>;

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
export interface AnchorHeadProps {
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
 * - `'start' | 'end' | 'all'`
 * - { anchor: number, head: number }
 */
export type PrimitiveSelection =
  | Selection
  | FromToProps
  | AnchorHeadProps
  | number
  | ResolvedPos
  | 'start'
  | 'end'
  | 'all';

/**
 * A dynamic attributes creator. This is used to create attributes that are
 * dynamically set when a node is first added to the dom.
 */
export type DynamicAttributeCreator = (nodeOrMark: ProsemirrorNode | Mark) => string;

/**
 * The configuration object for adding extra attributes to the node or mark in
 * the editor schema.
 *
 * Please note that using this will alter the schema, so changes here can cause
 * breaking changes for users if not managed carefully.
 *
 * TODO #462 is being added to support migrations so that breaking changes can
 * be handled automatically.
 */
export interface SchemaAttributesObject {
  /**
   * The default value for the attribute being added, if set to `null` then the
   * initial value for any nodes is not required.
   *
   * If set to `undefined` then a value must be provided whenever a node or mark
   * that has this extra attribute is created. ProseMirror will throw if the
   * value isn't required. Make sure you know what you're doing before setting
   * it to undefined as it could cause unintended errors.
   *
   * This can also be a function which enables dynamically setting the attribute
   * based on the value returned.
   */
  default: string | null | DynamicAttributeCreator;

  /**
   * A function used to extract the attribute from the dom and must be applied
   * to the `parseDOM` method.
   *
   * If a string is set this will automatically call
   * `domNode.getAttribute('<name>')`.
   */
  parseDOM?: ((domNode: HTMLElement) => unknown) | string;

  /**
   * Takes the node attributes and applies them to the dom.
   *
   * This is called in the `toDOM` method.
   *
   * - If a string is set this will always be the constant value set in the dom.
   * - If a tuple with two items is set then the first `string` is the attribute
   *   to set in the dom and the second string is the value that will be stored.
   *
   * Return undefined from the function call to skip adding the attribute.
   */
  toDOM?:
    | string
    | [string, string?]
    | Record<string, string>
    | ((
        attrs: ProsemirrorAttributes,
        options: NodeMarkOptions,
      ) => string | [string, string?] | Record<string, string> | null | undefined);
}

export interface NodeMarkOptions {
  node?: ProsemirrorNode;
  mark?: Mark;
}

export interface ApplySchemaAttributes {
  /**
   * A function which returns the object of defaults. Since this is for extra
   * attributes a default must be provided.
   */
  defaults: () => Record<string, { default?: string | null }>;

  /**
   * Read a value from the dome and convert it into prosemirror attributes.
   */
  parse: (domNode: Node | string) => ProsemirrorAttributes;

  /**
   * Take the node attributes and create the object of string attributes for
   * storage on the dom node.
   */
  dom: (nodeOrMark: ProsemirrorNode | Mark) => Record<string, string>;
}

/**
 * A mapping of the attribute name to it's default, getter and setter. If the
 * value is set to a string then it will be resolved as the `default`.
 *
 * If it is set to a function then it will be a dynamic node or mark.
 */
export type SchemaAttributes = Record<
  string,
  SchemaAttributesObject | string | DynamicAttributeCreator
>;
