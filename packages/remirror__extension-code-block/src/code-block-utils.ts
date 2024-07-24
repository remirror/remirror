import refractor, { RefractorNode } from 'refractor/core.js';
import {
  ApplySchemaAttributes,
  CommandFunction,
  CommandFunctionProps,
  cx,
  DelayedPromiseCreator,
  DOMOutputSpec,
  findParentNodeOfType,
  FindProsemirrorNodeResult,
  flattenArray,
  FromToProps,
  isEqual,
  isObject,
  isString,
  joinStyles,
  NodeType,
  NodeTypeProps,
  NodeWithPosition,
  omitExtraAttributes,
  PosProps,
  ProsemirrorAttributes,
  ProsemirrorNode,
  range,
  TextProps,
} from '@remirror/core';
import { ExtensionCodeBlockMessages } from '@remirror/messages';
import { Decoration } from '@remirror/pm/view';

import type { CodeBlockAttributes, CodeBlockOptions } from './code-block-types';

export const LANGUAGE_ATTRIBUTE = 'data-code-block-language';
export const WRAP_ATTRIBUTE = 'data-code-block-wrap';

interface ParsedRefractorNode extends TextProps {
  /**
   * The classes that will wrap the node
   */
  classes: string[];
}

interface PositionedRefractorNode extends FromToProps, ParsedRefractorNode {}

/**
 * Maps the refractor nodes into text and classes which will be used to create
 * our decoration.
 */
function parseRefractorNodes(
  refractorNodes: RefractorNode[],
  plainTextClassName: string | undefined,
  className: string[] = [],
): ParsedRefractorNode[][] {
  return refractorNodes.map((node) => {
    const classes: string[] = [...className];

    if (node.type === 'element' && node.properties.className) {
      classes.push(...node.properties.className);
    } else if (node.type === 'text' && classes.length === 0 && plainTextClassName) {
      classes.push(plainTextClassName);
    }

    if (node.type === 'element') {
      return parseRefractorNodes(node.children, plainTextClassName, classes) as any;
    }

    return {
      text: node.value,
      classes,
    };
  });
}

interface CreateDecorationsProps {
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

  plainTextClassName: string | undefined;
}

/**
 * Retrieves positioned refractor nodes from the positionedNode
 *
 * @param nodeWithPos - a node and position
 * @param plainTextClassName - a class to assign to text nodes on the top-level
 * @returns the positioned refractor nodes which are text, classes and a FromTo
 * interface
 */
