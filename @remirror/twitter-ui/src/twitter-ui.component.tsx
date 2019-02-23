import React, { Component, FunctionComponent, useCallback, useEffect, useState } from 'react';

import { AnyExtension, Omit } from '@remirror/core';
import { Mentions, NodeAttrs, OnKeyDownParams } from '@remirror/mentions-extension';
import { Remirror, RemirrorProps } from '@remirror/react';
import { CharacterCountIndicator } from './character-count.component';
import { TwitterLink, TwitterLinkOptions } from './marks/twitter-link';
import { defaultStyles } from './styles';
import { AtSuggestions } from './suggestions.component';
import { ActiveTwitterUserData, TwitterTagData, TwitterUserData } from './types';

export type OnQueryChangeParams = Omit<MentionState, 'submitFactory'> & { activeIndex: number };

export interface TwitterUIProps extends TwitterLinkOptions, Partial<RemirrorProps> {
  /**
   * The number of matches to display
   */
  data: TwitterUserData[];
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

export class TwitterUI extends Component<TwitterUIProps, State> {
  public readonly state: State = { activeIndex: 0 };
  private readonly extensions: AnyExtension[];

  constructor(props: TwitterUIProps) {
    super(props);
    this.extensions = this.createExtensions();
  }

  private createExtensions() {
    return [
      new Mentions({
        type: 'at',
        matcher: { char: '@' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          console.log('entering');
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
          console.log('changing', this.state.mention);
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
          console.log('exiting');
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new TwitterLink({ onUrlsChange: this.props.onUrlsChange }),
      // new Mentions({
      //   type: 'hash',
      //   matcher: { char: '#' },
      //   onKeyDown: keyDownHandler,
      //   // onEnter: ({ query, command }) => {
      //   //   setMentionState({ type: 'hash', query: query || '', submit: command });
      //   //   setActiveIndex(0);
      //   // },
      //   // onChange: ({ query, command }) => {
      //   //   setMentionState({ type: 'hash', query, submit: command });
      //   //   setActiveIndex(0);
      //   // },
      //   // onExit: () => {
      //   //   // command()
      //   //   setMentionState(undefined);
      //   //   setActiveIndex(0);
      //   // },
      // }),
    ];
  }

  private onChange() {
    //
  }

  get matches(): ActiveTwitterUserData[] {
    return this.props.data.map((user, index) => ({
      ...user,
      active: index === this.state.activeIndex,
    }));
  }

  private atMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return (user: TwitterUserData) => () => {
      command({
        id: user.username,
        label: `@${user.username}`,
        role: 'presentation',
        href: `/${user.username}`,
      });
    };
  }

  private setActiveIndex(activeIndex: number) {
    this.setState({ activeIndex });
  }

  private setMention(mention?: MentionState) {
    console.log('setting state to ', mention);
    this.setState({ mention });
  }

  private keyDownHandler = ({ event }: OnKeyDownParams) => {
    // console.log(mentionState, event.keyCode);
    const { mention, activeIndex } = this.state;
    const { onMentionStateChange } = this.props;
    console.log('in keyhandler', mention, event.keyCode);
    if (!mention) {
      return false;
    }

    const { type, query, submitFactory } = mention;
    console.log(type, query, event.keyCode);
    // pressing up arrow
    if (event.keyCode === 38) {
      const newIndex = activeIndex + 1 > this.matches.length ? 0 : activeIndex + 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }
    // pressing down arrow
    if (event.keyCode === 40) {
      const newIndex = activeIndex - 1 < 0 ? this.matches.length - 1 : activeIndex - 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }
    // pressing enter
    if (event.keyCode === 13) {
      console.log('enter key pressed', activeIndex, this.matches[activeIndex]);
      submitFactory(this.matches[activeIndex]);
      return true;
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
                  <AtSuggestions data={this.matches} submitFactory={mention.submitFactory} />
                ) : null}
              </div>
            </div>
          );
        }}
      </Remirror>
    );
  }
}

