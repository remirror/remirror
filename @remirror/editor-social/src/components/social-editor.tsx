import { Attrs, deepMerge, omit, RemirrorTheme } from '@remirror/core';
import { NodeCursorExtension, PlaceholderExtension } from '@remirror/core-extensions';
import { EmojiExtension, isBaseEmoji } from '@remirror/extension-emoji';
import { EnhancedLinkExtension } from '@remirror/extension-enhanced-link';
import {
  MentionExtension,
  MentionExtensionOptions,
  OptionalSuggestionMatcher,
  SuggestionCallback,
  SuggestionKeyBindingMap,
  SuggestionKeyBindingParams,
  SuggestionStateMatch,
} from '@remirror/extension-mention';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager } from '@remirror/react';
import { RemirrorThemeProvider } from '@remirror/ui';
import React, { createRef, PureComponent } from 'react';
import { socialEditorTheme } from '../social-theme';
import {
  ActiveTagData,
  ActiveUserData,
  MatchName,
  MentionState,
  OnMentionChangeParams,
  SocialEditorProps,
} from '../social-types';
import { calculateNewIndexFromArrowPress, mapToActiveIndex } from '../social-utils';
import { EmojiPickerProps } from './social-emoji-picker-component';
import { SocialEditorComponent } from './social-wrapper-component';

interface State {
  activeMatcher: MatchName | undefined;
  activeIndex: number;
  emojiPickerActive: boolean;
  hideSuggestions: boolean;
}

/**
 * These are the matchers
 */
const matchers: OptionalSuggestionMatcher[] = [{ name: 'at', char: '@' }, { name: 'tag', char: '#' }];

export class SocialEditor extends PureComponent<SocialEditorProps, State> {
  public static defaultProps = {
    theme: { colors: {}, font: {} },
    emojiSet: 'social',
    placeholder: "What's happening?",
  };

  public readonly state: State = {
    activeIndex: 0,
    emojiPickerActive: false,
    activeMatcher: undefined,
    hideSuggestions: false,
  };

  /**
   * The ref for the element that toggles the emoji picker display.
   */
  private toggleEmojiRef = createRef<HTMLButtonElement>();

  /**
   * The mention information
   */
  private mention: SuggestionStateMatch | undefined;

  /**
   * This keeps track of when an exit was triggered by an internal command.
   * For example when the enter key is pressed to select a suggestion this should be set to
   * true so that the subsequent `onExit` call can be ignored.
   */
  private exitTriggeredInternally = false;

  /**
   * Create the arrow bindings.
   */
  private createArrowBindings = (direction: 'up' | 'down') => ({
    query,
    name,
  }: SuggestionKeyBindingParams) => {
    const { activeIndex: prevIndex, hideSuggestions } = this.state;
    const { onMentionChange: onMentionStateChange } = this.props;

    const matches = name === 'at' ? this.users : this.tags;

    if (hideSuggestions || !matches.length) {
      return false;
    }

    // pressed up arrow
    const activeIndex = calculateNewIndexFromArrowPress({
      direction,
      matchLength: matches.length,
      prevIndex,
    });

    this.setState({ activeIndex, activeMatcher: name as MatchName });
    onMentionStateChange({ name, query: query.full, activeIndex } as OnMentionChangeParams);

    return true;
  };

  /**
   * These are the keyBindings for mentions extension. This allows for overriding
   */
  private keyBindings: SuggestionKeyBindingMap = {
    /**
     * Handle the enter key being pressed
     */
    Enter: ({ name, command, char }) => {
      const { activeIndex, hideSuggestions } = this.state;

      if (hideSuggestions) {
        return false;
      }

      const id =
        name === 'at' && this.users.length
          ? this.users[activeIndex].username
          : name === 'tag' && this.tags.length
          ? this.tags[activeIndex].tag
          : undefined;

      // Check if a matching id exists because the user has selected something.
      if (!id) {
        return false;
      }

      this.setExitTriggeredInternally();
      command({
        replacementType: 'full',
        id,
        label: `${char}${id}`,
        role: 'presentation',
        href: `/${id}`,
      });

      return true;
    },

    /**
     * Hide the suggestions when the escape key is pressed.
     */
    Escape: ({ name }) => {
      const matches = name === 'at' ? this.users : this.tags;

      if (!matches.length) {
        return false;
      }

      this.setState({ hideSuggestions: true });
      return true;
    },

    /**
     * Handle the up arrow being pressed
     */
    ArrowUp: this.createArrowBindings('up'),

    /**
     * Handle the down arrow being pressed
     */
    ArrowDown: this.createArrowBindings('down'),
  };

  /**
   * The list of users that match the current query
   */
  private get users(): ActiveUserData[] {
    return mapToActiveIndex(this.props.userData, this.state.activeIndex);
  }

  /**
   * The list of tags which match the current query
   */
  private get tags(): ActiveTagData[] {
    return mapToActiveIndex(this.props.tagData, this.state.activeIndex);
  }

