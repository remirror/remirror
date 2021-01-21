import {
  EditorSchema,
  findMatches,
  flattenArray,
  hasOwnProperty,
  invariant,
  isArray,
  isInstanceOf,
  isProsemirrorNode,
  isString,
  keys,
  object,
  SchemaProps,
} from '@remirror/core';
import { Fragment, Mark, Node as ProsemirrorNode, Slice } from '@remirror/pm/model';

import {
  BaseFactoryProps,
  TaggedContent,
  TaggedContentItem,
  TaggedContentWithText,
  TaggedProsemirrorNode,
  Tags,
  TagTracker,
} from './jest-remirror-types';

/**
 * Checks if a value is odd.
 */
function isOdd(n: number) {
  return n % 2 === 1;
}

/**
 * Create a text node.
 *
 * Special markers called `tags` can be put in the text. Tags provide a way to
 * declaratively describe a position within some text, and then access the
 * position in the resulting node.
 */
export function text(value: string, schema: EditorSchema): TaggedContentItem {
  // Find all the matching `tags` within the text.
  const matches = findMatches(value, /(\\+)?<(\w+)>/g);

  // This is where all the tags that are found will be stored.
  const tags: Tags = object();

  let stripped = '';
  let textIndex = 0;

  for (const match of matches) {
    const [taggedToken, escapeCharacters, tagName] = match;
    let { index } = match;

    const skipLength = escapeCharacters?.length;

    if (!(taggedToken && tagName)) {
      continue;
    }

    if (skipLength) {
      if (isOdd(skipLength)) {
        stripped += value.slice(textIndex, index + (skipLength - 1) / 2);
        stripped += value.slice(index + skipLength, index + taggedToken.length);
        textIndex = index + taggedToken.length;
        continue;
      }

      index += skipLength / 2;
    }

    stripped += value.slice(textIndex, index);
    tags[tagName] = stripped.length;
    textIndex = index + taggedToken.length;
  }

  stripped += value.slice(textIndex);

  const node =
    stripped === '' ? new TagTracker() : (schema.text(stripped) as TaggedProsemirrorNode);

  node.tags = tags;

  return node;
}

/**
 * Offset tag position values by some amount.
 */
export function offsetTags(tags: Tags, offset: number): Tags {
  const result: Tags = object();

  for (const [name, value] of Object.entries(tags)) {
    result[name] = value + offset;
  }

  return result;
}

/**
 * Check if the value is an instance of the TagTracker class which is used for
 * holding a position in the node
 *
 * @param value - the value to check
 */
const isTagTracker = isInstanceOf(TagTracker);

/**
 * Checks if the node is a TaggedProsemirrorNode (a normal ProsemirrorNode with
 * a tag attribute)
 *
 * @param value -  the value to test
 */
function isTaggedProsemirrorNode(value: unknown): value is TaggedProsemirrorNode {
  return isProsemirrorNode(value) && !isTagTracker(value);
}

interface SequenceReturn {
  nodes: TaggedProsemirrorNode[];
  tags: Tags;
}

/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated tags.
 *
 * @param content[] - the spread of tagged content
 */
export function sequence(...content: TaggedContentItem[]): SequenceReturn {
  let position = 0;
  let tags: Tags = object();
  const nodes: TaggedProsemirrorNode[] = [];

  for (const node of content) {
    if (isTagTracker(node)) {
      tags = { ...tags, ...offsetTags(node.tags, position) };
    }

    if (isTaggedProsemirrorNode(node)) {
      const thickness = node.isText ? 0 : 1;
      tags = { ...tags, ...offsetTags(node.tags, position + thickness) };
      position += node.nodeSize;
      nodes.push(node);
    }
  }

  return { nodes, tags };
}

interface CoerceProps extends SchemaProps {
  /**
   * Content that will be transformed into taggedNodes
   */
  content: TaggedContentWithText[];
}

