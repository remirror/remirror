import { ProsemirrorAttributes } from '@remirror/core';
import { FromToEndParameter, Suggestion, SuggestReplacementType } from '@remirror/pm/suggest';

export interface OptionalMentionExtensionParameter {
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
  range?: FromToEndParameter;
}

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export type MentionExtensionAttributes = ProsemirrorAttributes<
  OptionalMentionExtensionParameter & {
    /**
     * A unique identifier for the suggesters node
     */
    id: string;

    /**
     * The text to be placed within the suggesters node
     */
    label: string;
  }
>;

/**
 * The options for the matchers which can be created by this extension.
 */
export interface MentionExtensionMatcher
  extends Pick<
    Suggestion,
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
 * The static settings passed into a mention
 */
export interface MentionExtensionSettings {
  /**
   * Provide a custom tag for the mention
   */
  mentionTag?: string;

  /**
   * Provide the custom matchers that will be used to match mention text in the
   * editor.
   */
  matchers: MentionExtensionMatcher[];
}

/**
 * The dynamic properties used to change the behaviour of the mentions created.
 */
export interface MentionExtensionProperties
  extends Pick<
    Suggestion<MentionExtensionSuggestCommand>,
    | 'suggestTag'
    | 'noDecorations'
    | 'onChange'
    | 'onExit'
    | 'onCharacterEntry'
    | 'keyBindings'
    | 'appendText'
  > {}

export type SuggestionCommandAttributes = ProsemirrorAttributes<
  Partial<Pick<MentionExtensionAttributes, 'id' | 'label' | 'appendText' | 'replacementType'>>
>;

/**
 * The attrs for the command on a mention extension.
 */
export type MentionExtensionSuggestCommand = (attrs: SuggestionCommandAttributes) => void;
