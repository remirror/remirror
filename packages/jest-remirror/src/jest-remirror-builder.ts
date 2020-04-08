import { Fragment, Mark, Node as PMNode, Slice } from 'prosemirror-model';

import {
  EditorSchema,
  findMatches,
  flattenArray,
  hasOwnProperty,
  isInstanceOf,
  isProsemirrorNode,
  isString,
  object,
  SchemaParameter,
} from '@remirror/core';

import {
  BaseFactoryParameter,
  TaggedContent,
  TaggedContentItem,
  TaggedContentWithText,
  TaggedProsemirrorNode,
  Tags,
  TagTracker,
} from './jest-remirror-types';

/**
 * Checks if a value is odd
 *
 * @param n
 */
const isOdd = (n: number) => n % 2 === 1;

/**
 * Create a text node.
 *
 * Special markers called `tags` can be put in the text. Tags provide a way to
 * declaratively describe a position within some text, and then access the
 * position in the resulting node.
 *
 * @param value
 * @param schema
 */
export const text = (value: string, schema: EditorSchema): TaggedContentItem => {
  let stripped = '';
  let textIndex = 0;
  const tags: Tags = object();

  for (const match of findMatches(value, /(\\+)?<(\w+)>/g)) {
    const [taggedToken, escapeCharacters, tagName] = match;
    let { index } = match;

    const skipLength = escapeCharacters?.length;
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
    textIndex = match.index + taggedToken.length;
  }

  stripped += value.slice(textIndex);

  const node =
    stripped === '' ? new TagTracker() : (schema.text(stripped) as TaggedProsemirrorNode);

  node.tags = tags;
  return node;
};

/**
 * Offset tag position values by some amount.
 *
 * @param tags
 * @param offset
 */
export const offsetTags = (tags: Tags, offset: number): Tags => {
  const result: Tags = object();
  for (const name in tags) {
    if (hasOwnProperty(tags, name)) {
      result[name] = tags[name] + offset;
    }
  }
  return result;
};

/**
 * Check if the value is an instance of the TagTracker class which is used for holding a position in the node
 *
 * @param value
 */
const isTagTracker = isInstanceOf(TagTracker);

/**
 * Checks if the node is a TaggedProsemirrorNode (a normal ProsemirrorNode with a tag attribute)
 *
 * @param value
 */
const isTaggedProsemirrorNode = (value: unknown): value is TaggedProsemirrorNode =>
  isProsemirrorNode(value) && !isTagTracker(value);

/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated tags.
 *
 * @param [...content]
 */
export const sequence = (...content: TaggedContentItem[]) => {
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
};

interface CoerceParameter extends SchemaParameter {
  /**
   * Content that will be transformed into taggedNodes
   */
  content: TaggedContentWithText[];
}

/**
 * Coerce builder content into tagged nodes.
 *
 * Checks if the content item is a string and runs the text transformer otherwise passes
 * a flattened structure through to the `sequence` function
 *
 * @param content
 * @param schema
 */
export const coerce = ({ content, schema }: CoerceParameter) => {
  const taggedContent = content.map((item) =>
    isString(item) ? text(item, schema) : item,
  ) as Array<TaggedContentItem | TaggedContentItem[]>;
  return sequence(...flattenArray<TaggedContentItem>(taggedContent));
};

interface NodeFactoryParameter<GSchema extends EditorSchema = EditorSchema>
  extends BaseFactoryParameter<GSchema> {
  /**
   * The marks which wrap this node.
   */
  marks?: Mark[];
}

/**
 * Create a builder function for nodes.
 *
 * @param params
 * @param params.name
 * @param params.schema
 * @param params.attrs
 * @param params.marks
 */
export const nodeFactory = <GSchema extends EditorSchema = EditorSchema>({
  name,
  schema,
  attributes: attributes,
  marks,
}: NodeFactoryParameter<GSchema>) => {
  const nodeBuilder = hasOwnProperty(schema.nodes, name) ? schema.nodes[name] : undefined;
  if (!nodeBuilder) {
    throw new Error(
      `Node: "${name}" doesn't exist in schema. It's usually caused by lacking of the extension that contributes this node. Schema contains following nodes: ${Object.keys(
        schema.nodes,
      ).join(', ')}`,
    );
  }
  return (...content: TaggedContentWithText[]): TaggedProsemirrorNode => {
    const { nodes, tags } = coerce({ content, schema });
    const node = nodeBuilder.createChecked(attributes, nodes, marks) as TaggedProsemirrorNode;
    node.tags = tags;
    return node;
  };
};

interface MarkFactoryParameter extends BaseFactoryParameter {
  allowDupes?: boolean;
}

/**
 * Create a builder function for marks.
 *
 * @param params
 * @param params.name
 * @param params.schema
 * @param params.attrs
 * @param params.allowDupes
 */
export const markFactory = ({
  name,
  schema,
  attributes: attributes,
  allowDupes = false,
}: MarkFactoryParameter) => {
  const markBuilder = hasOwnProperty(schema.marks, name) ? schema.marks[name] : undefined;
  if (!markBuilder) {
    throw new Error(
      `Mark: "${name}" doesn't exist in schema. It's usually caused by lacking of the extension that contributes this mark. Schema contains following marks: ${Object.keys(
        schema.marks,
      ).join(', ')}`,
    );
  }

  return (...content: TaggedContentWithText[]): TaggedProsemirrorNode[] => {
    const mark = markBuilder.create(attributes);
    const { nodes } = coerce({ content, schema });
    return nodes.map((node) => {
      if (!allowDupes && mark.type.isInSet(node.marks)) {
        return node;
      } else {
        const taggedNode = node.mark(mark.addToSet(node.marks)) as TaggedProsemirrorNode;
        taggedNode.tags = node.tags;
        return taggedNode;
      }
    });
  };
};

/**
 * Flatten all passed content.
 *
 * @param [...content]
 */
export const fragment = (...content: TaggedContentWithText[]) =>
  flattenArray<TaggedContentWithText>(content);

export const slice = (schema: EditorSchema) => (...content: TaggedContentWithText[]) =>
  new Slice(Fragment.from(coerce({ content, schema }).nodes), 0, 0);

interface CleanParameter extends SchemaParameter {
  /**
   * The tagged content which will be replaced with a clean Prosemirror node
   */
  content: TaggedContent;
}

/**
 * Builds a 'clean' version of the nodes, without Tags or TagTrackers
 *
 * @param params
 * @param params.schema
 * @param params.content
 */
export const clean = ({ schema, content }: CleanParameter) => {
  const node = content;
  if (Array.isArray(node)) {
    return node.reduce((accumulator, next) => {
      if (isProsemirrorNode(next)) {
        accumulator.push(PMNode.fromJSON(schema, next.toJSON()));
      }
      return accumulator;
    }, [] as PMNode[]);
  }
  return isProsemirrorNode(node) ? PMNode.fromJSON(schema, node.toJSON()) : undefined;
};