/**
 * Coerce builder content into tagged nodes.
 *
 * Checks if the content item is a string and runs the text transformer
 * otherwise passes a flattened structure through to the `sequence` function
 */
export function coerce(props: CoerceProps): SequenceReturn {
  const { content, schema } = props;

  const taggedContent = content.map((item) =>
    isString(item) ? text(item, schema) : item,
  ) as Array<TaggedContentItem | TaggedContentItem[]>;

  return sequence(...flattenArray<TaggedContentItem>(taggedContent));
}

interface NodeFactoryProps<Schema extends EditorSchema = EditorSchema>
  extends BaseFactoryProps<Schema> {
  /**
   * The marks which wrap this node.
   */
  marks?: Mark[];
}

type NodeFactory = (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;

/**
 * Create a builder function for nodes.
 */
export function nodeFactory<Schema extends EditorSchema = EditorSchema>(
  props: NodeFactoryProps<Schema>,
): NodeFactory {
  const { name, schema, attrs, marks } = props;
  const nodeBuilder = hasOwnProperty(schema.nodes, name) ? schema.nodes[name] : undefined;

  invariant(nodeBuilder, {
    message: `Node: "${name}" doesn't exist in the schema. The current schema contains the following nodes: ${keys(
      schema.nodes,
    ).join(', ')}`,
  });

  return (...content: TaggedContentWithText[]): TaggedProsemirrorNode => {
    const { nodes, tags } = coerce({ content, schema });
    const node = nodeBuilder.createChecked(attrs, nodes, marks) as TaggedProsemirrorNode;
    node.tags = tags;
    return node;
  };
}

interface MarkFactoryProps extends BaseFactoryProps {
  allowDupes?: boolean;
}

type MarkFactory = (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];

/**
 * Create a builder for marks.
 */
export function markFactory(props: MarkFactoryProps): MarkFactory {
  const { name, schema, attrs, allowDupes = false } = props;
  const markBuilder = hasOwnProperty(schema.marks, name) ? schema.marks[name] : undefined;

  invariant(markBuilder, {
    message: `Mark: "${name}" doesn't exist in the schema. The current schema contains the following marks: ${keys(
      schema.marks,
    ).join(', ')}`,
  });

  return (...content: TaggedContentWithText[]): TaggedProsemirrorNode[] => {
    const mark = markBuilder.create(attrs);
    const { nodes } = coerce({ content, schema });

    return nodes.map((node) => {
      if (!allowDupes && mark.type.isInSet(node.marks)) {
        return node;
      }

      const taggedNode = node.mark(mark.addToSet(node.marks)) as TaggedProsemirrorNode;
      taggedNode.tags = node.tags;

      return taggedNode;
    });
  };
}

/**
 * Flattens all content.
 *
 * @param content[] - spread parameter for tagged content with text
 */
export function fragment(...content: TaggedContentWithText[]): TaggedContentWithText[] {
  return flattenArray<TaggedContentWithText>(content);
}

export function slice(schema: EditorSchema) {
  return (...content: TaggedContentWithText[]): Slice<EditorSchema> =>
    new Slice(Fragment.from(coerce({ content, schema }).nodes), 0, 0);
}

interface CleanProps extends SchemaProps {
  /**
   * The tagged content which will be replaced with a clean Prosemirror node
   */
  content: TaggedContent;
}

/**
 * Builds a 'clean' version of the nodes, without Tags or TagTrackers.
 */
export function clean(props: CleanProps): ProsemirrorNode[] | ProsemirrorNode | undefined {
  const { schema, content } = props;

  if (!isArray(content)) {
    return isProsemirrorNode(content)
      ? ProsemirrorNode.fromJSON(schema, content.toJSON())
      : undefined;
  }

  const nodes: ProsemirrorNode[] = [];

  for (const node of content) {
    if (!isProsemirrorNode(node)) {
      continue;
    }

    nodes.push(ProsemirrorNode.fromJSON(schema, node.toJSON()));
  }

  return nodes;
}