  /**
   * The props which are passed down into the internal remirror editor.
   */
  private get remirrorProps() {
    return omit(this.props, ['userData', 'tagData', 'onMentionChange', 'theme']);
  }

  /**
   * Retrieves the mention property and can be passed down into child components.
   *
   * This is defined here and now as a part of state because we don't actually need to rerender the component
   * when the query or suggestion state changes. We only need this in children components when clicking on the
   * suggestion so that
   */
  private getMention = () => {
    if (!this.mention) {
      throw new Error('There is currently no mention data available');
    }
    return this.mention;
  };

  /**
   * The is the callback for when a suggestion is changed.
   */
  private onChange: SuggestionCallback = params => {
    const { query, name } = params;

    if (name) {
      const props = {
        name,
        query: query.full,
      } as MentionState;
      this.props.onMentionChange({ ...props, activeIndex: this.state.activeIndex });
    }

    // Reset the active index so that the dropdown is back to the top.
    this.setState({ activeIndex: 0, activeMatcher: name as MatchName, hideSuggestions: false });
    this.mention = params;
  };

  /**
   * Called when the none of our configured matchers match
   */
  private onExit: Required<MentionExtensionOptions>['onExit'] = ({ query, command }) => {
    // Check whether we've manually caused this exit. If not, trigger the command.
    if (!this.exitTriggeredInternally) {
      command({
        role: 'presentation',
        href: `/${query.full}`,
        appendText: '',
      });
    }

    this.props.onMentionChange(undefined);
    this.setState({ activeIndex: 0, activeMatcher: undefined });
    this.mention = undefined;
    this.exitTriggeredInternally = false;
  };

  /**
   * Called when an emoji is selected in order to insert the emoji at the current cursor position.
   */
  private onSelectEmoji = (command: (attrs: Attrs) => void): EmojiPickerProps['onSelection'] => emoji => {
    if (isBaseEmoji(emoji)) {
      command({
        id: emoji.id,
        name: emoji.name,
        native: emoji.native,
        colors: emoji.colons,
        skin: String(emoji.skin || ''),
      });
    }
  };

  /**
   * Called when the smiley emoji is clicked ans toggles the activity status of the emoji picker.
   */
  private onClickEmojiSmiley = () => {
    this.setState(prevState => ({ emojiPickerActive: !prevState.emojiPickerActive }));
  };

  /**
   * Called when the emoji picker loses focus so that it can hidden.
   */
  private onBlurEmojiPicker = () => {
    this.setState({ emojiPickerActive: false });
  };

  private get theme(): RemirrorTheme {
    return deepMerge(socialEditorTheme, this.props.theme || {});
  }

  /**
   * Identifies the next exit as one which can be ignored.
   */
  private setExitTriggeredInternally = () => {
    this.exitTriggeredInternally = true;
  };

  public render() {
    const { emojiPickerActive, activeMatcher, hideSuggestions } = this.state;
    const { children, placeholder, ...rest } = this.remirrorProps;
    return (
      <RemirrorThemeProvider theme={this.theme}>
        <RemirrorManager>
          <RemirrorExtension
            Constructor={PlaceholderExtension}
            placeholderStyle={{
              color: '#aab8c2',
              fontStyle: 'normal',
              position: 'absolute',
              fontWeight: 300,
              letterSpacing: '0.5px',
            }}
            placeholder={placeholder}
          />

          <RemirrorExtension Constructor={NodeCursorExtension} />
          <RemirrorExtension
            Constructor={MentionExtension}
            matchers={matchers}
            extraAttrs={['href', ['role', 'presentation']]}
            onChange={this.onChange}
            onExit={this.onExit}
            keyBindings={this.keyBindings}
          />
          <RemirrorExtension Constructor={EnhancedLinkExtension} onUrlsChange={this.props.onUrlsChange} />
          <RemirrorExtension
            Constructor={EmojiExtension}
            set={this.props.emojiSet}
            emojiData={this.props.emojiData}
          />
          <ManagedRemirrorProvider {...rest}>
            <>
              <SocialEditorComponent
                hideSuggestions={hideSuggestions}
                activeMatcher={activeMatcher}
                setExitTriggeredInternally={this.setExitTriggeredInternally}
                getMention={this.getMention}
                emojiPickerActive={emojiPickerActive}
                onBlurEmojiPicker={this.onBlurEmojiPicker}
                emojiData={this.props.emojiData}
                emojiSet={this.props.emojiSet}
                ignoredElements={[this.toggleEmojiRef.current!]}
                onClickEmojiSmiley={this.onClickEmojiSmiley}
                toggleEmojiRef={this.toggleEmojiRef}
                users={this.users}
                tags={this.tags}
                onSelectEmoji={this.onSelectEmoji}
              />
              {children}
            </>
          </ManagedRemirrorProvider>
        </RemirrorManager>
      </RemirrorThemeProvider>
    );
  }
}
