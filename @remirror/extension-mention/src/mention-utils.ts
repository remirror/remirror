import { bool, Attrs, isPlainObject, pick, isString } from '@remirror/core';
import { MentionExtensionAttrs, MentionExtensionMatcher } from './mention-types';
import { DEFAULT_SUGGESTER } from 'prosemirror-suggest';

/**
 * The default matcher to use when none is provided in options
 */
export const DEFAULT_MATCHER = {
  ...pick(DEFAULT_SUGGESTER, [
    'startOfLine',
    'supportedCharacters',
    'validPrefixCharacters',
    'invalidPrefixCharacters',
    'appendText',
    'suggestClassName',
  ]),
  appendText: ' ',
  matchOffset: 1,
  mentionClassName: 'mention',
};

/**
 * Check that the attributes exist and are valid for the mention update
 * command method.
 */
export const isValidMentionAttrs = (attrs?: Attrs): attrs is MentionExtensionAttrs =>
  bool(attrs && isPlainObject(attrs) && attrs.id && attrs.label);

/**
 * Gets the matcher from the list of matchers if it exists.
 *
 * @param name - the name of the matcher to find
 * @param matchers - the list of matchers to search through
 */
export const getMatcher = (name: string, matchers: MentionExtensionMatcher[]) => {
  const matcher = matchers.find(matcher => matcher.name === name);
  return matcher ? { ...DEFAULT_MATCHER, ...matcher } : undefined;
};

/**
 * Get the append text value which needs to be handled carefully since it can
 * also be an empty string.
 */
export const getAppendText = (preferred: string | undefined, fallback: string | undefined) => {
  if (isString(preferred)) return preferred;
  if (isString(fallback)) return fallback;
  return DEFAULT_MATCHER.appendText;
};
