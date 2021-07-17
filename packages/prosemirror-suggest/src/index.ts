/**
 * Primitives for building your prosemirror suggestion and autocomplete
 * functionality.
 *
 * @module
 */

export {
  addSuggester,
  getSuggestPluginState,
  ignoreUpdateForSuggest,
  removeSuggester,
  suggest,
} from './suggest-plugin';
export {
  isChangeReason,
  isExitReason,
  isInvalidSplitReason,
  isJumpReason,
  isRemovedReason,
  isSelectionChangeReason,
  isSelectionExitReason,
  isSplitReason,
  isValidMatch,
  selectionOutsideMatch,
} from './suggest-predicates';
export type { SuggestState } from './suggest-state';
export * from './suggest-types';
export {
  createRegexFromSuggester,
  DEFAULT_SUGGESTER,
  findFromSuggesters,
  getSuggesterWithDefaults,
  IGNORE_SUGGEST_META_KEY,
  markActiveInRange,
  positionHasMarks,
  rangeHasMarks,
} from './suggest-utils';
