import { includes, ProsemirrorAttributes, Static } from '@remirror/core';
import { ExtensionTextCaseMessages as Messages } from '@remirror/messages';

export const toggleTextCaseOptions: Remirror.CommandDecoratorOptions = {
  icon: 'fontSize2',
  label: ({ t }) => t(Messages.TOGGLE_LABEL),
};

export const TEXT_CASE_ATTRIBUTE = 'data-text-case';

const VALID_CASING = ['upper', 'lower', 'upper', 'capitalize', 'smallCaps'];

export function isValidCasing(value: unknown): value is Exclude<Casing, 'none'> {
  return includes(VALID_CASING, value);
}

export interface TextCaseOptions {
  /**
   * The default casing to toggle between.
   *
   * @default 'upper'
   */
  defaultCasing?: Static<Casing>;
}

export type Casing = 'none' | 'upper' | 'lower' | 'upper' | 'capitalize' | 'smallCaps';
export type TextCaseAttributes = ProsemirrorAttributes<{
  /**
   * The active text case for the
   */
  casing: Casing | null | undefined;
}>;
