import { deepMerge, omit, RemirrorTheme } from '@remirror/core';
import { NodeCursorExtension, PlaceholderExtension } from '@remirror/core-extensions';
import {
  EmojiExtension,
  EmojiExtensionOptions,
  EmojiObject,
  EmojiSuggestCommand,
  EmojiSuggestionChangeHandler,
  EmojiSuggestionExitHandler,
  EmojiSuggestionKeyBindings,
} from '@remirror/extension-emoji';
import { EnhancedLinkExtension } from '@remirror/extension-enhanced-link';
import {
  MentionExtension,
  MentionExtensionOptions,
  MentionExtensionMatcher,
} from '@remirror/extension-mention';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager } from '@remirror/react';
import { RemirrorThemeProvider } from '@remirror/ui';
import React, { PureComponent } from 'react';
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
import { SocialEditorComponent } from './social-wrapper-component';
import {
  SuggestStateMatch,
  SuggestKeyBindingMap,
  SuggestKeyBindingParams,
  SuggestChangeHandlerParams,
} from 'prosemirror-suggest';

interface State {
  activeMatcher: MatchName | undefined;
  activeIndex: number;
  hideMentionSuggestions: boolean;

  emojiList: EmojiObject[];
  hideEmojiSuggestions: boolean;
  activeEmojiIndex: number;
  emojiCommand?: EmojiSuggestCommand;
}

/**
 * These are the matchers
 */
const matchers: MentionExtensionMatcher[] = [
  { name: 'at', char: '@', appendText: ' ' },
  { name: 'tag', char: '#', appendText: ' ' },
];

export class SocialEditor extends PureComponent<SocialEditorProps, State> {
  public static defaultProps = {
    theme: { colors: {}, font: {} },
    emojiSet: 'social',
    placeholder: "What's happening?",
  };

  public readonly state: State = {
    activeIndex: 0,
    activeMatcher: undefined,
    hideMentionSuggestions: false,
    activeEmojiIndex: 0,
    emojiList: [],
    hideEmojiSuggestions: false,
  };

  /**
   * The mention information
   */
  private mention: SuggestStateMatch | undefined;

  /**
   * This keeps track of when an exit was triggered by an internal command. For
   * example when the enter key is pressed to select a suggestion this should be
   * set to true so that the subsequent `onExit` call can be ignored.
   */
  private mentionExitTriggeredInternally = false;

  /**
   * Create the arrow bindings for the mentions.
   */
  private readonly createMentionArrowBindings = (direction: 'up' | 'down') => ({
    queryText,
    suggester: { name },
  }: SuggestKeyBindingParams) => {
    const { activeIndex: prevIndex, hideMentionSuggestions: hideSuggestions } = this.state;
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
    onMentionStateChange({ name, query: queryText.full, activeIndex } as OnMentionChangeParams);

    return true;
  };

