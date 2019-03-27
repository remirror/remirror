import React, { PureComponent } from 'react';

import { Attrs, omit } from '@remirror/core';
import { InlineCursorTarget } from '@remirror/core-extensions';
import { EmojiNode, EmojiNodeOptions, isBaseEmoji } from '@remirror/extension-emoji';
import { EnhancedLink, EnhancedLinkOptions } from '@remirror/extension-enhanced-link';
import {
  ActionTaken,
  Mention,
  MentionNodeAttrs,
  MentionOptions,
  OnKeyDownParams,
} from '@remirror/extension-mention';
import {
  ManagedRemirrorEditor,
  RemirrorEventListener,
  RemirrorExtension,
  RemirrorManager,
} from '@remirror/react';
import { ThemeProvider } from 'emotion-theming';
import keyCode from 'keycode';
import { UITwitterTheme, uiTwitterTheme } from '../theme';
import {
  ActiveTwitterTagData,
  ActiveTwitterUserData,
  MentionState,
  SubmitFactory,
  TwitterTagData,
  TwitterUIProps,
  TwitterUserData,
} from '../types';
import { TwitterEditor } from './editor';
import { EmojiPickerProps } from './emoji-picker';

interface State {
  mention?: MentionState;
  activeIndex: number;
  emojiPickerActive: boolean;
}

const matchers = [{ name: 'at', char: '@' }, { name: 'tag', char: '#' }];

export class TwitterUI extends PureComponent<TwitterUIProps, State> {
  public static defaultProps = {
    theme: { colors: {}, font: {} },
    emojiSet: 'twitter',
  };

  public readonly state: State = { activeIndex: 0, emojiPickerActive: false };
  private exitCommandEnabled = false;

  private onMentionEnter: Required<MentionOptions>['onEnter'] = ({ query, command, name }) => {
    if (name === 'at') {
      const params = {
        name: 'at' as 'at',
        action: ActionTaken.Entered,
        query: query || '',
      };
      this.setMention({ ...params, submitFactory: this.atMentionSubmitFactory(command) });
      this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
    } else {
      const params = {
        name: 'tag' as 'tag',
        action: ActionTaken.Entered,
        query: query || '',
      };
      this.setMention({ ...params, submitFactory: this.tagMentionSubmitFactory(command) });
      this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
    }

    this.setActiveIndex(0);
  };

  private onMentionChange: Required<MentionOptions>['onChange'] = ({ query, command, name }) => {
    if (name === 'at') {
      const params = {
        name: 'at' as 'at',
        action: ActionTaken.Changed,
        query: query || '',
      };
      this.setMention({ ...params, submitFactory: this.atMentionSubmitFactory(command) });
      this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
    } else {
      const params = {
        name: 'tag' as 'tag',
        action: ActionTaken.Changed,
        query: query || '',
      };
      this.setMention({ ...params, submitFactory: this.tagMentionSubmitFactory(command) });
      this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
    }

    this.setActiveIndex(0);
  };

  private onMentionExit: Required<MentionOptions>['onExit'] = ({ query, command, char }) => {
    if (query && this.exitCommandEnabled) {
      command({
        id: query,
        label: `${char}${query}`,
        role: 'presentation',
        href: `/${query}`,
        appendText: '',
      });
    }
    this.setMention(undefined);
    this.props.onMentionStateChange(undefined);
  };

  private onChange: RemirrorEventListener = ({}) => {};

  get userMatches(): ActiveTwitterUserData[] {
    return this.props.userData.map((user, index) => ({
      ...user,
      active: index === this.state.activeIndex,
    }));
  }

  get tagMatches(): ActiveTwitterTagData[] {
    return this.props.tagData.map((data, index) => ({
      ...data,
      active: index === this.state.activeIndex,
    }));
  }

  /**
   * Factory for creating at's via the passed in command and the curried tag function which can be called within
   * an onClick / eventHandler function
   *
   * @param command
   */
  private atMentionSubmitFactory(command: (attrs: MentionNodeAttrs) => void): SubmitFactory<TwitterUserData> {
    return (user, fn) => () => {
      this.exitCommandEnabled = false; // Prevents exit command also being called after this

      command({
        id: user.username,
        label: `@${user.username}`,
        role: 'presentation',
        href: `/${user.username}`,
      });

      if (fn) {
        fn();
      }
    };
  }

  /**
   * Factory for creating tags via the passed in command and the curried tag function which can be called within
   * an onClick / eventHandler function
   *
   * @param command
   */
  private tagMentionSubmitFactory(command: (attrs: MentionNodeAttrs) => void): SubmitFactory<TwitterTagData> {
    return ({ tag }, fn) => () => {
      this.exitCommandEnabled = false; // Prevents exit command also being called after this

      command({
        id: tag,
        label: `#${tag}`,
        role: 'presentation',
        href: `/search?query=${tag}`,
      });

      if (fn) {
        fn();
      }
    };
  }

