import { MentionExtensionAttrs } from '@remirror/extension-mention';
import { useRemirror } from '@remirror/react';
import React, { FunctionComponent } from 'react';
import { styled } from '../twitter-theme';
import { TagSuggestionsProps, UserSuggestionsProps } from '../twitter-types';

const SuggestionsDropdown = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  flex-basis: auto;
  flex-shrink: 0;
  margin: 0;
  overflow: hidden;
  list-style: none;
  padding: 0;
`;

const ItemWrapper = styled.a<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid rgb(230, 236, 240);
  padding: 7px 15px 6px 10px;
  font-size: 14px;
  ${props => (props.active ? 'background-color: rgb(245, 248, 250);' : '')}

  &:hover {
    background-color: ${props => props.theme.colors.primaryBackground};
  }
  &:hover span {
    color: ${props => props.theme.colors.primary};
  }
`;

const AtImage = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
  border-radius: 50%;
`;

const AtDisplayName = styled.span`
  margin-right: 5px;
  color: #14171a;
  word-break: break-all;
  font-weight: bold;
`;

const AtUsername = styled.span`
  color: #657786;
`;

export const AtSuggestions: FunctionComponent<UserSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirror();

  /**
   * Click handler for accepting a user suggestion
   */
  const onClickFactory = (username: string) => () => {
    const params: MentionExtensionAttrs = {
      id: username,
      label: `@${username}`,
      name: 'at',
      replacementType: 'full',
      range: getMention().range,
      role: 'presentation',
      href: `/${username}`,
    };

    setExitTriggeredInternally(); // Prevents further `onExit` calls
    actions.mentionUpdate.command(params);

    if (!view.hasFocus()) {
      view.focus();
    }
  };

  return (
    <SuggestionsDropdown role='presentation'>
      {data.map(user => {
        return (
          <ItemWrapper
            active={user.active}
            className={`suggestions-item${user.active ? ' active' : ''}`}
            key={user.username}
            aria-selected={user.active ? 'true' : 'false'}
            aria-haspopup='false'
            role='option'
            onClick={onClickFactory(user.username)}
          >
            <AtImage src={user.avatarUrl} />
            <AtDisplayName className='display-name'>{user.displayName}</AtDisplayName>
            <AtUsername className='username'>@{user.username}</AtUsername>
          </ItemWrapper>
        );
      })}
    </SuggestionsDropdown>
  );
};

const HashTagText = styled.span`
  font-weight: bold;
  color: #66757f;

  &:hover {
    text-decoration: underline;
    color: ${props => props.theme.colors.primary};
  }
`;

export const TagSuggestions: FunctionComponent<TagSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirror();

  /**
   * Click handler for accepting a tag suggestion
   */
  const onClickFactory = (tag: string) => () => {
    const params: MentionExtensionAttrs = {
      id: tag,
      label: `#${tag}`,
      name: 'tag',
      replacementType: 'full',
      range: getMention().range,
      role: 'presentation',
      href: `/search?query=${tag}`,
    };

    setExitTriggeredInternally(); // Prevents futher `onExit` calls
    actions.mentionUpdate.command(params);

    if (!view.hasFocus()) {
      view.focus();
    }
  };

  return (
    <SuggestionsDropdown role='presentation'>
      {data.map(({ tag, active }) => (
        <ItemWrapper
          active={active}
          className={`suggestions-item${active ? ' active' : ''}`}
          key={tag}
          aria-selected={active ? 'true' : 'false'}
          aria-haspopup='false'
          role='option'
          onClick={onClickFactory(tag)}
        >
          <HashTagText>#{tag}</HashTagText>
        </ItemWrapper>
      ))}
    </SuggestionsDropdown>
  );
};
