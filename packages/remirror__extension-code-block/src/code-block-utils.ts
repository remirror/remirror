import refractor, { RefractorNode } from 'refractor/core';
import {
  ApplySchemaAttributes,
  CommandFunction,
  cx,
  DOMOutputSpec,
  findParentNodeOfType,
  flattenArray,
  FromToProps,
  isEqual,
  isObject,
  isString,
  joinStyles,
  NodeType,
  NodeTypeProps,
  NodeWithPosition,
  object,
  omitExtraAttributes,
  PosProps,
  ProsemirrorAttributes,
  ProsemirrorNode,
  range,
  TextProps,
} from '@remirror/core';
import { ExtensionCodeMessages } from '@remirror/messages';
import { TextSelection } from '@remirror/pm/state';
import { Decoration } from '@remirror/pm/view';

import type { CodeBlockAttributes, CodeBlockOptions, FormattedContent } from './code-block-types';

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
  const refractorNodes = refractor.highlight(
    node.textContent ?? '',
    node.attrs.language?.replace('language-', '') ?? 'markup',
  );
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
    ...extraAttrs,
    class: cx(extraAttrs.class, `language-${language}`),
  };

  return ['pre', attributes, ['code', { [LANGUAGE_ATTRIBUTE]: language, style }, 0]];
}

interface FormatCodeBlockFactoryProps
  extends NodeTypeProps,
    Required<Pick<CodeBlockOptions, 'formatter' | 'defaultLanguage'>> {}

/**
 * A factory for creating a command which can format a selected codeBlock (or
 * one located at the provided position).
 */
export function formatCodeBlockFactory(props: FormatCodeBlockFactoryProps) {
  return ({ pos }: Partial<PosProps> = object()): CommandFunction =>
    ({ tr, dispatch }) => {
      const { type, formatter, defaultLanguage: fallback } = props;

      const { from, to } = pos ? { from: pos, to: pos } : tr.selection;

      // Find the current codeBlock the cursor is positioned in.
      const codeBlock = findParentNodeOfType({ types: type, selection: tr.selection });

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

const { DESCRIPTION, LABEL } = ExtensionCodeMessages;
export const toggleCodeBlockOptions: Remirror.CommandDecoratorOptions = {
  icon: 'bracesLine',
  description: ({ t }) => t(DESCRIPTION),
  label: ({ t }) => t(LABEL),
};