function getPositionedRefractorNodes(
  nodeWithPos: NodeWithPosition,
  plainTextClassName: string | undefined,
) {
  const { node, pos } = nodeWithPos;
  const language = getLanguage({
    language: node.attrs.language?.replace('language-', ''),
    fallback: 'markup',
  });
  const refractorNodes = refractor.highlight(node.textContent ?? '', language);
  const parsedRefractorNodes = parseRefractorNodes(refractorNodes, plainTextClassName);

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
export function createDecorations(props: CreateDecorationsProps): Decoration[] {
  const { blocks, skipLast, plainTextClassName } = props;
  const decorations: Decoration[] = [];

  for (const block of blocks) {
    const positionedRefractorNodes = getPositionedRefractorNodes(block, plainTextClassName);
    const lastBlockLength = skipLast
      ? positionedRefractorNodes.length - 1
      : positionedRefractorNodes.length;

    for (const index of range(lastBlockLength)) {
      const positionedRefractorNode = positionedRefractorNodes[index];
      const classes = positionedRefractorNode?.classes;

      if (!positionedRefractorNode || !classes?.length) {
        // Do not create a decoration if we cannot assign at least one class
        continue;
      }

      const decoration = Decoration.inline(
        positionedRefractorNode.from,
        positionedRefractorNode.to,
        {
          class: classes.join(' '),
        },
      );

      decorations.push(decoration);
    }
  }

  return decorations;
}

/**
 * Check that the attributes exist and are valid for the codeBlock
 * updateAttributes.
 */
export function isValidCodeBlockAttributes(
  attributes: ProsemirrorAttributes,
): attributes is CodeBlockAttributes {
  return !!(
    attributes &&
    isObject(attributes) &&
    isString(attributes.language) &&
    attributes.language.length > 0
  );
}

/**
 * Updates the node attrs.
 *
 * This is used to update the language for the codeBlock.
 */
export function updateNodeAttributes(type: NodeType) {
  return (attributes: CodeBlockAttributes): CommandFunction =>
    ({ state: { tr, selection }, dispatch }) => {
      if (!isValidCodeBlockAttributes(attributes)) {
        throw new Error('Invalid attrs passed to the updateAttributes method');
      }

      const parent = findParentNodeOfType({ types: type, selection });

      if (!parent || isEqual(attributes, parent.node.attrs)) {
        // Do nothing since the attrs are the same
        return false;
      }

      tr.setNodeMarkup(parent.pos, type, { ...parent.node.attrs, ...attributes });

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
}

interface GetLanguageProps {
  /**
   * The language input from the user;
   */
  language: string | undefined;

  /**
   * The default language to use if none found.
   */
  fallback: string;
}

/**
 * Get the language from user input.
 */
export function getLanguage(props: GetLanguageProps): string {
  const { language, fallback } = props;

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

/**
 * Used to provide a `toDom` function for the code block. Currently this only
 * support the browser runtime.
 */
export function codeBlockToDOM(node: ProsemirrorNode, extra: ApplySchemaAttributes): DOMOutputSpec {
  const { language, wrap } = omitExtraAttributes(node.attrs, extra);
  const { style: _, ...extraAttrs } = extra.dom(node);
  let style = extraAttrs.style;

  if (wrap) {
    style = joinStyles({ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, style);
  }

  const attributes = {
    spellcheck: 'false',
    ...extraAttrs,
    class: cx(extraAttrs.class, `language-${language}`),
  };

  return ['pre', attributes, ['code', { [LANGUAGE_ATTRIBUTE]: language, style }, 0]];
}

type FormatCodeProps = NodeTypeProps &
  Required<Pick<CodeBlockOptions, 'formatter' | 'defaultLanguage'>> &
  Partial<PosProps> &
  CommandFunctionProps;

export interface FormatCodeResult {
  /**
   * Formatted code
   */
  formatted: string;

  /**
   * The original range that should be replaced in the code block
   */
  range: { from: number; to: number };

  /**
   * Updated selection coordinates for the formatted code
   */
  selection: { anchor: number; head?: number };
}

/**
 * Format the contents of a selected codeBlock or one located at the provided
 * position.
 */
export async function formatCode(props: FormatCodeProps): Promise<FormatCodeResult | undefined> {
  const { type, formatter, defaultLanguage: fallback, pos, tr } = props;
  const { selection, doc } = tr;

  // This is verified to exist during DelayedCommand.validate().
  const codeBlock = findParentNodeOfType({
    types: type,
    selection: pos !== undefined ? doc.resolve(pos) : selection,
  }) as FindProsemirrorNodeResult;

  const {
    node: { attrs, textContent },
    start,
  } = codeBlock;

  const { from, to } = pos !== undefined ? { from: pos, to: pos } : selection;
  const offsetStart = from - start;
  const offsetEnd = to - start;
  const language = getLanguage({ language: attrs.language, fallback });

  const formatStartPromise = formatter({
    source: textContent,
    language,
    cursorOffset: offsetStart,
  });

  // If the user has a selection, format again using the end of the selection as
  // the cursor offset so that the new selection end can be determined.
  const formatEndPromise =
    offsetEnd !== offsetStart
      ? formatter({ source: textContent, language, cursorOffset: offsetEnd })
      : Promise.resolve();

  const [formatStart, formatEnd] = await Promise.all([formatStartPromise, formatEndPromise]);

  if (!formatStart) {
    return;
  }

  // Do nothing if nothing has changed
  if (formatStart.formatted === textContent) {
    return;
  }

  return {
    formatted: formatStart.formatted,
    range: {
      from: start,
      to: start + textContent.length,
    },
    selection: {
      anchor: start + formatStart.cursorOffset,
      head: formatEnd ? start + formatEnd.cursorOffset : undefined,
    },
  };
}

export interface DelayedFormatCodeBlockProps<Value> {
  /**
   * Optionally specify a position to identify a code block.
   */
  pos?: PosProps['pos'];

  /**
   * A function that returns a promise.
   */
  promise: DelayedPromiseCreator<Value>;

  /**
   * Called when the promise succeeds and the formatted code is available. If
   * formatting fails, the failure handler is called instead.
   */
  onSuccess: (value: Value, commandProps: CommandFunctionProps) => boolean;

  /**
   * Called when a failure is encountered.
   */
  onFailure?: CommandFunction<{ error: unknown }>;
}

/**
 * Get the language from the provided `code` element. This is used as the
 * default implementation in the `CodeExtension` but it can be overridden.
 */
export function getLanguageFromDom(codeElement: HTMLElement): string | undefined {
  return (codeElement.getAttribute(LANGUAGE_ATTRIBUTE) ?? codeElement.classList[0])?.replace(
    'language-',
    '',
  );
}

const { DESCRIPTION, LABEL } = ExtensionCodeBlockMessages;
export const toggleCodeBlockOptions: Remirror.CommandDecoratorOptions = {
  icon: 'bracesLine',
  description: ({ t }) => t(DESCRIPTION),
  label: ({ t }) => t(LABEL),
};
