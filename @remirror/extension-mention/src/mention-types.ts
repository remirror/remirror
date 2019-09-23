import { Attrs, MarkExtensionOptions } from '@remirror/core';
import { SuggestReplacementType, Suggester, FromToEndParams } from 'prosemirror-suggest';

export interface OptionalMentionExtensionParams {
  /**
   * The text to append to the replacement.
   *
   * @defaultValue ''
   */
  appendText?: string;

  /**
   * The type of replacement to use. By default the command will only replace text up the the cursor position.
   *
   * To force replacement of the whole match regardless of where in the match the cursor is placed set this to
   * `full`.
   *
   * @defaultValue 'full'
   */
  replacementType?: SuggestReplacementType;

  /**
   * The name of the matched char
   */
  name?: string;

  /**
   * The range of the requested selection.
   */
  range?: FromToEndParams;
}

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export type MentionExtensionAttrs = Attrs<
  OptionalMentionExtensionParams & {
    /**
     * A unique identifier for the suggestions node
     */
    id: string;

    /**
     * The text to be placed within the suggestions node
     */
    label: string;
  }
>;

/**
 * The options for the matchers which can be created by this extension.
 */
export interface MentionExtensionMatcher
  extends Pick<
    Suggester,
    | 'char'
    | 'name'
    | 'startOfLine'
    | 'supportedCharacters'
    | 'validPrefixCharacters'
    | 'invalidPrefixCharacters'
    | 'matchOffset'
    | 'appendText'
    | 'suggestClassName'
  > {
  /**
   * Provide customs class names for the completed mention
   */
  mentionClassName?: string;
}

/**
 * The options passed into a mention
 */
export interface MentionExtensionOptions
  extends MarkExtensionOptions,
    Pick<
      Suggester<MentionExtensionSuggestCommand>,
      'suggestTag' | 'ignoreDecorations' | 'onChange' | 'onExit' | 'onCharacterEntry' | 'keyBindings'
    > {
  /**
   * Provide a custom matcher with options
   */
  matchers: MentionExtensionMatcher[];

  /**
   * Provide a custom tag for the mention
   */
  mentionTag?: string;
}

export type SuggestionCommandAttrs = Attrs<
  Partial<Pick<MentionExtensionAttrs, 'id' | 'label' | 'appendText' | 'replacementType'>>
>;

/**
 * The attrs for the command on a mention extension.
 */
export type MentionExtensionSuggestCommand = (attrs: SuggestionCommandAttrs) => void;
