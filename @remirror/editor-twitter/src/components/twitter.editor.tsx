import { Attrs, omit } from '@remirror/core';
import { CompositionExtension, NodeCursorExtension } from '@remirror/core-extensions';
import { EmojiExtension, EmojiExtensionOptions, isBaseEmoji } from '@remirror/extension-emoji';
import { EnhancedLinkExtension, EnhancedLinkExtensionOptions } from '@remirror/extension-enhanced-link';
import {
  MentionExtension,
  MentionExtensionOptions,
  OptionalSuggestionMatcher,
  SuggestionCallback,
  SuggestionKeyBindingMap,
  SuggestionStateMatch,
} from '@remirror/extension-mention';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager } from '@remirror/react';
import deepMerge from 'deepmerge';
import { ThemeProvider } from 'emotion-theming';
import React, { createRef, PureComponent } from 'react';
import { twitterEditorTheme, TwitterEditorTheme } from '../twitter-theme';
import {
  ActiveTagData,
  ActiveUserData,
  MatchName,
  OnMentionChangeParams,
  TwitterEditorProps,
} from '../twitter-types';
import { TwitterEditorComponent } from './editor';
import { EmojiPickerProps } from './emoji-picker';

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

export class TwitterEditor extends PureComponent<TwitterEditorProps, State> {
  public static defaultProps = {
    theme: { colors: {}, font: {} },
    emojiSet: 'twitter',
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
  private toggleEmojiRef = createRef<HTMLElement>();

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
   * These are the keyBindings for mentions extension. This allows for overriding
   */
  private keyBindings: SuggestionKeyBindingMap = {
    /**
     * Handle the enter key being pressed
     */
    Enter: ({ name, command }) => {
      const { activeIndex, hideSuggestions } = this.state;

      if (hideSuggestions) {
        return false;
      }

      if (name === 'at' && this.users.length) {
        const { username } = this.users[activeIndex];
        this.setExitTriggeredInternally();
        command({
          replacementType: 'full',
          id: username,
          label: `@${username}`,
          role: 'presentation',
          href: `/${username}`,
        });

        return true;
      }

      if (name === 'tag' && this.tags.length) {
        const { tag } = this.tags[activeIndex];

        this.setExitTriggeredInternally();
        command({
          replacementType: 'full',
          id: tag,
          label: `#${tag}`,
          role: 'presentation',
          href: `/search?query=${tag}`,
        });

        return true;
      }

      return false;
    },

    /**
     * Handle the up arrow being pressed
     */
    ArrowUp: ({ query, name }) => {
      const { activeIndex: prevIndex, hideSuggestions } = this.state;
      const { onMentionChange: onMentionStateChange } = this.props;

      const matches = name === 'at' ? this.users : this.tags;

      if (hideSuggestions || !matches.length) {
        return false;
      }

      // pressed up arrow
      const activeIndex = prevIndex - 1 < 0 ? matches.length - 1 : prevIndex - 1;

      this.setState({ activeIndex, activeMatcher: name as MatchName });
      onMentionStateChange({ name, query: query.full, activeIndex } as OnMentionChangeParams);

      return true;
    },

    /**
     * Handle the down arrow being pressed
     */
    ArrowDown: ({ query, name }) => {
      const { activeIndex: prevIndex, hideSuggestions } = this.state;
      const { onMentionChange: onMentionStateChange } = this.props;
      const matches = name === 'at' ? this.users : this.tags;

      if (hideSuggestions || !matches.length) {
        return false;
      }

      const activeIndex = prevIndex + 1 > matches.length - 1 ? 0 : prevIndex + 1;

      this.setState({ activeIndex, activeMatcher: name as MatchName });
      onMentionStateChange({ name, query: query.full, activeIndex } as OnMentionChangeParams);

      return true;
    },

    Escape: ({ name }) => {
      const matches = name === 'at' ? this.users : this.tags;

      if (!matches.length) {
        return false;
      }

      this.setState({ hideSuggestions: true });
      return true;
    },
  };

  /**
   * The list of users that match the current query
   */
  private get users(): ActiveUserData[] {
    return this.props.userData.map((user, index) => ({
      ...user,
      active: index === this.state.activeIndex,
    }));
  }

  /**
   * The list of tags which match the current query
   */
  private get tags(): ActiveTagData[] {
    return this.props.tagData.map((data, index) => ({
      ...data,
      active: index === this.state.activeIndex,
    }));
  }

  /**
   * A simple getter for the editor theme.
   */
  private get theme(): TwitterEditorTheme {
    return deepMerge(twitterEditorTheme, this.props.theme);
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

    if (name === 'at') {
      const props = {
        name: 'at' as 'at',
        query: query.full,
      };
      this.props.onMentionChange({ ...props, activeIndex: this.state.activeIndex });
    }

    if (name === 'tag') {
      const props = {
        name: 'tag' as 'tag',
        query: query.full,
      };
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

  /**
   * Identifies the next exit as one which can be ignored.
   */
  private setExitTriggeredInternally = () => {
    this.exitTriggeredInternally = true;
  };

  public render() {
    const { emojiPickerActive, activeMatcher, hideSuggestions } = this.state;
    const { editorStyles, ...rest } = this.remirrorProps;
    return (
      <ThemeProvider theme={this.theme}>
        <RemirrorManager
          placeholder={[
            "What's happening?",
            {
              color: '#aab8c2',
              fontStyle: 'normal',
              position: 'absolute',
              fontWeight: 300,
              letterSpacing: '0.5px',
            },
          ]}
        >
          <RemirrorExtension Constructor={NodeCursorExtension} />
          <RemirrorExtension Constructor={CompositionExtension} />
          <RemirrorExtension<MentionExtensionOptions>
            Constructor={MentionExtension}
            matchers={matchers}
            extraAttrs={['href', ['role', 'presentation']]}
            onChange={this.onChange}
            onExit={this.onExit}
            keyBindings={this.keyBindings}
          />
          <RemirrorExtension<EnhancedLinkExtensionOptions>
            Constructor={EnhancedLinkExtension}
            onUrlsChange={this.props.onUrlsChange}
          />
          <RemirrorExtension<EmojiExtensionOptions>
            Constructor={EmojiExtension}
            set={this.props.emojiSet}
            emojiData={this.props.emojiData}
          />
          <ManagedRemirrorProvider editorStyles={[this.theme.editorStyles, editorStyles]} {...rest}>
            <TwitterEditorComponent
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
          </ManagedRemirrorProvider>
        </RemirrorManager>
      </ThemeProvider>
    );
  }
}
