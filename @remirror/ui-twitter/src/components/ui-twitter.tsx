import React, { PureComponent } from 'react';

import { css, Interpolation } from '@emotion/core';
import { AnyExtension, Attrs, EDITOR_CLASS_NAME, EditorView, Omit, omit } from '@remirror/core';
import { InlineCursorTarget } from '@remirror/core-extensions';
import { EmojiNode, isBaseEmoji } from '@remirror/extension-emoji';
import { EnhancedLink, EnhancedLinkOptions } from '@remirror/extension-enhanced-link';
import { MentionNode, NodeAttrs, OnKeyDownParams } from '@remirror/extension-mention';
import { Remirror, RemirrorEventListener, RemirrorProps } from '@remirror/react';
import { Data, EmojiSet } from 'emoji-mart';
import { ThemeProvider } from 'emotion-theming';
import keyCode from 'keycode';
import { styled, UITwitterTheme, uiTwitterTheme } from '../theme';
import { ActiveTwitterTagData, ActiveTwitterUserData, TwitterTagData, TwitterUserData } from '../types';
import { CharacterCountIndicator } from './character-count';
import { EmojiPicker, EmojiPickerProps, EmojiSmiley } from './emoji-picker';
import { AtSuggestions, HashSuggestions } from './suggestions';

export type OnQueryChangeParams = Omit<MentionState, 'submitFactory'> & { activeIndex: number };

export interface TwitterUIProps extends EnhancedLinkOptions, Partial<RemirrorProps> {
  /**
   * The number of matches to display
   */
  userData: TwitterUserData[];
  tagData: TwitterTagData[];
  onMentionStateChange(params?: OnQueryChangeParams): void;
  theme: UITwitterTheme;

  /**
   * The data object used for emoji.
   * The shape is taken from emoji-mart.
   */
  emojiData: Data;
  emojiSet: EmojiSet;
}

interface BaseMentionState {
  query: string;
  action: 'enter' | 'change' | 'exit';
}

interface AtMentionState extends BaseMentionState {
  type: 'at';
  submitFactory(user: TwitterUserData): () => void;
}
interface HashMentionState extends BaseMentionState {
  type: 'hash';
  query: string;
  submitFactory(tag: TwitterTagData): () => void;
}

type MentionState = AtMentionState | HashMentionState;

interface State {
  mention?: MentionState;
  activeIndex: number;
  emojiPickerActive: boolean;
}

export class TwitterUI extends PureComponent<TwitterUIProps, State> {
  public static defaultProps = {
    theme: { colors: {}, font: {} },
    emojiSet: 'twitter',
  };

  public readonly state: State = { activeIndex: 0, emojiPickerActive: false };
  private readonly extensions: AnyExtension[];
  private view?: EditorView;
  private exitCommandEnabled = false;

  constructor(props: TwitterUIProps) {
    super(props);
    this.extensions = this.createExtensions();
  }

