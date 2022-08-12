import { cssifyObject } from 'css-in-js-utils';
import type { StyleObject } from 'css-in-js-utils/es/cssifyObject';
import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  LEAF_NODE_REPLACING_CHARACTER,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  assert,
  assertGet,
  clamp,
  includes,
  invariant,
  isArray,
  isNullOrUndefined,
  isNumber,
  isObject,
  isString,
  keys,
  omit,
  sort,
  uniqueBy,
  unset,
} from '@remirror/core-helpers';
import type {
  AnchorHeadProps,
  AnyConstructor,
  ApplySchemaAttributes,
  AttributesProps,
  DOMCompatibleAttributes,
  EditorSchema,
  EditorState,
  FromToProps,
  MarkTypeProps,
  PosProps,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
  RemirrorContentType,
  RemirrorIdentifierShape,
  RemirrorJSON,
  ResolvedPos,
  SchemaProps,
  Selection,
  TextProps,
  Transaction,
  TrStateProps,
} from '@remirror/core-types';
import {
  DOMParser as PMDomParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node as PMNode,
  NodeRange,
  NodeType,
  ParseOptions,
  ResolvedPos as PMResolvedPos,
  Schema,
  Slice,
} from '@remirror/pm/model';
import {
  AllSelection,
  EditorState as PMEditorState,
  NodeSelection,
  Selection as PMSelection,
  TextSelection,
  Transaction as PMTransaction,
} from '@remirror/pm/state';
import type { Step } from '@remirror/pm/transform';
import {
  AddMarkStep,
  RemoveMarkStep,
  ReplaceAroundStep,
  ReplaceStep,
} from '@remirror/pm/transform';

import { environment } from './environment';
import { containsAttributes } from './prosemirror-utils';

function isRangeStep(
  step: Step,
): step is AddMarkStep | ReplaceAroundStep | ReplaceStep | RemoveMarkStep {
  return isValidStep(step, [AddMarkStep, ReplaceAroundStep, ReplaceStep, RemoveMarkStep]);
}

/**
 * Identifies the value as having a remirror identifier. This is the core
 * predicate check for the remirror library.
 *
 * @param value - the value to be checked
 *
 * @internal
 */
export function isRemirrorType(value: unknown): value is RemirrorIdentifierShape {
  return isObject<RemirrorIdentifierShape>(value);
}

/**
 * Checks that the provided remirror shape is of a given type.
 *
 * @param value - any remirror shape
 * @param type - the remirror identifier type to check for
 *
 * @internal
 */
export function isIdentifierOfType(
  value: RemirrorIdentifierShape,
  type: RemirrorIdentifier | RemirrorIdentifier[],
): boolean {
  return isArray(type)
    ? includes(type, value[__INTERNAL_REMIRROR_IDENTIFIER_KEY__])
    : type === value[__INTERNAL_REMIRROR_IDENTIFIER_KEY__];
}

/**
 * Check to see if the passed value is a NodeType.
 *
 * @param value - the value to check
 */
export function isNodeType(value: unknown): value is NodeType {
  return isObject(value) && value instanceof NodeType;
}

/**
 * Get the node type from a potential string value.
 */
export function getNodeType(type: string | NodeType, schema: EditorSchema): NodeType {
  return isString(type) ? assertGet(schema.nodes, type) : type;
}

/**
 * Check to see if the passed value is a MarkType.
 *
 * @param value - the value to check
 */
export function isMarkType(value: unknown): value is MarkType {
  return isObject(value) && value instanceof MarkType;
}

/**
 * Get the mark type from a potential string value.
 */
export function getMarkType(type: string | MarkType, schema: EditorSchema): MarkType {
  return isString(type) ? assertGet(schema.marks, type) : type;
}

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param value - the value to check
 */
export function isProsemirrorNode(value: unknown): value is ProsemirrorNode {
  return isObject(value) && value instanceof PMNode;
}

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param value - the value to check
 */
export function isProsemirrorFragment(value: unknown): value is Fragment {
  return isObject(value) && value instanceof Fragment;
}

/**
 * Checks to see if the passed value is a ProsemirrorMark
 *
 * @param value - the value to check
 */
export function isProsemirrorMark(value: unknown): value is Mark {
  return isObject(value) && value instanceof Mark;
}

/**
 * Checks to see if the passed value is a Prosemirror Editor State
 *
 * @param value - the value to check
 */
export function isEditorState(value: unknown): value is PMEditorState {
  return isObject(value) && value instanceof PMEditorState;
}

/**
 * Checks to see if the passed value is a Prosemirror Transaction
 *
 * @param value - the value to check
 */
export function isTransaction(value: unknown): value is PMTransaction {
  return isObject(value) && value instanceof PMTransaction;
}

/**
 * Checks to see if the passed value is an instance of the editor schema
 *
 * @param value - the value to check
 */
export function isEditorSchema(value: unknown): value is EditorSchema {
  return isObject(value) && value instanceof Schema;
}

/**
 * Predicate checking whether the selection is a `TextSelection`.
 *
 * @param value - the value to check
 */
export function isTextSelection(value: unknown): value is TextSelection {
  return isObject(value) && value instanceof TextSelection;
}

/**
 * Predicate checking whether the selection is an `AllSelection`.
 *
 * @param value - the value to check
 */
export function isAllSelection(value: unknown): value is AllSelection {
  return isObject(value) && value instanceof AllSelection;
}

/**
 * Predicate checking whether the value is a Selection
 *
 * @param value - the value to check
 */
export function isSelection(value: unknown): value is Selection {
  return isObject(value) && value instanceof PMSelection;
}

/**
 * Predicate checking whether the value is a ResolvedPosition.
 *
 * @param value - the value to check
 */
