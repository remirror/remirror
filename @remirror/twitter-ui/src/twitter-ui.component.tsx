import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { Omit } from '@remirror/core';
import { Mentions, NodeAttrs, OnKeyDownParams } from '@remirror/mentions-extension';
import { Remirror, RemirrorProps, uniqueClass } from '@remirror/react';
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

export const TwitterUI: FunctionComponent<TwitterUIProps> = ({
  onUrlsChange,
  attributes,
  data,
  onMentionStateChange,
  ...props
}) => {
  const [mentionState, setMentionState] = useState<MentionState>();
  const [activeIndex, setActiveIndex] = useState(0);

  const onChange: RemirrorProps['onChange'] = () => undefined;
  const getMentionState = useCallback(() => mentionState, [mentionState, activeIndex]);

  // useEffect(() => {
  //   // console.log(mentionState);
  // }, [mentionState]);

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

  const keyDownHandler = ({ event }: OnKeyDownParams) => {
    console.log(getMentionState(), event.keyCode);
    const state = getMentionState();
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
      onKeyDown: keyDownHandler,
      onEnter: ({ query, command }) => {
        console.log('entering');
        setMentionState({ type: 'at', query: query || '', submitFactory: atSubmitFactory(command) });
        onMentionStateChange({ type: 'at', query: query || '', activeIndex });
        setActiveIndex(0);
      },
      onChange: ({ query, command }) => {
        console.log('changing');
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

  const extraClassName = 'outer-remirror';

  return (
    <Remirror
      placeholder="What's happening?"
      styles={defaultStyles}
      extensions={extensions}
      onChange={onChange}
      attributes={attributes}
      {...props}
    >
      {({ getRootProps, view, uid }) => {
        const content = view.state.doc.textContent;

        return (
          <div className={uniqueClass(uid, extraClassName)}>
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