  /**
   * These are the keyBindings for mentions extension. This allows for
   * overriding
   */
  private readonly mentionKeyBindings: SuggestKeyBindingMap = {
    /**
     * Handle the enter key being pressed
     */
    Enter: ({ suggester: { char, name }, command }) => {
      const { activeIndex, hideMentionSuggestions: hideSuggestions } = this.state;

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

      this.setMentionExitTriggeredInternally();
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
    Escape: ({ suggester: { name } }) => {
      const matches = name === 'at' ? this.users : this.tags;

      if (!matches.length) {
        return false;
      }

      this.setState({ hideMentionSuggestions: true });
      return true;
    },

    /**
     * Handle the up arrow being pressed
     */
    ArrowUp: this.createMentionArrowBindings('up'),

    /**
     * Handle the down arrow being pressed
     */
    ArrowDown: this.createMentionArrowBindings('down'),
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
   * Retrieves the mention property and can be passed down into child
   * components.
   *
   * This is defined here and now as a part of state because we don't actually
   * need to rerender the component when the query or suggestion state changes.
   * We only need this in children components when clicking on the suggestion so
   * that the click handler can know what the active mention query is since
   * mentions can either be `@` or `#`.
   */
  private readonly getMention = () => {
    if (!this.mention) {
      throw new Error('There is currently no mention data available');
    }
    return this.mention;
  };

  /**
   * The is the callback for when a suggestion is changed.
   */
  private readonly onChange = (params: SuggestChangeHandlerParams) => {
    const {
      queryText,
      suggester: { name },
    } = params;

    if (name) {
      const props = {
        name,
        query: queryText.full,
      } as MentionState;
      this.props.onMentionChange({ ...props, activeIndex: this.state.activeIndex });
    }

    // Reset the active index so that the dropdown is back to the top.
    this.setState({ activeIndex: 0, activeMatcher: name as MatchName, hideMentionSuggestions: false });
    this.mention = params;
  };

  /**
   * Called when the none of our configured matchers match
   */
  private readonly onExit: Required<MentionExtensionOptions>['onExit'] = params => {
    const { queryText, command } = params;

    // Check whether we've manually caused this exit. If not, trigger the
    // command.
    if (!this.mentionExitTriggeredInternally) {
      command({
        role: 'presentation',
        href: `/${queryText.full}`,
        appendText: '',
      });
    }

    this.props.onMentionChange(undefined);
    this.setState({ activeIndex: 0, activeMatcher: undefined });
    this.mention = undefined;
    this.mentionExitTriggeredInternally = false;
  };

  private get theme(): RemirrorTheme {
    return deepMerge(socialEditorTheme, this.props.theme || Object.create(null));
  }

  /**
   * Identifies the next exit as one which can be ignored.
   */
  private readonly setMentionExitTriggeredInternally = () => {
    this.mentionExitTriggeredInternally = true;
  };

  private readonly onEmojiSuggestionChange: EmojiSuggestionChangeHandler = ({ emojiMatches, command }) => {
    this.setState({
      hideEmojiSuggestions: false,
      emojiList: emojiMatches,
      activeEmojiIndex: 0,
      emojiCommand: command,
    });
    // this.setState({ hideEmojiSuggestions: false, activeEmojiIndex: 0 });
  };

  private readonly onEmojiSuggestionExit: EmojiSuggestionExitHandler = () => {
    this.setState({
      hideEmojiSuggestions: true,
      emojiList: [],
      activeEmojiIndex: 0,
      emojiCommand: undefined,
    });
  };

  /**
   * Create the arrow bindings for the emoji suggestions.
   */
  private readonly createEmojiArrowBindings = (direction: 'up' | 'down') => () => {
    const { activeEmojiIndex: prevIndex, hideMentionSuggestions, emojiList } = this.state;

    if (hideMentionSuggestions || !emojiList.length) {
      return false;
    }

    // pressed up arrow
    const activeEmojiIndex = calculateNewIndexFromArrowPress({
      direction,
      matchLength: emojiList.length,
      prevIndex,
    });

    this.setState({ activeEmojiIndex });
    return true;
  };

  private readonly emojiKeyBindings: EmojiSuggestionKeyBindings = {
    /**
     * Handle the enter key being pressed
     */
    Enter: ({ command }) => {
      const { activeEmojiIndex, hideEmojiSuggestions, emojiList } = this.state;

      if (hideEmojiSuggestions) {
        return false;
      }

      const emoji = emojiList[activeEmojiIndex];

      // Check if a matching id exists because the user has selected something.
      if (!emoji) {
        return false;
      }

      command(emoji);

      return true;
    },

    /**
     * Hide the suggestions when the escape key is pressed.
     */
    Escape: () => {
      const { emojiList } = this.state;
      if (!emojiList.length) {
        return false;
      }

      this.setState({ hideEmojiSuggestions: true });
      return true;
    },

    ArrowDown: this.createEmojiArrowBindings('down'),
    ArrowUp: this.createEmojiArrowBindings('up'),
  };

  public render() {
    const {
      activeMatcher,
      emojiCommand,
      hideMentionSuggestions,
      activeEmojiIndex,
      emojiList,
      hideEmojiSuggestions,
    } = this.state;

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
            keyBindings={this.mentionKeyBindings}
          />
          <RemirrorExtension Constructor={EnhancedLinkExtension} onUrlsChange={this.props.onUrlsChange} />
          <RemirrorExtension<typeof EmojiExtension, EmojiExtensionOptions>
            Constructor={EmojiExtension}
            onSuggestionChange={this.onEmojiSuggestionChange}
            suggestionKeyBindings={this.emojiKeyBindings}
            onSuggestionExit={this.onEmojiSuggestionExit}
          />
          <ManagedRemirrorProvider {...rest}>
            <>
              <SocialEditorComponent
                emojiCommand={emojiCommand}
                activeEmojiIndex={activeEmojiIndex}
                emojiList={emojiList}
                hideEmojiSuggestions={hideEmojiSuggestions}
                hideSuggestions={hideMentionSuggestions}
                activeMatcher={activeMatcher}
                setExitTriggeredInternally={this.setMentionExitTriggeredInternally}
                getMention={this.getMention}
                users={this.users}
                tags={this.tags}
              />
              {children}
            </>
          </ManagedRemirrorProvider>
        </RemirrorManager>
      </RemirrorThemeProvider>
    );
  }
}