  private setActiveIndex(activeIndex: number) {
    this.setState({ activeIndex });
  }

  private setMention(mention: MentionState | undefined) {
    this.setState({ mention });
  }

  private onMentionKeyDown = ({ event }: OnKeyDownParams) => {
    const enter = keyCode.isEventKey(event, 'enter');
    const down = keyCode.isEventKey(event, 'down');
    const up = keyCode.isEventKey(event, 'up');
    const esc = keyCode.isEventKey(event, 'esc');
    const del = keyCode.isEventKey(event, 'delete');
    const backspace = keyCode.isEventKey(event, 'backspace');

    const { mention, activeIndex } = this.state;
    const { onMentionStateChange } = this.props;
    this.exitCommandEnabled = false;
    if (!mention) {
      return false;
    }

    const { name: type, query, action } = mention;
    const matches = type === 'at' ? this.userMatches : this.tagMatches;

    // pressed up arrow
    if (up) {
      const newIndex = activeIndex - 1 < 0 ? matches.length - 1 : activeIndex - 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ name: type, query, activeIndex: newIndex, action });
      return true;
    }

    // pressed down arrow
    if (down) {
      const newIndex = activeIndex + 1 > matches.length - 1 ? 0 : activeIndex + 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ name: type, query, activeIndex: newIndex, action });
      return true;
    }

    // pressed enter
    if (enter) {
      return this.handleEnterKeyPressed(mention);
    }

    if (esc) {
      // ? Perhaps add a cancel
    }

    if (del || backspace) {
      return false;
    }

    this.exitCommandEnabled = true;

    return false;
  };

  /**
   * Only intercept the enter key press when the number of matches has a length.
   *
   * @param mention
   */
  private handleEnterKeyPressed(mention: MentionState) {
    const { activeIndex } = this.state;
    if (mention.name === 'at' && this.userMatches.length) {
      mention.submitFactory(this.userMatches[activeIndex])();
      return true;
    } else if (mention.name === 'tag' && this.tagMatches.length) {
      mention.submitFactory(this.tagMatches[activeIndex])();
      return true;
    }

    this.exitCommandEnabled = true;

    return false;
  }

  private get theme(): UITwitterTheme {
    const { theme: propTheme = { colors: {} } } = this.props;
    return { ...uiTwitterTheme, ...propTheme, colors: { ...uiTwitterTheme.colors, ...propTheme.colors } };
  }

  private get remirrorProps() {
    return omit(this.props, ['userData', 'tagData', 'onMentionStateChange', 'theme']);
  }

  private onSelectEmoji = (method: (attrs: Attrs) => void): EmojiPickerProps['onSelection'] => emoji => {
    if (isBaseEmoji(emoji)) {
      method({
        id: emoji.id,
        name: emoji.name,
        native: emoji.native,
        colors: emoji.colons,
        skin: String(emoji.skin || ''),
      });
    }
  };

  private onClickEmojiSmiley = () => {
    this.setState(prevState => ({ emojiPickerActive: !prevState.emojiPickerActive }));
  };

  private toggleEmojiRef = React.createRef<HTMLElement>();

  private onBlurEmojiPicker = () => {
    this.setState({ emojiPickerActive: false });
  };

  public render() {
    const { mention, emojiPickerActive } = this.state;
    return (
      <ThemeProvider theme={this.theme}>
        <RemirrorManager>
          <RemirrorExtension<{}> Constructor={InlineCursorTarget} />
          <RemirrorExtension<MentionOptions>
            Constructor={Mention}
            matchers={matchers}
            extraAttrs={['href', 'role']}
            onEnter={this.onMentionEnter}
            onChange={this.onMentionChange}
            onExit={this.onMentionExit}
            onKeyDown={this.onMentionKeyDown}
          />
          <RemirrorExtension<EnhancedLinkOptions>
            Constructor={EnhancedLink}
            onUrlsChange={this.props.onUrlsChange}
          />
          <RemirrorExtension<EmojiNodeOptions>
            Constructor={EmojiNode}
            set={this.props.emojiSet}
            emojiData={this.props.emojiData}
          />
          <ManagedRemirrorEditor
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
            {...this.remirrorProps}
            onChange={this.onChange}
            insertPosition='start'
          >
            <TwitterEditor
              mention={mention}
              emojiPickerActive={emojiPickerActive}
              onBlurEmojiPicker={this.onBlurEmojiPicker}
              emojiData={this.props.emojiData}
              emojiSet={this.props.emojiSet}
              ignoredElements={[this.toggleEmojiRef.current!]}
              onClickEmojiSmiley={this.onClickEmojiSmiley}
              toggleEmojiRef={this.toggleEmojiRef}
              userMatches={this.userMatches}
              tagMatches={this.tagMatches}
              onSelectEmoji={this.onSelectEmoji}
            />
          </ManagedRemirrorEditor>
        </RemirrorManager>
      </ThemeProvider>
    );
  }
}