  private createExtensions() {
    return [
      new InlineCursorTarget(),
      new MentionNode({
        type: 'at',
        extraAttrs: ['href', 'role'],
        matcher: { char: '@' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          const params = {
            type: 'at' as 'at',
            action: 'enter' as 'enter',
            query: query || '',
          };
          this.setMention({ ...params, submitFactory: this.atMentionSubmitFactory(command) });
          this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          const params = {
            type: 'at' as 'at',
            action: 'change' as 'change',
            query: query || '',
          };
          this.setMention({ ...params, submitFactory: this.atMentionSubmitFactory(command) });
          this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
          this.setActiveIndex(0);
        },
        onExit: ({ query, command }) => {
          if (query && this.exitCommandEnabled) {
            command({
              id: query,
              label: `@${query}`,
              role: 'presentation',
              href: `/${query}`,
              appendText: '',
            });
          }
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new MentionNode({
        type: 'hash',
        selectable: true,
        matcher: { char: '#' },
        extraAttrs: ['href', 'role'],
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          const params = {
            type: 'hash' as 'hash',
            action: 'enter' as 'enter',
            query: query || '',
          };
          this.setMention({ ...params, submitFactory: this.hashMentionSubmitFactory(command) });
          this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          const params = {
            type: 'hash' as 'hash',
            action: 'change' as 'change',
            query: query || '',
          };
          this.setMention({ ...params, submitFactory: this.hashMentionSubmitFactory(command) });
          this.props.onMentionStateChange({ ...params, activeIndex: this.state.activeIndex });
          this.setActiveIndex(0);
        },
        onExit: ({ query, command }) => {
          if (query && this.exitCommandEnabled) {
            command({
              id: query,
              label: `#${query}`,
              role: 'presentation',
              href: `/search?query=${query}`,
              appendText: '',
            });
          }
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new EnhancedLink({ onUrlsChange: this.props.onUrlsChange }),
      new EmojiNode({ set: this.props.emojiSet, emojiData: this.props.emojiData }),
    ];
  }

  /**
   * Keeps a copy of the editor view for commands
   * @param view
   */
  private storeView(view: EditorView): void {
    if (view !== this.view) {
      this.view = view;
    }
  }

  private onChange: RemirrorEventListener = ({ getJSON }) => {
    console.log(getJSON());
  };

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

  private atMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return (user: TwitterUserData) => () => {
      this.exitCommandEnabled = false; // Prevents exit command also being called after this

      command({
        id: user.username,
        label: `@${user.username}`,
        role: 'presentation',
        href: `/${user.username}`,
      });

      // Refocus the editor
      if (this.view) {
        this.view.focus();
      }
    };
  }

  /**
   * Factory for creating hashes via the passed in command and the curried tag function which can be called within
   * an onClick / eventHandler function
   *
   * @param command
   * @param appendText
   */
  private hashMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return ({ tag }: TwitterTagData) => () => {
      this.exitCommandEnabled = false; // Prevents exit command also being called after this
      command({
        id: tag,
        label: `#${tag}`,
        role: 'presentation',
        href: `/search?query=${tag}`,
      });

      // Refocus the editor
      if (this.view) {
        this.view.focus();
      }
    };
  }

  private setActiveIndex(activeIndex: number) {
    this.setState({ activeIndex });
  }

  private setMention(mention: MentionState | undefined) {
    this.setState({ mention });
  }

  private keyDownHandler = ({ event }: OnKeyDownParams) => {
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

    const { type, query, action } = mention;
    const matches = type === 'at' ? this.userMatches : this.tagMatches;

    // pressed up arrow
    if (up) {
      const newIndex = activeIndex - 1 < 0 ? matches.length - 1 : activeIndex - 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex, action });
      return true;
    }

    // pressed down arrow
    if (down) {
      const newIndex = activeIndex + 1 > matches.length - 1 ? 0 : activeIndex + 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex, action });
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
    if (mention.type === 'at' && this.userMatches.length) {
      mention.submitFactory(this.userMatches[activeIndex])();
      return true;
    } else if (mention.type === 'hash' && this.tagMatches.length) {
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
        <Remirror
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
          extensions={this.extensions}
          onChange={this.onChange}
          insertPosition='start'
        >
          {({ getRootProps, view, actions }) => {
            const content = view.state.doc.textContent;
            this.storeView(view);

            const { css: extra, ...rest } = getRootProps();
            return (
              <div>
                <RemirrorWrapper {...rest} extra={[extra]}>
                  <CharacterCountWrapper>
                    <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
                  </CharacterCountWrapper>
                  {emojiPickerActive && (
                    <EmojiPickerWrapper>
                      <EmojiPicker
                        onBlur={this.onBlurEmojiPicker}
                        data={this.props.emojiData}
                        set={this.props.emojiSet}
                        onSelection={this.onSelectEmoji(actions.emoji.command)}
                        ignoredElements={[this.toggleEmojiRef.current!]}
                      />
                    </EmojiPickerWrapper>
                  )}
                  <EmojiSmileyWrapper>
                    <span
                      role='button'
                      aria-pressed={emojiPickerActive ? 'true' : 'false'}
                      onClick={this.onClickEmojiSmiley}
                      ref={this.toggleEmojiRef}
                    >
                      <EmojiSmiley active={emojiPickerActive} />
                    </span>
                  </EmojiSmileyWrapper>
                </RemirrorWrapper>
                <div>
                  {!mention ? null : mention.type === 'at' ? (
                    <AtSuggestions data={this.userMatches} submitFactory={mention.submitFactory} />
                  ) : (
                    <HashSuggestions data={this.tagMatches} submitFactory={mention.submitFactory} />
                  )}
                </div>
              </div>
            );
          }}
        </Remirror>
      </ThemeProvider>
    );
  }
}

/* Styled Components */

const CharacterCountWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 8px 10px 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const EmojiSmileyWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px 8px 0 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const EmojiPickerWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 40px 8px 0 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const editorClass = `.${EDITOR_CLASS_NAME}`;

const RemirrorWrapper = styled.div<{ extra: Interpolation[] }>`
  position: relative;
  & * {
    box-sizing: border-box;
  }

  ${editorClass}:focus {
    outline: none;
  }

  ${editorClass} p {
    margin: 0;
    letter-spacing: 0.6px;
    color: black;
  }

  ${editorClass} {
    box-sizing: border-box;
    position: relative;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
    line-height: 20px;
    border-radius: 8px;
    width: 100%;
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size};
    max-height: calc(90vh - 124px);
    min-height: 142px;
    padding: 8px;
    padding-right: 40px;
    font-weight: ${({ theme }) => theme.font.weight};
  }

  ${editorClass} a {
    text-decoration: none !important;
    color: ${props => props.theme.colors.primary};
  }

  ${editorClass} a.mention {
    pointer-events: none;
    cursor: default;
  }

  ${editorClass} .ProseMirror-selectednode {
    background-color: rgb(245, 248, 250);
  }

  ${props => css(props.extra)};
`;

/* Character count -
- emoji 2
- url 20
- character 1
*/
