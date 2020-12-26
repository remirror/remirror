import {
  Fragment,
  Mark,
  MarkType,
  Node as ProsemirrorNode,
  NodeType,
  ResolvedPos,
  Schema as EditorSchema,
  Slice,
} from 'prosemirror-model';
import { Plugin, PluginKey, Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { ExtensionPriority } from '@remirror/core-constants';
import { findMatches, includes, isFunction, isString, range, sort } from '@remirror/core-helpers';

/**
 * Create the paste plugin handler.
 */
export function pasteRules(pasteRules: PasteRule[]): Plugin<void> {
  const sortedPasteRules = sort(
    pasteRules,
    (a, z) => (z.priority ?? ExtensionPriority.Low) - (a.priority ?? ExtensionPriority.Low),
  );

  // Container for the regex based paste rules.
  const regexPasteRules: RegexPasteRule[] = [];

  // Container for the file based paste rules.
  const filePasteRules: FilePasteRule[] = [];

  for (const rule of sortedPasteRules) {
    if (isRegexPastRule(rule)) {
      regexPasteRules.push(rule);
    } else {
      filePasteRules.push(rule);
    }
  }

  let view: EditorView;

  return new Plugin({
    key: pastePluginKey,
    view: (editorView) => {
      view = editorView;
      return {};
    },
    props: {
      // The regex based paste rules are passed into this function to take care of.
      transformPasted: (slice) => {
        const $pos = view.state.selection.$from;
        const nodeName = $pos.node().type.name;
        const markNames = new Set($pos.marks().map((mark) => mark.type.name));

        // Iterate over each rule by order of priority and update the slice each time.
        for (const rule of regexPasteRules) {
          if (
            // The parent node is ignored.
            rule.ignoredNodes?.includes(nodeName) ||
            // The current position contains ignored marks.
            rule.ignoredMarks?.some((ignored) => markNames.has(ignored))
          ) {
            continue;
          }

          slice = new Slice(
            regexPasteRuleHandler(slice.content, rule, view.state.schema),
            slice.openStart,
            slice.openEnd,
          );
        }

        return slice;
      },
      handleDOMEvents: {
        // Handle paste for pasting content.
        paste: (view, event) => {
          if (!view.props.editable?.(view.state)) {
            return false;
          }

          const { clipboardData } = event;

          if (!clipboardData) {
            return false;
          }

          const allFiles: File[] = [...clipboardData.items]
            .map((data) => data.getAsFile())
            .filter((file): file is File => !!file);

          if (allFiles.length === 0) {
            return false;
          }

          const { selection } = view.state;

          for (const { fileHandler, regexp } of filePasteRules) {
            const files = regexp ? allFiles.filter((file) => regexp.test(file.type)) : allFiles;

            if (files.length === 0) {
              continue;
            }

            if (fileHandler({ event, files, selection, view, type: 'paste' })) {
              event.preventDefault();
              return true;
            }
          }

          return false;
        },

        // Handle drop for pasting content.
        drop: (view, event) => {
          if (!view.props.editable?.(view.state)) {
            return false;
          }

          const { dataTransfer } = event;

          if (!dataTransfer) {
            return false;
          }

          const allFiles = getDataTransferFiles(event);

          if (allFiles.length === 0) {
            return false;
          }

          const pos =
            view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ??
            view.state.selection.anchor;

          for (const { fileHandler, regexp } of filePasteRules) {
            const files = regexp ? allFiles.filter((file) => regexp.test(file.type)) : allFiles;

            if (files.length === 0) {
              continue;
            }

            if (fileHandler({ event, files, pos, view, type: 'drop' })) {
              event.preventDefault();
              return true;
            }
          }

          return false;
        },
      },
    },
  });
}

interface BasePasteRule {
  /**
   * The priority for the extension. Can be a number, or if you're using it with
   * `remirror` then use the `ExtensionPriority` enum.
   *
   * @default 10
   */
  priority?: ExtensionPriority;
}

interface BaseRegexPasteRule extends BasePasteRule {
  /**
   * The regular expression to test against.
   */
  regexp: RegExp;

  /**
   * Only match at the start of the text block.
   */
  startOfTextBlock?: boolean;

  /**
   * Ignore the match when all characters in the capture group are whitespace.
   *
   * This helps stop situations from occurring where the a capture group matches
   * but you don't want an update if it's all whitespace.
   *
   * @default false
   */
  ignoreWhitespace?: boolean;

  /**
   * The names of nodes for which this paste rule can be ignored. This means
   * that if content is within any of the nodes provided the transformation will
   * be ignored.
   */
  ignoredNodes?: string[];

  /**
   * The names of marks for which this paste rule can be ignored. This means
   * that if the matched content contains this mark it will be ignored..
   */
  ignoredMarks?: string[];

  /**
   * A function that transforms the match into the desired text value.
   *
   * Return an empty string to delete all content.
   */
  transformMatch?: (match: RegExpExecArray) => string | null | undefined;
}

interface BaseContentPasteRule extends BaseRegexPasteRule {
  /**
   * A helper function for setting the attributes for a transformation .
   */
  getAttributes?:
    | Record<string, unknown>
    | ((match: string[]) => Record<string, unknown> | undefined);
}

/**
 * For adding marks to text when a paste rule is activated.
 */
export interface MarkPasteRule extends BaseContentPasteRule {
  /**
   * The type of rule.
   */
  type: 'mark';

  /**
   * The prosemirror mark type instance.
   */
  markType: MarkType;
}

export interface NodePasteRule extends BaseContentPasteRule {
  /**
   * The type of rule.
   */
  type: 'node';

  /**
   * The node type to create.
   */
  nodeType: NodeType;
}

/**
 * For handling simpler text updates.
 */
export interface TextPasteRule extends BaseRegexPasteRule {
  /**
   * The type of rule.
   */
  type: 'text';
}

export type FileHandlerParameter = FilePasteHandlerParameter | FileDropHandlerParameter;

export interface FilePasteHandlerParameter {
  type: 'paste';
  /** All the matching files */
  files: File[];
  event: ClipboardEvent;
  view: EditorView;
  selection: Selection;
}

export interface FileDropHandlerParameter {
  type: 'drop';
  /** All the matching files */
  files: File[];
  event: DragEvent;
  view: EditorView;
  pos: number;
}

/**
 * For handling pasting files and also file drops.
 */
export interface FilePasteRule extends BasePasteRule {
  type: 'file';

  /**
   * A regex test for the file type.
   */
  regexp?: RegExp;

  /**
   * The names of nodes for which this paste rule can be ignored. This means
   * that if content is within any of the nodes provided the transformation will
   * be ignored.
   */
  ignoredNodes?: string[];

  /**
   * Return `false` to defer to the next image handler.
   *
   * The file
   */
  fileHandler: (parameter: FileHandlerParameter) => boolean;
}

export type PasteRule = FilePasteRule | TextPasteRule | NodePasteRule | MarkPasteRule;

const pastePluginKey = new PluginKey('pasteRule');

/**
 * @template RegexPasteRule
 */
interface PasteRuleHandler<Rule extends RegexPasteRule> {
  /** The fragment to use */
  fragment: Fragment;
  /** The type of the rule passed */
  rule: Rule;
  /** The nodes provided */
  nodes: ProsemirrorNode[];
}

interface TransformerParameter<Rule extends RegexPasteRule> {
  rule: Rule;
  textNode: ProsemirrorNode;
  nodes: ProsemirrorNode[];
  match: RegExpExecArray;
  schema: EditorSchema;
}

type Transformer<Rule extends RegexPasteRule> = (parameter: TransformerParameter<Rule>) => void;

/**
 * Factory for creating paste rules.
 */
function createPasteRuleHandler<Rule extends RegexPasteRule>(
  transformer: Transformer<Rule>,
  schema: EditorSchema,
) {
  return function handler(parameter: PasteRuleHandler<Rule>) {
    const { fragment, rule, nodes } = parameter;
    const { regexp, ignoreWhitespace, ignoredMarks, ignoredNodes, transformMatch } = rule;

    fragment.forEach((child) => {
      // Check if this node should be ignored.
      if (ignoredNodes?.includes(child.type.name) || isCodeNode(child)) {
        nodes.push(child);
        return;
      }

      // When the current node is not a text node, recursively dive into it's child nodes.
      if (!child.isText) {
        nodes.push(child.copy(handler({ fragment: child.content, rule, nodes })));
        return;
      }

      // When this is a text node ignore this child if it is wrapped by an ignored
      // mark or a code mark.
      if (child.marks.some((mark) => isCodeMark(mark) || ignoredMarks?.includes(mark.type.name))) {
        nodes.push(child);
        return;
      }

      const text = child.text ?? '';
      let pos = 0;

      // Find all matches and add the defined mark.
      for (const match of findMatches(text, regexp)) {
        // The captured value from the regex.
        const capturedValue = match[1];
        const transformedCapturedValue = transformMatch?.(match);
        const fullValue = match[0];

        if (
          // This helps prevent matches which are only whitespace from triggering
          // an update.
          ignoreWhitespace &&
          capturedValue?.trim() === ''
        ) {
          return;
        }

        const start = match.index;
        const end = start + match[0].length;

        if (start > 0) {
          nodes.push(child.cut(pos, start));
        }

        let textNode = child.cut(start, end);

        // When a transformed value was provided.
        if (isString(transformedCapturedValue)) {
          textNode = schema.text(transformedCapturedValue, textNode.marks);
        }

        // When a capture value is provided use it.
        else if (capturedValue) {
          const startSpaces = fullValue.search(/\S/);
          const textStart = start + fullValue.indexOf(capturedValue);
          const textEnd = textStart + capturedValue.length;

          if (startSpaces) {
            nodes.push(child.cut(start, start + startSpaces));
          }

          textNode = child.cut(textStart, textEnd);
        }

        // A transformer to push the required nodes.
        transformer({ nodes, rule, textNode, match, schema });
        pos = end;
      }

      // Add the rest of the node to the gathered nodes if any characters are
      // remaining.
      if (text && pos < text.length) {
        nodes.push(child.cut(pos));
      }
    });

    return Fragment.fromArray(nodes);
  };
}

/**
 * Mark rule transformer which pushes the transformed mark into the provided
 * nodes.
 */
function markRuleTransformer(parameter: TransformerParameter<MarkPasteRule>) {
  const { nodes, rule, textNode, match } = parameter;
  const { getAttributes, markType } = rule;
  const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
  nodes.push(textNode.mark([markType.create(attributes), ...textNode.marks]));
}

/**
 * Support for pasting node content into the editor.
 */
function nodeRuleTransformer(parameter: TransformerParameter<NodePasteRule>) {
  const { nodes, rule, textNode, match } = parameter;
  const { getAttributes, nodeType } = rule;
  const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
  nodes.push(nodeType.create(attributes, textNode));
}

/**
 * Support for pasting and transforming text content into the editor.
 */
function textRuleTransformer(parameter: TransformerParameter<TextPasteRule>) {
  const { nodes, textNode } = parameter;
  nodes.push(textNode);
}

/**
 * The run the handlers for the regex paste rules on the content which has been transformed by prosemirror.
 */
function regexPasteRuleHandler(
  fragment: Fragment,
  rule: RegexPasteRule,
  schema: EditorSchema,
): Fragment {
  const nodes: ProsemirrorNode[] = [];

  switch (rule.type) {
    case 'mark':
      return createPasteRuleHandler(markRuleTransformer, schema)({ fragment, nodes, rule });

    case 'node':
      return createPasteRuleHandler(nodeRuleTransformer, schema)({ fragment, nodes, rule });

    default:
      return createPasteRuleHandler(textRuleTransformer, schema)({ fragment, nodes, rule });
  }
}

const regexPasteRules = ['mark', 'node', 'text'] as const;
type RegexPasteRule = MarkPasteRule | NodePasteRule | TextPasteRule;

/**
 * Check if the paste rule is regex based.
 */
function isRegexPastRule(rule: PasteRule): rule is RegexPasteRule {
  return includes(regexPasteRules, rule.type);
}

export interface IsInCodeOptions {
  /**
   * When this is set to true ensure the selection is fully contained within a code block. This means that selections that span multiple characters must all be within a code region for it to return true.
   *
   * @default true
   */
  contained?: boolean;
}

/**
 * Check whether the current selection is completely contained within a code block or mark.
 */
export function isInCode(
  selection: Selection,
  { contained = true }: IsInCodeOptions = {},
): boolean {
  if (selection.empty) {
    return resolvedPosInCode(selection.$head);
  }

  if (contained) {
    return resolvedPosInCode(selection.$head) && resolvedPosInCode(selection.$anchor);
  }

  return resolvedPosInCode(selection.$head) || resolvedPosInCode(selection.$anchor);
}

/**
 * Check if the provided position is within a code mark or node.
 */
function resolvedPosInCode($pos: ResolvedPos): boolean {
  // Start at the current depth and work down until a depth of 1.
  for (const depth of range($pos.depth, 1)) {
    if (isCodeNode($pos.node(depth))) {
      return true;
    }
  }

  for (const mark of $pos.marks()) {
    if (isCodeMark(mark)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the current node is a code node.
 */
function isCodeNode(node: ProsemirrorNode) {
  return node.type.spec.code || node.type.spec.group?.split(' ').includes('code');
}

/**
 * Check if the current mark is a code mark.
 */
function isCodeMark(mark: Mark) {
  return mark.type.name === 'code' || mark.type.spec.group?.split(' ').includes('code');
}

function getDataTransferFiles(event: DragEvent): File[] {
  let dataTransferItemsList: FileList;
  const { dataTransfer } = event;

  if (!dataTransfer) {
    return [];
  }

  if (dataTransfer.files?.length > 0) {
    return [...dataTransfer.files];
  }

  if (dataTransfer.items?.length) {
    // During the drag even the dataTransfer.files is null
    // but Chrome implements some drag store, which is accesible via dataTransfer.items
    return [...dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((item): item is File => !!item);
  }

  return [];
}