export function isResolvedPos(value: unknown): value is PMResolvedPos {
  return isObject(value) && value instanceof PMResolvedPos;
}

interface RangeHasMarkProps
  extends TrStateProps,
    FromToProps,
    MarkTypeProps,
    Partial<AttributesProps> {}

/**
 * A wrapper for ProsemirrorNode.rangeHasMark that can also compare mark attributes (if supplied)
 *
 * @param props - see [[`RangeHasMarkProps`]] for options
 */
export function rangeHasMark(props: RangeHasMarkProps): boolean {
  const { trState, from, to, type, attrs = {} } = props;
  const { doc } = trState;
  const markType = getMarkType(type, doc.type.schema);

  if (Object.keys(attrs).length === 0) {
    return doc.rangeHasMark(from, to, markType);
  }

  let found = false;

  if (to > from) {
    doc.nodesBetween(from, to, (node) => {
      if (found) {
        return false;
      }

      const marks = node.marks ?? [];
      found = marks.some((mark) => {
        if (mark.type !== markType) {
          return false;
        }

        return containsAttributes(mark, attrs);
      });
      // Don't descend if found
      return !found;
    });
  }

  return found;
}

/**
 * Predicate checking whether the selection is a NodeSelection
 *
 * @param value - the value to check
 */
export function isNodeSelection(value: unknown): value is NodeSelection {
  return isObject(value) && value instanceof NodeSelection;
}

interface IsMarkActiveProps
  extends MarkTypeProps,
    Partial<AttributesProps>,
    Partial<FromToProps>,
    TrStateProps {}

/**
 * Checks that a mark is active within the selected region, or the current
 * selection point is within a region with the mark active. Used by extensions
 * to implement their active methods.
 *
 * @param props - see [[`IsMarkActiveProps`]] for options
 */
export function isMarkActive(props: IsMarkActiveProps): boolean {
  const { trState, type, attrs = {}, from, to } = props;
  const { selection, doc, storedMarks } = trState;
  const markType = isString(type) ? doc.type.schema.marks[type] : type;

  invariant(markType, {
    code: ErrorConstant.SCHEMA,
    message: `Mark type: ${type} does not exist on the current schema.`,
  });

  if (from && to) {
    try {
      return Math.max(from, to) < doc.nodeSize && rangeHasMark({ ...props, from, to });
    } catch {
      return false;
    }
  }

  if (selection.empty) {
    const marks = storedMarks ?? selection.$from.marks();
    return marks.some((mark) => {
      if (mark.type !== type) {
        return false;
      }

      return containsAttributes(mark, attrs ?? {});
    });
  }

  return rangeHasMark({ ...props, from: selection.from, to: selection.to });
}

/**
 * Check if the specified type (NodeType) can be inserted at the current
 * selection point.
 *
 * @param state - the editor state
 * @param type - the node type
 */