export const _TwitterUI: FunctionComponent<TwitterUIProps> = ({
  onUrlsChange,
  attributes,
  data,
  onMentionStateChange,
  ...props
}) => {
  const [mentionState, setMentionState] = useState<MentionState>();
  const [activeIndex, setActiveIndex] = useState(0);
  const fakeState = {
    mentionState,
    activeIndex,
  };

  const onChange: RemirrorProps['onChange'] = () => undefined;
  let t: any;
  useEffect(() => {
    fakeState.mentionState = mentionState;
    fakeState.activeIndex = activeIndex;
    console.log('Setting the mentionState to: ', mentionState);
    t = mentionState;
  }, [mentionState, activeIndex]);

  const matches: ActiveTwitterUserData[] = data.map((user, index) => ({
    ...user,
    active: index === activeIndex,
  }));

  const atSubmitFactory = (command: (attrs: NodeAttrs) => void) => (user: TwitterUserData) => () => {
    command({
      id: user.username,
      label: `@${user.username}`,
      role: 'presentation',
      href: `/${user.username}`,
    });
  };
  let ii = 0;
  const keyDownHandler = ({ event }: OnKeyDownParams) => {
    console.log('in key handler', ii++, t);
    // console.log(mentionState, event.keyCode);
    const { mentionState: state } = fakeState;
    console.log(state);
    if (!state) {
      return false;
    }
    const { type, query, submitFactory } = state;
    console.log(type, query, event.keyCode);
    // pressing up arrow
    if (event.keyCode === 38) {
      const newIndex = activeIndex + 1 > matches.length ? 0 : activeIndex + 1;
      setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }
    // pressing down arrow
    if (event.keyCode === 40) {
      const newIndex = activeIndex - 1 < 0 ? matches.length - 1 : activeIndex - 1;
      setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }
    // pressing enter
    if (event.keyCode === 13) {
      console.log('enter key pressed', activeIndex, matches[activeIndex]);
      submitFactory(matches[activeIndex]);
      return true;
    }

    return false;
  };

  const extensions = [
    new TwitterLink({ onUrlsChange }),
    new Mentions({
      type: 'at',
      matcher: { char: '@' },
      onKeyDown: useCallback(keyDownHandler, [mentionState]),
      onEnter: ({ query, command }) => {
        console.log('entering');
        setMentionState({ type: 'at', query: query || '', submitFactory: atSubmitFactory(command) });
        onMentionStateChange({ type: 'at', query: query || '', activeIndex });
        setActiveIndex(0);
      },
      onChange: ({ query, command }) => {
        console.log('changing', mentionState);
        setMentionState({ type: 'at', query: query || '', submitFactory: atSubmitFactory(command) });
        onMentionStateChange({ type: 'at', query: query || '', activeIndex });
        setActiveIndex(0);
      },
      onExit: () => {
        console.log('exiting');
        setMentionState(undefined);
        onMentionStateChange(undefined);
      },
    }),
    // new Mentions({
    //   type: 'hash',
    //   matcher: { char: '#' },
    //   onKeyDown: keyDownHandler,
    //   // onEnter: ({ query, command }) => {
    //   //   setMentionState({ type: 'hash', query: query || '', submit: command });
    //   //   setActiveIndex(0);
    //   // },
    //   // onChange: ({ query, command }) => {
    //   //   setMentionState({ type: 'hash', query, submit: command });
    //   //   setActiveIndex(0);
    //   // },
    //   // onExit: () => {
    //   //   // command()
    //   //   setMentionState(undefined);
    //   //   setActiveIndex(0);
    //   // },
    // }),
  ];

  return (
    <Remirror
      placeholder="What's happening?"
      styles={defaultStyles}
      extensions={extensions}
      onChange={onChange}
      attributes={attributes}
      {...props}
    >
      {({ getRootProps, view }) => {
        const content = view.state.doc.textContent;

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
              {!mentionState ? null : mentionState.type === 'at' ? (
                <AtSuggestions data={matches} submitFactory={mentionState.submitFactory} />
              ) : null}
            </div>
          </div>
        );
      }}
    </Remirror>
  );
};

/* Character count -
- emoji 2
- url 20
- character 1
*/
