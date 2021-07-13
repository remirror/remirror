import type {
  AnyExtension,
  AttributesProps,
  EditorSchema,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import type { DomFrameworkProps } from '@remirror/dom';
import type { CreateCoreManagerOptions } from '@remirror/preset-core';

export interface BaseFactoryProps<Schema extends EditorSchema = EditorSchema>
  extends Partial<AttributesProps> {
  /**
   * The name of the node or mark
   */
  name: string;

  /**
   * The editor schema
   */
  schema: Schema;
}

/**
 * A useful feature of the builder is being able to declaratively mark positions
 * in content using the angled braces e.g. `<cursor>`.
 *
 * These positions are called tags, and are tracked on every node in the tree that has a tag on any of its descendants.
 */
export interface Tags {
  [name: string]: number;
}

/**
 * Content that contains tagged information.
 */
export type TaggedContentItem = TaggedProsemirrorNode | TagTracker;

/**
 * The data structures of the tagged content
 */
export type TaggedContent = TaggedContentItem | Array<ProsemirrorNode | TaggedContentItem>;

/**
 * Tagged content with text as well
 */
export type TaggedContentWithText = string | TaggedContent;

/**
 * ProseMirror doesn't support empty text nodes, making it difficult to
 * capture a tagged position without introducing text.
 *
 * E.g.:
 *
 *     p('<cursor>')
 *     p('Hello ', '<cursor>', 'world!')
 *
 * After the tagged syntax is stripped we're left with:
 *
 *     p('')
 *     p('Hello ', '', 'world!')
 *
 * This violates the rule of text nodes being non-empty. This class solves the
 * problem by providing an alternative data structure that *only* stores tags,
 * and can be used in scenarios where an empty text would be forbidden.
 *
 * This is done under the hood when using `text()` factory, and instead of
 * always returning a text node, it'll instead return one of two things:
 *
 * - a text node -- when given a non-empty string
 * - a tag tracker -- when given a string that *only* contains tags.
 */
export class TagTracker {
  tags!: Tags;
}

/**
 * A standard ProseMirror Node that also tracks tags.
 */
export interface TaggedProsemirrorNode<Schema extends EditorSchema = EditorSchema>
  extends ProsemirrorNode<Schema> {
  tags: Tags;
}

export type MarkWithAttributes<Names extends string> = {
  [P in Names]: (
    attrs?: ProsemirrorAttributes,
  ) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithAttributes<Names extends string> = {
  [P in Names]: (
    attrs?: ProsemirrorAttributes,
  ) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export type MarkWithoutAttributes<Names extends string> = {
  [P in Names]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithoutAttributes<Names extends string> = {
  [P in Names]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export interface RenderEditorProps<Extension extends AnyExtension>
  extends CreateCoreManagerOptions {
  props?: Partial<Omit<DomFrameworkProps<Extension>, 'manager'>>;

  /**
   * Whether to automatically cleanup the dom once the test finishes.
   *
   * @default true
   */
  autoClean?: boolean;
}