export function canInsertNode(state: EditorState, type: NodeType): boolean {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth >= 0; depth--) {
    const index = $from.index(depth);
    try {
      if ($from.node(depth).canReplaceWith(index, index, type)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Checks if a node looks like an empty document.
 *
 * @param node - the prosemirror node
 */
export function isDocNodeEmpty(node: ProsemirrorNode): boolean {
  const nodeChild = node.content.firstChild;

  if (node.childCount !== 1 || !nodeChild) {
    return false;
  }

  return (
    nodeChild.type.isBlock &&
    !nodeChild.childCount &&
    nodeChild.nodeSize === 2 &&
    (isNullOrUndefined(nodeChild.marks) || nodeChild.marks.length === 0)
  );
}

interface DefaultDocNodeOptions {
  /**
   * When true will not check any of the attributes for any of the nodes.
   */
  ignoreAttributes?: boolean;

  /**
   * Set this to true to only test whether the content is identical to the
   * default and not the parent node.
   */
  ignoreDocAttributes?: boolean;
}

/**
 * Check whether the provided doc node has the same value as the default empty
 * node for the document. Basically checks that the document is untouched.
 *
 * This is useful for extensions like the placeholder which only should be shown
 * when the document matches the default empty state.
 */
export function isDefaultDocNode(
  doc: ProsemirrorNode,
  options: DefaultDocNodeOptions = {},
): boolean {
  const defaultDoc = getDefaultDocNode(doc.type.schema);

  // Make sure the `doc` was created.
  if (!defaultDoc) {
    // No default doc exists for the current schema.
    return false;
  }

  const { ignoreAttributes, ignoreDocAttributes } = options;

  if (ignoreAttributes) {
    return prosemirrorNodeEquals(defaultDoc, doc);
  }

  if (ignoreDocAttributes) {
    return defaultDoc.content.eq(doc.content);
  }

  return defaultDoc.eq(doc);
}

/**
 * Check that two nodes are equal while ignoring all attributes.
 *
 * This is an alternative to the `node.eq()` method.
 */
export function prosemirrorNodeEquals(node: ProsemirrorNode, other: ProsemirrorNode): boolean {
  // The values are equivalent so return `true` early.
  if (node === other) {
    return true;
  }

  // Check if the markup is the same (ignoring attributes)
  const identicalMarkup = node.type === other.type && Mark.sameSet(node.marks, other.marks);

  function contentEquals(): boolean {
    if (node.content === other.content) {
      return true;
    }

    if (node.content.size !== other.content.size) {
      return false;
    }

    const nodeChildren: ProsemirrorNode[] = [];
    const otherChildren: ProsemirrorNode[] = [];
    node.content.forEach((node) => nodeChildren.push(node));
    other.content.forEach((node) => otherChildren.push(node));

    for (const [index, nodeChild] of nodeChildren.entries()) {
      const otherChild = otherChildren[index];

      if (!otherChild) {
        return false;
      }

      if (!prosemirrorNodeEquals(nodeChild, otherChild)) {
        return false;
      }
    }

    return true;
  }

  return identicalMarkup && contentEquals();
}

/**
 * Get the default `doc` node for a given schema.
 */
export function getDefaultDocNode(schema: EditorSchema): ProsemirrorNode | undefined {
  return schema.nodes.doc?.createAndFill() ?? undefined;
}

/**
 * Get the default block node from the schema.
 */
export function getDefaultBlockNode(schema: EditorSchema): NodeType {
  // Set the default block node from the schema.
  for (const type of Object.values(schema.nodes)) {
    if (type.name === 'doc') {
      continue;
    }

    // Break as soon as the first non 'doc' block node is encountered.
    if (type.isBlock || type.isTextblock) {
      return type;
    }
  }

  invariant(false, {
    code: ErrorConstant.SCHEMA,
    message: 'No default block node found for the provided schema.',
  });
}

/**
 * Check if the provided node is a default block node.
 */
export function isDefaultBlockNode(node: ProsemirrorNode): boolean {
  return node.type === getDefaultBlockNode(node.type.schema);
}

/**
 * Checks if the current node is a block node and empty.
 *
 * @param node - the prosemirror node
 */
export function isEmptyBlockNode(node: ProsemirrorNode | null | undefined): boolean {
  return !!node && node.type.isBlock && !node.textContent && !node.childCount;
}

/**
 * Retrieve the attributes for a mark.
 *
 * @param trState - the editor state or a transaction
 * @param type - the mark type
 */
export function getMarkAttributes(
  trState: EditorState | Transaction,
  type: MarkType,
): ProsemirrorAttributes | false {
  // Get the current range of the cursor selection.
  const { from, to } = trState.selection;

  // The container which will be used to store the marks.
  const marks: Mark[] = [];

  // Find the nodes and add all the marks contained to the above mark container.
  trState.doc.nodesBetween(from, to, (node) => {
    marks.push(...node.marks);
  });

  // Search for the first mark with the same type as requested
  const mark = marks.find((markItem) => markItem.type.name === type.name);

  // Return the mark attrs when found.
  if (mark) {
    return mark.attrs;
  }

  // Return false to denote the mark could not be found.
  return false;
}

export interface GetMarkRange extends FromToProps {
  /**
   * The mark that was found within the active range.
   */
  mark: Mark;

  /**
   * The text contained by this mark.
   */
  text: string;
}

/**
 * Retrieve the `start` and `end` position of a mark. The `$pos` value should be
 * calculated via `tr.doc.resolve(number)`.
 *
 * @remarks
 *
 * @param $pos - the resolved ProseMirror position
 * @param type - the mark type
 * @param $end - the end position to search until. When this is provided the
 * mark will be checked for all point up until the `$end`. The first mark within
 * the range will be returned.
 *
 * To find all marks within a selection use [[`getMarkRanges`]].
 */
export function getMarkRange(
  $pos: ResolvedPos,
  type: string | MarkType,
  $end?: ResolvedPos,
): GetMarkRange | undefined {
  // Get the start position of the current node that the `$pos` value was
  // calculated for.
  const start = $pos.parent.childAfter($pos.parentOffset);

  // If the position provided was incorrect and no node exists for this start
  // position exit early.
  if (!start.node) {
    return;
  }

  const typeName = isString(type) ? type : type.name;

  // Find the mark if it exists.
  const mark = start.node.marks.find(({ type: markType }) => markType.name === typeName);

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;

  // If the mark wasn't found then no range can be calculated. Exit early.
  if (!mark) {
    if ($end && endPos < $end.pos) {
      return getMarkRange($pos.doc.resolve(endPos + 1), type, $end);
    }

    return;
  }

  while (startIndex > 0 && mark.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  while (endIndex < $pos.parent.childCount && mark.isInSet($pos.parent.child(endIndex).marks)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }

  const text = $pos.doc.textBetween(startPos, endPos, LEAF_NODE_REPLACING_CHARACTER, '\n\n');

  return { from: startPos, to: endPos, text, mark };
}

/**
 * Get all the ranges which contain marks for the provided selection.
 */
export function getMarkRanges(selection: Selection, type: string | MarkType): GetMarkRange[] {
  const markRanges: GetMarkRange[] = [];
  const { $from, $to } = selection;
  let $pos = $from;

  while (true) {
    const range = getMarkRange($pos, type, $to);

    if (!range) {
      return markRanges;
    }

    markRanges.push(range);

    if (range.to < $to.pos) {
      $pos = $from.doc.resolve(range.to + 1);
      continue;
    }

    return markRanges;
  }
}

/**
 * Return true if the step provided an instance of any of the provided step
 * constructors.
 *
 * @param step - the step to check
 * @param StepTypes - the valid Step Constructors. Set to an empty array to
 * accept all Steps.
 */
function isValidStep(step: Step, StepTypes: Array<AnyConstructor<Step>>) {
  return StepTypes.length === 0 || StepTypes.some((Constructor) => step instanceof Constructor);
}

export interface ChangedRange extends FromToProps {
  /**
   * The previous starting position in the document.
   */
  prevFrom: number;
  /**
   * The previous ending position in the document.
   */
  prevTo: number;
}

/**
 * Get all the ranges of changes for the provided transaction.
 *
 * This can be used to gather specific parts of the document which require
 * decorations to be recalculated or where nodes should be updated.
 *
 * This is adapted from the answer
 * [here](https://discuss.prosemirror.net/t/find-new-node-instances-and-track-them/96/7)
 *
 * @param tr - the transaction received with updates applied.
 * @param StepTypes - the valid Step Constructors. Set to an empty array to
 * accept all Steps.
 */
export function getChangedRanges(
  tr: Transaction,
  StepTypes: Array<AnyConstructor<Step>> = [],
): ChangedRange[] {
  // The holder for the ranges value which will be returned from this function.
  const ranges: ChangedRange[] = [];
  const rawRanges: FromToProps[] = [];

  for (const step of tr.steps) {
    if (!isValidStep(step, StepTypes)) {
      continue;
    }

    const stepMap = step.getMap();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore @see https://github.com/ProseMirror/prosemirror/issues/1075
    if (stepMap.ranges.length === 0 && isRangeStep(step)) {
      const { from, to } = step;

      if (from === undefined || to === undefined) {
        continue;
      }

      rawRanges.push({ from, to });
    } else {
      step.getMap().forEach((from, to) => {
        rawRanges.push({ from, to });
      });
    }
  }

  // Sort the ranges.
  const sortedRanges = sort(rawRanges, (a, z) => a.from - z.from);

  // Merge sorted ranges into the new range.
  for (const { from, to } of sortedRanges) {
    // The last item in the accumulated `ranges`.
    const lastRange = ranges[ranges.length - 1];

    // True when range added has no overlap with the previous end value.
    const noOverlap = !lastRange || lastRange.to < from;

    if (noOverlap) {
      // Add the new range when no overlap is found.
      const newFrom = tr.mapping.map(from, -1);
      const newTo = tr.mapping.map(to);
      ranges.push({
        from: newFrom,
        to: newTo,
        prevFrom: tr.mapping.invert().map(newFrom, -1),
        prevTo: tr.mapping.invert().map(newTo),
      });
    } else if (lastRange) {
      // Update the lastRange's end value.
      lastRange.to = Math.max(lastRange.from, to);
    }
  }

  return uniqueBy(
    ranges,
    ({ from, to, prevFrom, prevTo }) => `${from}_${to}_${prevFrom}_${prevTo}`,
  );
}

/**
 * Get all the changed node ranges for a provided transaction.
 *
 * @param tr - the transaction received with updates applied.
 * @param StepTypes - the valid Step Constructors. Set to an empty array to
 * accept all Steps.
 */
export function getChangedNodeRanges(
  tr: Transaction,
  StepTypes?: Array<AnyConstructor<Step>>,
): NodeRange[] {
  // The container of the ranges to be returned from this function.
  const nodeRanges: NodeRange[] = [];
  const ranges = getChangedRanges(tr, StepTypes);

  for (const range of ranges) {
    try {
      const $from = tr.doc.resolve(range.from);
      const $to = tr.doc.resolve(range.to);

      // Find the node range for this provided range.
      const nodeRange = $from.blockRange($to);

      // Make sure a valid node is available.
      if (nodeRange) {
        nodeRanges.push(nodeRange);
      }
    } catch {
      // Changed ranged outside the document
    }
  }

  return nodeRanges;
}

/**
 * Retrieves the text content from a slice
 *
 * @remarks
 * A utility that's useful for pulling text content from a slice which is
 * usually created via `selection.content()`
 *
 * @param slice - the prosemirror slice
 */
export function getTextContentFromSlice(slice: Slice): string {
  return slice.content.firstChild?.textContent ?? '';
}

export interface GetSelectedGroup extends FromToProps {
  /**
   * The capture text within the group.
   */
  text: string;
}

/**
 * Takes an empty selection and expands it out to the nearest group not matching
 * the excluded characters.
 *
 * @remarks
 *
 * Can be used to find the nearest selected word. See {@link getSelectedWord}
 *
 * @param state - the editor state or a transaction
 * @param exclude - the regex pattern to exclude
 * @returns false if not a text selection or if no expansion available
 */
export function getSelectedGroup(
  state: EditorState | Transaction,
  exclude: RegExp,
): GetSelectedGroup | undefined {
  if (!isTextSelection(state.selection)) {
    return;
  }

  let { from, to } = state.selection;

  const getChar = (start: number, end: number) =>
    getTextContentFromSlice(
      TextSelection.between(state.doc.resolve(start), state.doc.resolve(end)).content(),
    );

  for (
    let char = getChar(from - 1, from);
    char && !exclude.test(char);
    from--, char = getChar(from - 1, from)
  ) {
    // Step backwards until reaching first excluded character or empty text
    // content.
  }

  for (
    let char = getChar(to, to + 1);
    char && !exclude.test(char);
    to++, char = getChar(to, to + 1)
  ) {
    // Step forwards until reaching the first excluded character or empty text
    // content
  }

  if (from === to) {
    return;
  }

  const text = state.doc.textBetween(from, to, LEAF_NODE_REPLACING_CHARACTER, '\n\n');
  return { from, to, text };
}

/**
 * Retrieves the nearest space separated word from the current selection.
 *
 * @remarks
 *
 * This always expands outward so that given: `The tw<start>o words<end>` The
 * selection would become `The <start>two words<end>`
 *
 * In other words it expands until it meets an invalid character.
 *
 * @param state - the editor state or transaction.
 */
export function getSelectedWord(state: EditorState | Transaction): GetSelectedGroup | undefined {
  return getSelectedGroup(state, /\W/);
}

/**
 * Get matching string from a list or single value
 *
 * @remarks
 * Get attrs can be called with a direct match string or array of string
 * matches. This method should be used to retrieve the required string.
 *
 * The index of the matched array used defaults to 0 but can be updated via the
 * second parameter.
 *
 * @param match - the match(es)
 * @param index - the zero-index point from which to start
 */
export function getMatchString(match: string | string[], index = 0): string {
  const value = isArray(match) ? match[index] : match;

  // Throw an error if value is not defined for the index.
  assert(isString(value), `No match string found for match ${match}`);

  return value ?? '';
}

/**
 * Checks whether the cursor is at the end of the state.doc
 *
 * @param state - the editor state
 */
export function atDocEnd(state: EditorState): boolean {
  return state.doc.nodeSize - state.selection.$to.pos - 2 === state.selection.$to.depth;
}

/**
 * Checks whether the cursor is at the beginning of the state.doc
 *
 * @param state - the editor state
 */
export function atDocStart(state: EditorState): boolean {
  return state.selection.$from.pos === state.selection.$from.depth;
}

/**
 * Get the start position of the parent of the current resolve position
 *
 * @param $pos - the resolved `ProseMirror` position
 */
export function startPositionOfParent($pos: ResolvedPos): number {
  return $pos.start($pos.depth);
}

/**
 * Get the end position of the parent of the current resolve position
 *
 * @param $pos - the resolved `ProseMirror` position
 */
export function endPositionOfParent($pos: ResolvedPos): number {
  return $pos.end($pos.depth) + 1;
}

/**
 * Retrieve the current position of the cursor
 *
 * @param selection - the editor selection
 * @returns a resolved position only when the selection is a text selection
 */
export function getCursor(selection: Selection): ResolvedPos | null | undefined {
  return isTextSelection(selection) ? selection.$cursor : undefined;
}

/**
 * Checks whether a Prosemirror node is the top level `doc` node
 *
 * @param node - the prosemirror node
 * @param schema - the prosemirror schema to check against
 */
export function isDocNode(
  node: ProsemirrorNode | null | undefined,
  schema?: EditorSchema,
): node is ProsemirrorNode {
  if (!isProsemirrorNode(node)) {
    return false;
  }

  if (schema) {
    return node.type === schema.nodes.doc;
  }

  return node.type.name === 'doc';
}

/**
 * Checks whether the passed in JSON is a valid object node
 *
 * @param value - the value to check
 */
export function isRemirrorJSON(value: unknown): value is RemirrorJSON {
  return isObject(value) && value.type === 'doc' && Array.isArray(value.content);
}

/**
 * This type is the combination of all the registered string handlers for the
 * extension. This is used rather than the `StringHandlers` in order to enforce
 * the type signature of the handler method, which isn't possible with the
 * interface.
 */
export type NamedStringHandlers = { [K in keyof Remirror.StringHandlers]: StringHandler };

export interface HandlersProps {
  /**
   * All the available string handlers which have been made available for this
   * editor. Using this allows for composition of [[`StringHandler`]]'s.
   *
   * For example, the markdown string handler first converts the markdown string
   * to html and then uses the html handler to convert the html output to a
   * prosemirror step.
   *
   * Composition for the win.
   */
  handlers: NamedStringHandlers;
}

export interface CreateDocumentNodeProps
  extends SchemaProps,
    Partial<CustomDocumentProps>,
    StringHandlerProps {
  /**
   * The content to render
   */
  content: RemirrorContentType;

  /**
   * The error handler which is called when the JSON passed is invalid.
   */
  onError?: InvalidContentHandler;

  /**
   * The selection that the user should have in the created node.
   *
   * TODO add `'start' | 'end' | number` for a better developer experience.
   */
  selection?: PrimitiveSelection;

  /**
   * When an error is thrown the onError handler is called which can return new
   * content. The new content is recursively checked to see if it is valid. This
   * number is tracks the call depth of the recursive function to prevent it
   * exceeding the maximum.
   *
   * @defaultValue 0
   *
   * @internal
   */
  attempts?: number;
}

/**
 * Return true when the provided value is an anchor / head selection property
 */
export function isAnchorHeadObject(value: unknown): value is AnchorHeadProps {
  return isObject(value) && isNumber(value.anchor) && isNumber(value.head);
}

/**
 * Get the nearest valid selection to the provided selection parameter.
 */
export function getTextSelection(selection: PrimitiveSelection, doc: ProsemirrorNode): Selection {
  const max = doc.nodeSize - 2;
  const min = 0;
  let pos: number | FromToProps | AnchorHeadProps;

  /** Ensure the selection is within the current document range */
  const clampToDocument = (value: number) => clamp({ min, max, value });

  if (isSelection(selection)) {
    return selection;
  }

  if (selection === 'all') {
    return new AllSelection(doc);
  }

  if (selection === 'start') {
    pos = min;
  } else if (selection === 'end') {
    pos = max;
  } else if (isResolvedPos(selection)) {
    pos = selection.pos;
  } else {
    pos = selection;
  }

  if (isNumber(pos)) {
    pos = clampToDocument(pos);

    return TextSelection.near(doc.resolve(pos));
  }

  if (isAnchorHeadObject(pos)) {
    const anchor = clampToDocument(pos.anchor);
    const head = clampToDocument(pos.head);

    return TextSelection.between(doc.resolve(anchor), doc.resolve(head));
  }

  // In this case assume that `from` is the fixed anchor and `to` is the movable
  // head.
  const anchor = clampToDocument(pos.from);
  const head = clampToDocument(pos.to);

  return TextSelection.between(doc.resolve(anchor), doc.resolve(head));
}

/**
 * A function that converts a string into a `ProsemirrorNode`.
 */
export interface StringHandler {
  (params: NodeStringHandlerOptions): ProsemirrorNode;
  (params: FragmentStringHandlerOptions): Fragment;
}

export interface StringHandlerProps {
  /**
   * A function which transforms a string into a prosemirror node.
   *
   * @remarks
   * Can be used to transform markdown / html or any other string format into a
   * prosemirror node.
   *
   * See [[`fromHTML`]] for an example of how this could work.
   */
  stringHandler?: StringHandler;
}

// The maximum attempts to check invalid content before throwing an an error.
const MAX_ATTEMPTS = 3;

/**
 * Creates a document node from the passed in content and schema.
 *
 * @remirror
 *
 * This supports a primitive form of error handling. When an error occurs, the
 * `onError` handler will be called along with the error produced by the Schema
 * and it is up to you as a developer to decide how to transform the invalid
 * content into valid content.
 *
 * Please note that the `onError` is only called when the content is a JSON
 * object. It is not called for a `string`, the `ProsemirrorNode` or the
 * `EditorState`. The reason for this is that the `string` requires a `stringHandler`
 * which is defined by the developer and transforms the content. That is the
 * point that error's should be handled. The editor state and the
 * `ProsemirrorNode` are similar. They need to be created by the developer and
 * as a result, the errors should be handled at the point of creation rather
 * than when the document is being applied to the editor.
 */
export function createDocumentNode(props: CreateDocumentNodeProps): ProsemirrorNode {
  const { content, schema, document, stringHandler, onError, attempts = 0 } = props;

  // If there is an `onError` handler then check the attempts does not exceed
  // the maximum, otherwise only allow one attempt.
  const attemptsRemaining = (onError && attempts <= MAX_ATTEMPTS) || attempts === 0;

  invariant(attemptsRemaining, {
    code: ErrorConstant.INVALID_CONTENT,
    message:
      'The invalid content has been called recursively more than ${MAX_ATTEMPTS} times. The content is invalid and the error handler has not been able to recover properly.',
  });

  if (isString(content)) {
    invariant(stringHandler, {
      code: ErrorConstant.INVALID_CONTENT,
      message: `The string '${content}' was added to the editor, but no \`stringHandler\` was added. Please provide a valid string handler which transforms your content to a \`ProsemirrorNode\` to prevent this error.`,
    });

    const options = { document, content, schema };

    // With string content it is up to you the developer to ensure there are no
    // errors in the produced content.
    return stringHandler(options);
  }

  // If passing in an editor state, it is left to the developer to make sure the
  // state they created is valid.
  if (isEditorState(content)) {
    return content.doc;
  }

  // When passing the prosemirror no error checking is done. Before creating the
  // node you should manually ensure that it is valid.
  if (isProsemirrorNode(content)) {
    return content;
  }

  // At this point the only possible solution is that the content is a json
  // object so we try to convert the json to a valid object.

  try {
    // This will throw an error for invalid content.
    return schema.nodeFromJSON(content);
  } catch (error: any) {
    const details = getInvalidContent({ schema, error, json: content });
    const transformedContent = onError?.(details);

    invariant(transformedContent, {
      code: ErrorConstant.INVALID_CONTENT,
      message: `An error occurred when processing the content. Please provide an \`onError\` handler to process the invalid content: ${JSON.stringify(
        details.invalidContent,
        null,
        2,
      )}`,
    });

    return createDocumentNode({
      ...props,
      content: transformedContent,
      attempts: attempts + 1,
    });
  }
}

/**
 * Checks which environment should be used. Returns true when we are in the dom
 * environment.
 */
export function shouldUseDomEnvironment(): boolean {
  return environment.isBrowser;
}

/**
 * Retrieves the document from global scope and throws an error in a non-browser
 * environment.
 *
 * @internal
 */
export function getDocument(): Document {
  if (typeof document !== 'undefined') {
    return document;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom');
    return new JSDOM().window.document;
  } catch {
    // ignore
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('domino').createDocument();
  } catch {
    // ignore
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('min-document');
  } catch {
    // ignore
  }

  throw new Error(
    'Unable to retrieve the document from the global scope. Maybe you are running Remirror in a non-browser environment? If you are using Node.js, you can install JSDOM or similar to create a fake document and pass it to Remirror.',
  );
}

export interface CustomDocumentProps {
  /**
   * The root or custom document to use when referencing the dom.
   *
   * This can be used to support SSR.
   */
  document: Document;
}

/**
 * Convert a node into its DOM representative
 *
 * @param node - the node to extract html from.
 * @param document - the document to use for the DOM
 */
export function prosemirrorNodeToDom(
  node: ProsemirrorNode,
  document = getDocument(),
): DocumentFragment | HTMLElement {
  const fragment = isDocNode(node, node.type.schema) ? node.content : Fragment.from(node);
  return DOMSerializer.fromSchema(node.type.schema).serializeFragment(fragment, { document });
}

function elementFromString(html: string, document?: Document): HTMLElement {
  const parser = new ((document || getDocument())?.defaultView ?? window).DOMParser();
  return parser.parseFromString(`<body>${html}</body>`, 'text/html').body;
}

/**
 * Convert the provided `node` to a html string.
 *
 * @param node - the node to extract html from.
 * @param document - the document to use for the DOM
 *
 * ```ts
 * import { EditorState, prosemirrorNodeToHtml } from 'remirror';
 *
 * function convertStateToHtml(state: EditorState): string {
 *   return prosemirrorNodeToHtml(state.doc);
 * }
 * ```
 */
export function prosemirrorNodeToHtml(node: ProsemirrorNode, document = getDocument()): string {
  const element = document.createElement('div');
  element.append(prosemirrorNodeToDom(node, document));

  return element.innerHTML;
}

export interface BaseStringHandlerOptions
  extends Partial<CustomDocumentProps>,
    SchemaProps,
    ParseOptions {
  /**
   * The string content provided to the editor.
   */
  content: string;
}

export interface FragmentStringHandlerOptions extends BaseStringHandlerOptions {
  /**
   * When true will create a fragment from the provided string.
   */
  fragment: true;
}

export interface NodeStringHandlerOptions extends BaseStringHandlerOptions {
  fragment?: false;
}

export type StringHandlerOptions = NodeStringHandlerOptions | FragmentStringHandlerOptions;

/**
 * Convert a HTML string into a ProseMirror node. This can be used for the
 * `stringHandler` property in your editor when you want to support html.
 *
 * ```tsx
 * import { htmlToProsemirrorNode } from 'remirror';
 * import { Remirror, useManager } from '@remirror/react';
 *
 * const Editor = () => {
 *   const manager = useManager([]);
 *
 *   return (
 *     <Remirror
 *       stringHandler={htmlToProsemirrorNode}
 *       initialContent='<p>A wise person once told me to relax</p>'
 *     >
 *       <div />
 *     </Remirror>
 *   );
 * }
 * ```
 */
export function htmlToProsemirrorNode(props: FragmentStringHandlerOptions): Fragment;
export function htmlToProsemirrorNode(props: NodeStringHandlerOptions): ProsemirrorNode;
export function htmlToProsemirrorNode(props: StringHandlerOptions): ProsemirrorNode | Fragment {
  const { content, schema, document, fragment = false, ...parseOptions } = props;
  const element = elementFromString(content, document);
  const parser = PMDomParser.fromSchema(schema);

  return fragment
    ? parser.parseSlice(element, { ...defaultParseOptions, ...parseOptions }).content
    : parser.parse(element, { ...defaultParseOptions, ...parseOptions });
}

const defaultParseOptions = { preserveWhitespace: false } as const;

/**
 * A wrapper around `state.doc.toJSON` which returns the state as a
 * `RemirrorJSON` object.
 */
export function getRemirrorJSON(content: EditorState | ProsemirrorNode): RemirrorJSON {
  return isProsemirrorNode(content)
    ? (content.toJSON() as RemirrorJSON)
    : (content.doc.toJSON() as RemirrorJSON);
}

interface IsStateEqualOptions {
  /**
   * Whether to compare the selection of the two states.
   *
   * @defaultValue false
   */
  checkSelection?: boolean;
}

/**
 * Check if two states are equal.
 */
export function areStatesEqual(
  stateA: EditorState,
  stateB: EditorState,
  options: IsStateEqualOptions = {},
): boolean {
  // The states are identical, so they're equal.
  if (stateA === stateB) {
    return true;
  }

  // If the content is different then, no, not equal.
  if (!stateA.doc.eq(stateB.doc)) {
    return false;
  }

  // If we care about selection and selection is not the same, then not equal.
  if (options.checkSelection && !stateA.selection.eq(stateB.selection)) {
    return false;
  }

  // If the schema are not compatible then no, not equal.
  if (!areSchemasCompatible(stateA.schema, stateB.schema)) {
    return false;
  }

  return true;
}

/**
 * Check that the nodes and marks present on `schemaA` are also present on
 * `schemaB`.
 */
export function areSchemasCompatible(schemaA: EditorSchema, schemaB: EditorSchema): boolean {
  if (schemaA === schemaB) {
    return true;
  }

  const marksA = keys(schemaA.marks);
  const marksB = keys(schemaB.marks);
  const nodesA = keys(schemaA.nodes);
  const nodesB = keys(schemaB.nodes);

  if (marksA.length !== marksB.length || nodesA.length !== nodesB.length) {
    return false;
  }

  for (const mark of marksA) {
    // No reverse check needed since we know the keys are unique and the lengths
    // are identical.
    if (!marksB.includes(mark)) {
      return false;
    }
  }

  for (const node of nodesA) {
    // No reverse check needed since we know the keys are unique and the lengths
    // are identical.
    if (!nodesB.includes(node)) {
      return false;
    }
  }

  return true;
}

/**
 * Return attributes for a node excluding those that were provided as extra
 * attributes.
 *
 * @param attrs - The source attributes
 * @param extra - The extra attribute schema for this node
 */
export function omitExtraAttributes<Output extends object = DOMCompatibleAttributes>(
  attrs: ProsemirrorAttributes,
  extra: ApplySchemaAttributes,
): Omit<Output, keyof Remirror.Attributes> {
  const extraAttributeNames = keys(extra.defaults());
  return omit({ ...attrs }, extraAttributeNames) as Output;
}

/**
 * Take the `style` string attribute and combine it with the provided style
 * object.
 */
export function joinStyles(styleObject: object, initialStyles?: string): string {
  let start = '';

  if (initialStyles) {
    start = `${initialStyles.trim()}`;
  }

  const end = cssifyObject(styleObject as StyleObject);

  if (!end) {
    return start;
  }

  const separator = start.endsWith(';') ? ' ' : ' ';
  return `${start}${separator}${end}`;
}

interface TextBetweenProps extends FromToProps {
  /**
   * The prosemirror `doc` node.
   */
  doc: ProsemirrorNode;
}

interface TextBetween extends PosProps, TextProps {}

/**
 * Find the different ranges of text between a provided range with support for
 * traversing multiple nodes.
 */
export function textBetween(props: TextBetweenProps): TextBetween[] {
  const { from, to, doc } = props;
  const positions: TextBetween[] = [];

  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !node.text) {
      return;
    }

    const offset = Math.max(from, pos) - pos;
    positions.push({
      pos: pos + offset,
      text: node.text.slice(offset, to - pos),
    });
  });

  return positions;
}

/**
 * Get the full range of the selectable content in the ProseMirror `doc`.
 */
export function getDocRange(doc: ProsemirrorNode): FromToProps {
  const { from, to } = new AllSelection(doc);
  return { from, to };
}

/**
 * A description of an invalid content block (representing a node or a mark).
 */
export interface InvalidContentBlock {
  /**
   * The type of content that is invalid.
   */
  type: 'mark' | 'node';

  /**
   * The name of the node or mark that is invalid.
   */
  name: string;

  /**
   * The json path to the invalid part of the `RemirrorJSON` object.
   */
  path: Array<string | number>;

  /**
   * Whether this block already has an invalid parent node. Invalid blocks are
   * displayed from the deepest content outward. By checking whether a parent
   * has already been identified as invalid you can choose to only transform the
   * root invalid node.
   */
  invalidParentNode: boolean;

  /**
   * Whether this block has any invalid wrapping marks.
   */
  invalidParentMark: boolean;
}

/**
 * This interface is used when there is an attempt to add content to a schema
 */
export interface InvalidContentHandlerProps {
  /**
   * The JSON representation of the content that caused the error.
   */
  json: RemirrorJSON;

  /**
   * The list of invalid nodes and marks.
   */
  invalidContent: InvalidContentBlock[];

  /**
   * The error that was thrown.
   */
  error: Error;

  /**
   * Transformers can be used to apply certain strategies for dealing with
   * invalid content.
   */
  transformers: typeof transformers;
}

/**
 * The error handler function which should return a valid content type to
 * prevent further errors.
 */
export type InvalidContentHandler = (props: InvalidContentHandlerProps) => RemirrorContentType;

const transformers = {
  /**
   * Remove every invalid block from the editor. This is a destructive action
   * and should only be applied if you're sure it's the best strategy.
   *
   * @param json - the content as a json object.
   * @param invalidContent - the list of invalid items as passed to the error
   * handler.
   */
  remove(json: RemirrorJSON, invalidContent: InvalidContentBlock[]): RemirrorJSON {
    let newJSON = json;

    for (const block of invalidContent) {
      if (block.invalidParentNode) {
        continue;
      }

      newJSON = unset(block.path, newJSON) as RemirrorJSON;
    }

    return newJSON;
  },
};

type GetInvalidContentProps<Extra extends object> = SchemaProps & {
  /**
   * The RemirrorJSON representation of the invalid content.
   */
  json: RemirrorJSON;
} & Extra;

type GetInvalidContentReturn<Extra extends object> = Omit<InvalidContentHandlerProps, 'error'> &
  Extra;

/**
 * Get the invalid parameter which is passed to the `onError` handler.
 */
export function getInvalidContent<Extra extends object>({
  json,
  schema,
  ...extra
}: GetInvalidContentProps<Extra>): GetInvalidContentReturn<Extra> {
  const validMarks = new Set(keys(schema.marks));
  const validNodes = new Set(keys(schema.nodes));
  const invalidContent = checkForInvalidContent({ json, path: [], validNodes, validMarks });

  return { json, invalidContent, transformers, ...extra } as GetInvalidContentReturn<Extra>;
}

interface CheckForInvalidContentProps {
  json: RemirrorJSON;
  validMarks: Set<string>;
  validNodes: Set<string>;
  path?: string[];
  invalidParentNode?: boolean;
  invalidParentMark?: boolean;
}

/**
 * Get the invalid content from the `RemirrorJSON`.
 */
function checkForInvalidContent(props: CheckForInvalidContentProps): InvalidContentBlock[] {
  const { json, validMarks, validNodes, path = [] } = props;
  const valid = { validMarks, validNodes };
  const invalidNodes: InvalidContentBlock[] = [];
  const { type, marks, content } = json;
  let { invalidParentMark = false, invalidParentNode = false } = props;

  if (marks) {
    const invalidMarks: InvalidContentBlock[] = [];

    for (const [index, mark] of marks.entries()) {
      const name = isString(mark) ? mark : mark.type;

      if (validMarks.has(name)) {
        continue;
      }

      invalidMarks.unshift({
        name,
        path: [...path, 'marks', `${index}`],
        type: 'mark',
        invalidParentMark,
        invalidParentNode,
      });

      invalidParentMark = true;
    }

    invalidNodes.push(...invalidMarks);
  }

  if (!validNodes.has(type)) {
    invalidNodes.push({
      name: type,
      type: 'node',
      path,
      invalidParentMark,
      invalidParentNode,
    });

    invalidParentNode = true;
  }

  if (content) {
    const invalidContent: InvalidContentBlock[] = [];

    for (const [index, value] of content.entries()) {
      invalidContent.unshift(
        ...checkForInvalidContent({
          ...valid,
          json: value,
          path: [...path, 'content', `${index}`],
          invalidParentMark,
          invalidParentNode,
        }),
      );
    }

    invalidNodes.unshift(...invalidContent);
  }

  return invalidNodes;
}

/**
 * Checks that the selection is an empty text selection at the end of its parent
 * node.
 */
export function isEndOfTextBlock(selection: Selection): selection is TextSelection {
  return !!(
    isTextSelection(selection) &&
    selection.$cursor &&
    selection.$cursor.parentOffset >= selection.$cursor.parent.content.size
  );
}

/**
 * Checks that the selection is an empty text selection at the start of its
 * parent node.
 */
export function isStartOfTextBlock(selection: Selection): selection is TextSelection {
  return !!(isTextSelection(selection) && selection.$cursor && selection.$cursor.parentOffset <= 0);
}

/**
 * Returns true when the selection is a text selection at the start of the
 * document.
 */
export function isStartOfDoc(selection: Selection): boolean {
  const selectionAtStart = PMSelection.atStart(selection.$anchor.doc);
  return !!(isStartOfTextBlock(selection) && selectionAtStart.anchor === selection.anchor);
}

declare global {
  namespace Remirror {
    /**
     * This interface provides all the named string handlers. The key is the
     * only part that's used meaning the value isn't important. However, it's
     * conventional to use the Extension for the value.
     */
    interface StringHandlers {}
  }
}
