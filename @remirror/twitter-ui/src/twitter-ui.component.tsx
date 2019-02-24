import React, { PureComponent } from 'react';

import { AnyExtension, EditorSchema, Omit } from '@remirror/core';
import { Mentions, NodeAttrs, OnKeyDownParams } from '@remirror/mentions-extension';
import { Remirror, RemirrorProps } from '@remirror/react';
import { EditorView } from 'prosemirror-view';
import { CharacterCountIndicator } from './character-count.component';
import { TwitterLink, TwitterLinkOptions } from './marks/twitter-link';
import { defaultStyles } from './styles';
import { AtSuggestions, HashSuggestions } from './suggestions.component';
import { ActiveTwitterTagData, ActiveTwitterUserData, TwitterTagData, TwitterUserData } from './types';

export type OnQueryChangeParams = Omit<MentionState, 'submitFactory'> & { activeIndex: number };

export interface TwitterUIProps extends TwitterLinkOptions, Partial<RemirrorProps> {
  /**
   * The number of matches to display
   */
  userData: TwitterUserData[];
  tagData: TwitterTagData[];
  onMentionStateChange(params?: OnQueryChangeParams): void;
}

interface AtMentionState {
  type: 'at';
  query: string;
  submitFactory(user: TwitterUserData): () => void;
}
interface HashMentionState {
  type: 'hash';
  query: string;
  submitFactory(tag: TwitterTagData): () => void;
}

type MentionState = AtMentionState | HashMentionState;

interface State {
  mention?: MentionState;
  activeIndex: number;
}

export class TwitterUI extends PureComponent<TwitterUIProps, State> {
  public readonly state: State = { activeIndex: 0 };
  private readonly extensions: AnyExtension[];
  private view?: EditorView;

  constructor(props: TwitterUIProps) {
    super(props);
    this.extensions = this.createExtensions();
  }

  private createExtensions() {
    return [
      new Mentions({
        type: 'at',
        extraAttrs: ['href', 'role'],
        matcher: { char: '@' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          this.setMention({
            type: 'at',
            query: query || '',
            submitFactory: this.atMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'at',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          this.setMention({
            type: 'at',
            query: query || '',
            submitFactory: this.atMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'at',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onExit: () => {
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new Mentions({
        type: 'hash',
        matcher: { char: '#' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          this.setMention({
            type: 'hash',
            query: query || '',
            submitFactory: this.hashMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'hash',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          this.setMention({
            type: 'hash',
            query: query || '',
            submitFactory: this.hashMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'hash',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onExit: () => {
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new TwitterLink({ onUrlsChange: this.props.onUrlsChange }),
    ];
  }

  /**
   * Keeps a copy of the editor view for commands
   * @param view
   */
  private storeView(view: EditorView<EditorSchema>): void {
    if (view !== this.view) {
      this.view = view;
    }
  }

  private onChange() {
    //
  }

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
      command({
        id: user.username,
        label: user.username,
        role: 'presentation',
        href: `/${user.username}`,
      });
      // Refocus the editor
      if (this.view) {
        this.view.focus();
      }
    };
  }

  private hashMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return ({ tag }: TwitterTagData) => () => {
      command({
        id: tag,
        label: tag,
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

  private setMention(mention?: MentionState) {
    this.setState({ mention });
  }

  private keyDownHandler = ({ event }: OnKeyDownParams) => {
    const enter = event.keyCode === 13;
    const down = event.keyCode === 40;
    const up = event.keyCode === 38;
    const esc = event.keyCode === 27;

    const { mention, activeIndex } = this.state;
    const { onMentionStateChange } = this.props;

    if (!mention) {
      return false;
    }

    const { type, query } = mention;

    // pressing up arrow
    if (up) {
      const newIndex = activeIndex - 1 < 0 ? this.userMatches.length - 1 : activeIndex - 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }

    // pressing down arrow
    if (down) {
      const newIndex = activeIndex + 1 > this.userMatches.length - 1 ? 0 : activeIndex + 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }

    // pressing enter
    if (enter) {
      if (mention.type === 'at') {
        mention.submitFactory(this.userMatches[activeIndex])();
      } else {
        mention.submitFactory(this.tagMatches[activeIndex])();
      }

      return true;
    }

    if (esc) {
      // Perhaps add a remove text action for esc - for now do nothing;
    }

    return false;
  };

  public render() {
    const { mention } = this.state;
    return (
      <Remirror
        placeholder="What's happening?"
        styles={defaultStyles}
        {...this.props}
        extensions={this.extensions}
        onChange={this.onChange}
      >
        {({ getRootProps, view }) => {
          const content = view.state.doc.textContent;
          this.storeView(view);

          return (
            <div>
              <div {...getRootProps()} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    margin: '0 8px 4px 4px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
                </div>
              </div>
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
    );
  }
}

/* Character count -
- emoji 2
- url 20
- character 1
*/
