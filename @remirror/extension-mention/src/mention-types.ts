import { CustomHandler, Handler, ProsemirrorAttributes, Static } from '@remirror/core';
import {
  FromToEndParameter,
  SuggestChangeHandlerMethod,
  SuggestCharacterEntryMethod,
  SuggestExitHandlerMethod,
  Suggestion,
  SuggestKeyBindingMap,
  SuggestReplacementType,
} from '@remirror/pm/suggest';

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
export interface MentionOptions {
  /**
   * Provide a custom tag for the mention
   */
  mentionTag?: Static<string>;

  /**
   * Provide the custom matchers that will be used to match mention text in the
   * editor.
   */
  matchers: Static<MentionExtensionMatcher[]>;

  /**
   * Text to append after the mention has been added.
   *
   * @defaultValue ''
   */
  appendText?: string;
  /**
   * Tag for the prosemirror decoration which wraps an active match.
   *
   * @defaultValue 'span'
   */
  suggestTag?: string;

  /**
   * When true, decorations are not created when this mention is being edited..
   */
  noDecorations?: boolean;

  /**
   * Called whenever a suggestion becomes active or changes in any way.
   *
   * @remarks
   *
   * It receives a parameters object with the `reason` for the change for more
   * granular control.
   *
   * @defaultValue `() => void`
   */
  onChange?: Handler<MentionChangeHandlerMethod>;

  /**
   * Called whenever a suggestion is exited with the pre-exit match value.
   *
   * @remarks
   *
   * Can be used to force the command to run the command e.g. when no match was
   * found but a tag should still be created. To accomplish this you would call
   * the `command` parameter and trigger whatever action is felt required.
   *
   * @defaultValue `() => void`
   */
  onExit?: Handler<MentionExitHandlerMethod>;

  /**
   * Called for each character entry and can be used to disable certain
   * characters.
   *
   * @remarks
   *
   * For example you may want to disable all `@` symbols while the suggester is
   * active. Return `true` to prevent any further character handlers from
   * running.
   *
   * @defaultValue `() => false`
   */
  onCharacterEntry?: CustomHandler<MentionCharacterEntryMethod>;

  /**
   * An object that describes how certain key bindings should be handled.
   *
   * @remarks
   *
   * Return `true` to prevent any further prosemirror actions or return `false`
   * to allow prosemirror to continue.
   */
  keyBindings?: CustomHandler<MentionKeyBinding>;
}

/**
 * The dynamic properties used to change the behaviour of the mentions created.
 */

export type SuggestionCommandAttributes = ProsemirrorAttributes<
  Partial<Pick<MentionExtensionAttributes, 'id' | 'label' | 'appendText' | 'replacementType'>>
>;

/**
 * The attrs for the command on a mention extension.
 */
export type MentionExtensionSuggestCommand = (attrs: SuggestionCommandAttributes) => void;
export type MentionKeyBinding = SuggestKeyBindingMap<MentionExtensionSuggestCommand>;
export type MentionChangeHandlerMethod = SuggestChangeHandlerMethod<MentionExtensionSuggestCommand>;
export type MentionExitHandlerMethod = SuggestExitHandlerMethod<MentionExtensionSuggestCommand>;
export type MentionCharacterEntryMethod = SuggestCharacterEntryMethod<
  MentionExtensionSuggestCommand
>;
