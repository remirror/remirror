// Refractor languages
import refractor, { RefractorNode } from 'refractor/core';

import {
  bool,
  CommandFunction,
  DOMOutputSpec,
  EditorState,
  environment,
  findParentNodeOfType,
  flattenArray,
  FromToParameter,
  isEqual,
  isObject,
  isString,
  NodeType,
  NodeTypeParameter,
  NodeWithPosition,
  object,
  PosParameter,
  ProsemirrorAttributes,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
  TextParameter,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';
import { Decoration } from '@remirror/pm/view';

import { CodeBlockAttributes, CodeBlockProperties, FormattedContent } from './code-block-types';

export const dataAttribute = 'data-code-block-language';

interface ParsedRefractorNode extends TextParameter {
  /**
   * The classes that will wrap the node
   */
  classes: string[];
}

interface PositionedRefractorNode extends FromToParameter, ParsedRefractorNode {}

/**
 * Maps the refractor nodes into text and classes which will be used to create
 * our decoration.
 */
function parseRefractorNodes(
  refractorNodes: RefractorNode[],
  className: string[] = [],
): ParsedRefractorNode[][] {
  return refractorNodes.map((node) => {
    const classes = [
      ...className,
      ...(node.type === 'element' && node.options.className ? node.options.className : []),
    ];

    if (node.type === 'element') {
      return parseRefractorNodes(node.children, classes) as any;
    }

    return {
      text: node.value,
      classes,
    };
  });
}

interface CreateDecorationsParameter {
  defaultLanguage: string;

  /**
   * The list of codeBlocks and their positions which we would like to update.
   */
  blocks: NodeWithPosition[];

  /**
   * When a delete happens within the last valid decoration in a block it causes
   * the editor to jump. This skipLast should be set to true immediately after a
   * delete which then allows for createDecorations to skip updating the
   * decoration for the last refactor node, and hence preventing the jumpy bug.
   */
  skipLast: boolean;
}

/**
 * Retrieves positioned refractor nodes from the positionedNode
 *
 * @param nodeWithPosition - a node and position
 * @returns the positioned refractor nodes which are text, classes and a FromTo
 * interface
 */
function getPositionedRefractorNodes(parameter: NodeWithPosition) {
  const { node, pos } = parameter;
  const refractorNodes = refractor.highlight(
    node.textContent ?? '',
    node.attrs.language ?? 'markup',
  );
  const parsedRefractorNodes = parseRefractorNodes(refractorNodes);

  let startPos = pos + 1;

  function mapper(refractorNode: ParsedRefractorNode): PositionedRefractorNode {
    const from = startPos;
    const to = from + refractorNode.text.length;
    startPos = to;
    return {
      ...refractorNode,
      from,
      to,
    };
  }

  return flattenArray<ParsedRefractorNode>(parsedRefractorNodes).map(mapper);
}

/**
 * Creates a decoration set for the provided blocks
 */
export const createDecorations = ({
  blocks,
  skipLast,
}: CreateDecorationsParameter): Decoration[] => {
  const decorations: Decoration[] = [];

  for (const block of blocks) {
    const positionedRefractorNodes = getPositionedRefractorNodes(block);
    const lastBlockLength = skipLast
      ? positionedRefractorNodes.length - 1
      : positionedRefractorNodes.length;

    for (let index = 0; index < lastBlockLength; index++) {
      const positionedRefractorNode = positionedRefractorNodes[index];
      const decoration = Decoration.inline(
        positionedRefractorNode.from,
        positionedRefractorNode.to,
        {
          class: positionedRefractorNode.classes.join(' '),
        },
      );

      decorations.push(decoration);
    }
  }

  return decorations;
};

interface PosWithinRangeParameter extends PosParameter, FromToParameter {}

/**
 * Check if the position is within the range.
 */
export const posWithinRange = ({ from, to, pos }: PosWithinRangeParameter) =>
  from <= pos && to >= pos;

/**
 * Check whether the length of an array has changed
 */
export const lengthHasChanged = <GType>(previous: ArrayLike<GType>, next: ArrayLike<GType>) =>
  next.length !== previous.length;

export interface NodeInformation
  extends NodeTypeParameter,
    FromToParameter,
    ProsemirrorNodeParameter,
    PosParameter {}

/**
 * Retrieves helpful node information from the current state.
 */
export const getNodeInformationFromState = (state: EditorState): NodeInformation => {
  const { $head } = state.selection;
  const depth = $head.depth;
  const from = $head.start(depth);
  const to = $head.end(depth);
  const node = $head.parent;
  const type = node.type;
  const pos = depth > 0 ? $head.before(depth) : 0;
  return {
    from,
    to,
    type,
    node,
    pos,
  };
};

/**
 * Check that the attributes exist and are valid for the codeBlock
 * updateAttributes.
 */
export const isValidCodeBlockAttributes = (
  attributes: ProsemirrorAttributes,
): attributes is CodeBlockAttributes =>
  bool(
    attributes &&
      isObject(attributes) &&
      isString(attributes.language) &&
      attributes.language.length,
  );

/**
 * Updates the node attrs.
 *
 * This is used to update the language for the codeBlock.
 */
export const updateNodeAttributes = (type: NodeType) => (
  attributes: CodeBlockAttributes,
): CommandFunction => ({ state: { tr, selection }, dispatch }) => {
  if (!isValidCodeBlockAttributes(attributes)) {
    throw new Error('Invalid attrs passed to the updateAttributes method');
  }

  const parent = findParentNodeOfType({ types: type, selection });

  if (!parent || isEqual(attributes, parent.node.attrs)) {
    // Do nothing since the attrs are the same
    return false;
  }

  tr.setNodeMarkup(parent.pos, type, attributes);

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

interface GetLanguageParameter {
  /**
   * The language input from the user;
   */
  language: string;

  /**
   * The default language to use if none found.
   */
  fallback: string;
}

/**
 * Get the language from user input.
 */
export function getLanguage(parameter: GetLanguageParameter): string {
  const { language, fallback } = parameter;

  if (!language) {
    return fallback;
  }

  const supportedLanguages = refractor.listLanguages();

  for (const name of supportedLanguages) {
    if (name.toLowerCase() === language.toLowerCase()) {
      return name;
    }
  }

  return fallback;
}

function mapRefractorNodesToDOMArray(nodes: RefractorNode[]): any[] {
  return nodes.map((node) => {
    if (node.type === 'text') {
      return node.value;
    }

    const { properties, children, tagName } = node;
    const { className, ...rest } = properties;

    return [tagName, { class: className, ...rest }, mapRefractorNodesToDOMArray(children)];
  });
}

/**
 * Used to provide a `toDom` function for the code block for both the browser and
 * non browser environments.
 */
export function codeBlockToDOM(node: ProsemirrorNode, defaultLanguage = 'markup'): DOMOutputSpec {
  const { language, ...rest } = node.attrs as CodeBlockAttributes;
  const attributes = { ...rest, class: `language-${language}` };

  if (environment.isBrowser) {
    return ['pre', attributes, ['code', { [dataAttribute]: language }, 0]];
  }

  const refractorNodes = refractor.highlight(
    node.textContent ?? '',
    node.attrs.language ?? defaultLanguage,
  );

  const mappedNodes = mapRefractorNodesToDOMArray(refractorNodes);

  // TODO test the logic for this
  return ['pre', attributes, ['code', { [dataAttribute]: language }, ...mappedNodes, 0]] as any;
}

interface FormatCodeBlockFactoryParameter
  extends NodeTypeParameter,
    Required<Pick<CodeBlockProperties, 'formatter' | 'defaultLanguage'>> {}

/**
 * A factory for creating a command which can format a selected codeBlock (or
 * one located at the provided position).
 */
export function formatCodeBlockFactory(parameter: FormatCodeBlockFactoryParameter) {
  const { type, formatter, defaultLanguage: fallback } = parameter;

  return ({ pos }: Partial<PosParameter> = object()): CommandFunction => ({ state, dispatch }) => {
    const { tr, selection } = state;

    const { from, to } = pos ? { from: pos, to: pos } : selection;

    // Find the current codeBlock the cursor is positioned in.
    const codeBlock = findParentNodeOfType({ types: type, selection });

    if (!codeBlock) {
      return false;
    }

    // Get the `language`, `source` and `cursorOffset` for the block and run the
    // formatter
    const {
      node: { attrs, textContent },
      start,
    } = codeBlock;

    const offsetStart = from - start;
    const offsetEnd = to - start;
    const language = getLanguage({ language: attrs.language, fallback });
    const formatStart = formatter({ source: textContent, language, cursorOffset: offsetStart });
    let formatEnd: FormattedContent | undefined;

    // When the user has a selection
    if (offsetStart !== offsetEnd) {
      formatEnd = formatter({ source: textContent, language, cursorOffset: offsetEnd });
    }

    if (!formatStart) {
      return false;
    }

    const { cursorOffset, formatted } = formatStart;

    // Do nothing if nothing has changed
    if (formatted === textContent) {
      return false;
    }

    const end = start + textContent.length;

    // Replace the codeBlock content with the transformed text.
    tr.insertText(formatted, start, end);

    // Set the new selection
    const anchor = start + cursorOffset;
    const head = formatEnd ? start + formatEnd.cursorOffset : undefined;

    tr.setSelection(TextSelection.create(tr.doc, anchor, head));

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  };
}
