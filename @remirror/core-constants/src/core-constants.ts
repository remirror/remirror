/**
 * The editor class name
 */
export const EDITOR_CLASS_NAME = 'remirror-editor' as const;

/**
 * The editor class selector
 */
export const EDITOR_CLASS_SELECTOR = `.${EDITOR_CLASS_NAME}`;

/**
 * The css class added to a node that is selected.
 */
export const SELECTED_NODE_CLASS_NAME = 'ProseMirror-selectednode';

/**
 * The css selector for a selected node.
 */
export const SELECTED_NODE_CLASS_SELECTOR = `.${SELECTED_NODE_CLASS_NAME}`;

/**
 * Explanation from `@atlaskit` ProseMirror uses the Unicode Character 'OBJECT
 * REPLACEMENT CHARACTER' (U+FFFC) as text representation for leaf nodes, i.e.
 * nodes that don't have any content or text property (e.g. hardBreak, emoji,
 * mention, rule) It was introduced because of
 * https://github.com/ProseMirror/prosemirror/issues/262 This can be used in an
 * input rule regex to be able to include or exclude such nodes.
 */
export const LEAF_NODE_REPLACING_CHARACTER = '\ufffc';

/**
 * The null character.
 *
 * See {@link https://stackoverflow.com/a/6380172}
 */
export const NULL_CHARACTER = '\0';

/**
 * A character useful for separating inline nodes.
 *
 * @remarks
 * Typically used in decorations as follows.
 *
 * ```ts
 * document.createTextNode(ZERO_WIDTH_SPACE_CHAR)
 * ```
 *
 * This produces the html entity '8203'
 */
export const ZERO_WIDTH_SPACE_CHAR = '\u200b';

/**
 * Used to determine the side where a gap-cursor is drawn
 */
export enum Side {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * A default empty object node. Useful for resetting the content of a
 * prosemirror document.
 */
export const EMPTY_PARAGRAPH_NODE = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

/**
 * The default extension priority level
 */
export const DEFAULT_EXTENSION_PRIORITY = 3;

/**
 * Marks are categorized into different groups. One motivation for this was to
 * allow the `code` mark to exclude other marks, without needing to explicitly
 * name them. Explicit naming requires the named mark to exist in the schema.
 * This is undesirable because we want to construct different schemas that have
 * different sets of nodes/marks.
 */
export enum MarkGroup {
  /**
   * Mark group for font styling (e.g. bold, italic, underline, superscript).
   */
  FontStyle = 'fontStyle',
  /**
   * Mark groups for links
   */
  Link = 'link',

  /**
   * Mark groups for colors (text-color, background-color, etc)
   */
  Color = 'color',

  /**
   * Mark group for alignment
   */
  Alignment = 'alignment',

  /**
   * Mark group for indentation
   */
  Indentation = 'indentation',

  /**
   * Marks which affect behavior
   */
  Behavior = 'behavior',

  /**
   * Marks which store code
   */
  Code = 'code',
}

export enum NodeGroup {
  /**
   * Whether this node is an inline node.
   *
   * @example
   *
   * `text` is an inline node, but `paragraph` is a block node.
   */
  Inline = 'inline',

  /**
   * Sets this as a block level node.
   */
  Block = 'block',
}

/**
 * Defines the type of the extension.
 */
export enum ExtensionType {
  /**
   * Identifies a NodeExtension.
   */
  Node = 'node',

  /**
   * Identifies a MarkExtension
   */
  Mark = 'mark',

  /**
   * Identifies a PlainExtension
   */
  Plain = 'plain',
}

/**
 * These are the default supported tag strings which help categorize different
 * behaviors that extensions can exhibit.
 *
 * @remarks
 *
 * Any extension can register itself with multiple such behaviors and these
 * categorizations can be used by other extensions when running commands and
 * updating the document.
 */
export enum Tag {
  /**
   * Describes a node that can be used as the last node of a document and by
   * extension doesn't need to render a node after itself.
   *
   * @remarks
   *
   * e.g. `paragraph`
   */
  LastNodeCompatible = 'lastNodeCompatible',

  /**
   * A mark that is used to change the formatting of the node it wraps.
   *
   * @remarks
   *
   * e.g. `bold`, `italic`
   */
  FormattingMark = 'formattingMark',

  /**
   * A node that is deemed to format in a non standard way.
   *
   * @remarks
   *
   * e.g. `codeBlock`, `heading`, `blockquote`
   */
  FormattingNode = 'formattingNode',

  /**
   * Identifies a node which has problems with cursor navigation.
   *
   * @remarks
   *
   * When this tag is added to an extension this will be picked up by
   * behavioural extensions such as the NodeCursorExtension which makes hard to
   * reach nodes navigable via the keyboard arrows.
   */
  NodeCursor = 'nodeCursor',
}

/**
 * The identifier key which is used to check objects for whether they are a
 * certain type.
 *
 * @remarks
 *
 * Please pretend you don't know this exists.
 *
 * @internal
 */
export const REMIRROR_IDENTIFIER_KEY = '__$$remirrorType$$__' as const;

/**
 * These constants are stored on the `REMIRROR_IDENTIFIER_KEY` property of
 * `remirror` related constructors and instances in order to identify them as
 * being internal to Remirror.
 *
 * @remarks
 *
 * This helps to prevent issues around check types via `instanceof` which can
 * lead to false negatives.
 *
 * @internal
 */
export enum RemirrorIdentifier {
  /**
   * The string used to identify an instance of the remirror extension.
   */
  Extension = 'RemirrorExtension',

  /**
   * Identifies `PlainExtensionConstructor`s.
   */
  PlainExtensionConstructor = 'RemirrorPlainExtensionConstructor',

  /**
   * Identifies `NodeExtensionConstructor`s.
   */
  NodeExtensionConstructor = 'RemirrorNodeExtensionConstructor',

  /**
   * Identifies `MarkExtensionConstructor`s.
   */
  MarkExtensionConstructor = 'RemirrorMarkExtensionConstructor',

  /**
   * The string used to identify an instance of the `ExtensionManager`
   */
  ExtensionManager = 'RemirrorExtensionManager',

  /**
   * The preset type identifier.
   */
  Preset = 'RemirrorPreset',
}

/**
 * The priority of extension which determines what order it is loaded into the
 * editor.
 *
 * @remarks
 *
 * Higher priority extension (lower number) will take precedence when there's a
 * class. For example if two extensions have the same name the higher priority
 * extension is the one that will be loaded.
 *
 * The lower the numeric value the higher the priority. The priority can also be
 * passed a number but naming things in this `enum` should help provide some
 * context to the numbers.
 */
export enum ExtensionPriority {
  /**
   * Use this **never**.
   */
  Critical = 0,

  /**
   * A very high priority.
   */
  Highest = 10,

  /**
   * The highest priority level that should be used in a publicly shared
   * extension (to allow some wiggle room for downstream users overriding
   * priorities).
   */
  High = 100,

  /**
   * A medium priority extension. This is typically all you need to take
   * priority over built in extensions.
   */
  Medium = 1000,

  /**
   * This is the **default** priority for all extension.
   */
  Low = 10000,

  /**
   * This is useful for extensions that exist to be overridden.
   */
  Lowest = 100000,
}
