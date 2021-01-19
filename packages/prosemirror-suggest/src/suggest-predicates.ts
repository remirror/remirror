import { TextSelection } from 'prosemirror-state';
import { includes, isObject, isString } from '@remirror/core-helpers';

import type {
  CompareMatchProps,
  EditorSchema,
  SelectionProps,
  SuggestMatch,
  SuggestReasonMap,
  SuggestStateMatchProps,
} from './suggest-types';
import { ChangeReason, ExitReason } from './suggest-types';

/**
 * Is this a change in the current suggestion (added or deleted characters)?
 */
export function isChange<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
): compare is CompareMatchProps<Schema> {
  return !!(compare.prev && compare.next && compare.prev.text.full !== compare.next.text.full);
}

/**
 * Is this is a repetition of the same check?
 */
export function isIdentical<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
  match: SuggestReasonMap<Schema>,
): compare is CompareMatchProps<Schema> {
  return !!(
    compare.prev &&
    compare.next &&
    compare.prev.text.full === compare.next.text.full &&
    match.change &&
    !match.exit
  );
}

/**
 * Has the cursor moved within the current suggestion (added or deleted
 * characters)?
 */
export function isMove<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
): compare is CompareMatchProps<Schema> {
  return !!(
    compare.prev &&
    compare.next &&
    compare.prev.range.cursor !== compare.next.range.cursor
  );
}

/**
 * Are we entering a new suggestion?
 */
export function isEntry<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
): compare is Pick<CompareMatchProps<Schema>, 'next'> {
  return !!(!compare.prev && compare.next);
}

/**
 * Are we exiting a suggestion?
 */
export function isExit<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
): compare is Pick<CompareMatchProps<Schema>, 'prev'> {
  return !!(compare.prev && !compare.next);
}

/**
 * Is this a jump from one suggestion to another?
 */
export function isJump<Schema extends EditorSchema = EditorSchema>(
  compare: Partial<CompareMatchProps<Schema>>,
): compare is CompareMatchProps<Schema> {
  return !!(compare.prev && compare.next && compare.prev.range.from !== compare.next.range.from);
}

/**
 * Check that the passed in value is an [[`ExitReason`]].
 */
export function isExitReason(value: unknown): value is ExitReason {
  return isString(value) && Object.values(ExitReason).includes(value as ExitReason);
}

/**
 * Check that that the passed in value is a [[`ChangeReason`]].
 */
export function isChangeReason(value: unknown): value is ChangeReason {
  return isString(value) && Object.values(ChangeReason).includes(value as ChangeReason);
}

const selectionExitReasons = [
  ExitReason.MoveEnd,
  ExitReason.MoveStart,
  ExitReason.SelectionOutside,
  ExitReason.JumpForward,
  ExitReason.JumpBackward,
] as const;

/**
 * An exit which is caused by a change in the selection and no other change in
 * the document.
 */
export function isSelectionExitReason(
  value: unknown,
): value is typeof selectionExitReasons[number] {
  return includes(selectionExitReasons, value);
}

const selectionChangeReasons = [
  ChangeReason.JumpBackward,
  ChangeReason.JumpForward,
  ChangeReason.Move,
  ChangeReason.SelectionInside,
] as const;

export function isSelectionChangeReason(
  value: unknown,
): value is typeof selectionChangeReasons[number] {
  return includes(selectionChangeReasons, value);
}

/**
 * Checks that the reason passed is a split reason. This typically means that we
 * should default to a partial update / creation of the mention.
 */
export function isSplitReason(value?: unknown): value is ExitReason.Split {
  return value === ExitReason.Split;
}

/**
 * Checks that the reason was caused by a split at a point where there is no
 * query.
 */
export function isInvalidSplitReason(value?: unknown): value is ExitReason.InvalidSplit {
  return value === ExitReason.InvalidSplit;
}

/**
 * Checks that the reason was caused by a deletion.
 */
export function isRemovedReason(value?: unknown): value is ExitReason.Removed {
  return value === ExitReason.Removed;
}

// Constants for the jump reasons
const exitJump = [ExitReason.JumpBackward, ExitReason.JumpForward] as const;
const changeJump = [ChangeReason.JumpBackward, ChangeReason.JumpForward] as const;

/**
 * Checks to see if this is a jump reason.
 */
export function isJumpReason<Schema extends EditorSchema = EditorSchema>(
  map: SuggestReasonMap<Schema>,
): map is Required<SuggestReasonMap<Schema>> {
  return includes(exitJump, map.exit?.exitReason) || includes(changeJump, map.change?.changeReason);
}

/**
 * True when the match is currently active (i.e. it's query has a value)
 */
export function isValidMatch<Schema extends EditorSchema = EditorSchema>(
  match: SuggestMatch<Schema> | undefined,
): match is SuggestMatch<Schema> {
  return !!(match && match.query.full.length >= match.suggester.matchOffset);
}

/**
 * True when the current selection is outside the match.
 */
export function selectionOutsideMatch<Schema extends EditorSchema = EditorSchema>(
  props: Partial<SuggestStateMatchProps<Schema>> & SelectionProps<Schema>,
): boolean {
  const { match, selection } = props;
  return !!match && (selection.from < match.range.from || selection.from > match.range.to);
}

/**
 * Predicate checking whether the selection is a `TextSelection`.
 *
 * @param value - the value to check
 */
export function isTextSelection<Schema extends EditorSchema = EditorSchema>(
  value: unknown,
): value is TextSelection<Schema> {
  return isObject(value) && value instanceof TextSelection;
}
