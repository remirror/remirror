import {
  Attrs,
  bool,
  CommandFunction,
  EditorState,
  findParentNodeOfType,
  flattenArray,
  FromToParams,
  isEqual,
  isObject,
  isString,
  NodeType,
  NodeTypeParams,
  NodeWithPosition,
  PosParams,
  ProsemirrorNodeParams,
  TextParams,
  uniqueArray,
} from '@remirror/core';
import { Decoration } from 'prosemirror-view';
import refractor, { RefractorNode, RefractorSyntax } from 'refractor/core';
import { CodeBlockAttrs, CodeBlockExtensionOptions, FormattedContent } from './code-block-types';

// Refractor languages
import { TextSelection } from 'prosemirror-state';
import clike from 'refractor/lang/clike';
import css from 'refractor/lang/css';
import js from 'refractor/lang/javascript';
import markup from 'refractor/lang/markup';

interface ParsedRefractorNode extends TextParams {
  /**
   * The classes that will wrap the node
   */
  classes: string[];
}

interface PositionedRefractorNode extends FromToParams, ParsedRefractorNode {}

/**
 * Maps the refractor nodes into text and classes which will be used to create our decoration.
 */
function parseRefractorNodes(
  refractorNodes: RefractorNode[],
  className: string[] = [],
): ParsedRefractorNode[][] {
  return refractorNodes.map(node => {
    const classes = [
      ...className,
      ...(node.type === 'element' && node.properties.className ? node.properties.className : []),
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

interface CreateDecorationsParams extends Pick<CodeBlockExtensionOptions, 'defaultLanguage'> {
  /**
   * The list of codeBlocks and their positions which we would like to update.
   */
  blocks: NodeWithPosition[];

  /**
   * When a delete happens within the last valid decoration in a block it causes the editor to jump. This skipLast
   * should be set to true immediately after a delete which then allows for createDecorations to skip updating the decoration
   * for the last refactor node, and hence preventing the jumpy bug.
   */
  skipLast: boolean;
}

/**
 * Retrieves positioned refractor nodes from the positionedNode
 *
 * @param nodeWithPosition - a node and position
 * @returns the positioned refractor nodes which are text, classes and a FromTo interface
 */
const getPositionedRefractorNodes = ({ node, pos }: NodeWithPosition) => {
  let startPos = pos + 1;
  const refractorNodes = refractor.highlight(node.textContent || '', node.attrs.language || 'markup');
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

  const parsedRefractorNodes = parseRefractorNodes(refractorNodes);

  return flattenArray<ParsedRefractorNode>(parsedRefractorNodes).map(mapper);
};

/**
 * Creates a decoration set for the provided blocks
 */
export const createDecorations = ({ blocks, skipLast }: CreateDecorationsParams) => {
  const decorations: Decoration[] = [];

  blocks.forEach(block => {
    const positionedRefractorNodes = getPositionedRefractorNodes(block);
    const lastBlockLength = skipLast ? positionedRefractorNodes.length - 1 : positionedRefractorNodes.length;
    for (let ii = 0; ii < lastBlockLength; ii++) {
      const positionedRefractorNode = positionedRefractorNodes[ii];
      const decoration = Decoration.inline(positionedRefractorNode.from, positionedRefractorNode.to, {
        class: positionedRefractorNode.classes.join(' '),
      });
      decorations.push(decoration);
    }
  });

  return decorations;
};

interface PosWithinRangeParams extends PosParams, FromToParams {}

/**
 * Check if the position is within the range.
 */
export const posWithinRange = ({ from, to, pos }: PosWithinRangeParams) => from <= pos && to >= pos;

/**
 * Check whether the length of an array has changed
 */
export const lengthHasChanged = <GType>(prev: ArrayLike<GType>, next: ArrayLike<GType>) =>
  next.length !== prev.length;

export interface NodeInformation extends NodeTypeParams, FromToParams, ProsemirrorNodeParams, PosParams {}

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
 * Check that the attributes exist and are valid for the codeBlock updateAttrs.
 */
export const isValidCodeBlockAttrs = (attrs?: Attrs): attrs is CodeBlockAttrs =>
  bool(attrs && isObject(attrs) && isString(attrs.language) && attrs.language.length);

/**
 * Updates the node attrs.
 *
 * This is used to update the language for the codeBlock.
 */
export const updateNodeAttrs = (type: NodeType) => (attrs: CodeBlockAttrs): CommandFunction => (
  { tr, selection },
  dispatch,
) => {
  if (!isValidCodeBlockAttrs(attrs)) {
    throw new Error('Invalid attrs passed to the updateAttrs method');
  }

  const parent = findParentNodeOfType({ types: type, selection });

  if (!parent || isEqual(attrs, parent.node.attrs)) {
    // Do nothing since the attrs are the same
    return false;
  }

  tr.setNodeMarkup(parent.pos, type, attrs);

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

const PRELOADED_LANGUAGES = [markup, clike, css, js];

/**
 * The list of strings that are recognised language names based on the the configured
 * supported languages.
 */
export const getLanguageNamesAndAliases = (supportedLanguages: RefractorSyntax[]) => {
  return uniqueArray(
    flattenArray(
      [...PRELOADED_LANGUAGES, ...supportedLanguages].map(({ name, aliases }) => [name, ...aliases]),
    ),
  );
};

/**
 * Returns true if the language is supported.
 */
export const isSupportedLanguage = (language: string, supportedLanguages: RefractorSyntax[]) => {
  return getLanguageNamesAndAliases(supportedLanguages).includes(language);
};

interface GetLanguageParams {
  /**
   * The language input from the user;
   */
  language: string;

  /**
   * The languages supported by the editor.
   */
  supportedLanguages: RefractorSyntax[];

  /**
   * The default language to use if none found.
   */
  fallback: string;
}

/**
 * Get the language from user input.
 */
export const getLanguage = ({ language, supportedLanguages, fallback }: GetLanguageParams) =>
  !isSupportedLanguage(language, supportedLanguages) ? fallback : language;

interface FormatCodeBlockFactoryParams
  extends NodeTypeParams,
    Required<Pick<CodeBlockExtensionOptions, 'formatter' | 'supportedLanguages' | 'defaultLanguage'>> {}

/**
 * A factory for creating a command which can format a selected codeBlock (or one located at the provided position).
 */
export const formatCodeBlockFactory = ({
  type,
  formatter,
  supportedLanguages,
  defaultLanguage: fallback,
}: FormatCodeBlockFactoryParams) => ({ pos }: Partial<PosParams> = {}): CommandFunction => (
  state,
  dispatch,
) => {
  const { tr, selection } = state;

  const { from, to } = pos ? { from: pos, to: pos } : selection;

  // Find the current codeBlock the cursor is positioned in.
  const codeBlock = findParentNodeOfType({ types: type, selection });

  if (!codeBlock) {
    return false;
  }

  // Get the `language`, `source` and `cursorOffset` for the block and run the formatter
  const {
    node: { attrs, textContent },
    start,
  } = codeBlock;

  const offsetStart = from - start;
  const offsetEnd = to - start;
  const language = getLanguage({ language: attrs.language, fallback, supportedLanguages });
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

/**
 * Retrieve the supported language names based on configuration.
 */
export const getSupportedLanguagesMap = (supportedLanguages: RefractorSyntax[]) => {
  const obj: Record<string, string> = {};
  for (const { name, aliases } of [...PRELOADED_LANGUAGES, ...supportedLanguages]) {
    obj[name] = name;
    aliases.forEach(alias => {
      obj[alias] = name;
    });
  }
  return obj;
};
