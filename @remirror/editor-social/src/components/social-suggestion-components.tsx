import { Position, RemirrorTheme } from '@remirror/core';
import { useRemirrorContext } from '@remirror/react';
import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef, FunctionComponent } from 'react';
import {
  DivProps,
  ImgProps,
  SocialExtensions,
  SpanProps,
  TagSuggestionsProps,
  UserSuggestionsProps,
} from '../social-types';
import { createOnClickMethodFactory } from '../social-utils';

type SuggestionsDropdownProps = DivProps & {
  position?: Partial<Position> & { position?: 'absolute' };
};

const SuggestionsDropdown = forwardRef<HTMLDivElement, SuggestionsDropdownProps>(
  ({ position = Object.create(null), ...props }, ref) => {
    const { sx, css } = useRemirrorTheme();

    return (
      <div
        {...props}
        ref={ref}
        css={sx(
          {
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            flexBasis: 'auto',
            flexShrink: '0',
            margin: '0',
            overflow: 'hidden',
            listStyle: 'none',
            padding: '0',
          },
          css(position),
        )}
      />
    );
  },
);
SuggestionsDropdown.displayName = 'SuggestionsDropdown';

const ItemWrapper = forwardRef<HTMLSpanElement, SpanProps & { active: boolean }>(
  ({ active, ...props }, ref) => {
    const { css } = useRemirrorTheme();

    return (
      <span
        {...props}
        ref={ref}
        css={(theme: RemirrorTheme) => css`
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid rgb(230, 236, 240);
          padding: 7px 15px 6px 10px;
          font-size: 14px;
          ${active ? 'background-color: rgb(245, 248, 250);' : ''}

          &:hover {
            background-color: ${theme.colors.primaryBackground};
          }
          &:hover span {
            color: ${theme.colors.primary};
          }
        `}
      />
    );
  },
);
ItemWrapper.displayName = 'ItemWrapper';

const AtImage = forwardRef<HTMLImageElement, ImgProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <img
      {...props}
      ref={ref}
      css={sx({ width: '32px', height: '32px', marginRight: '10px', borderRadius: '50%' })}
    />
  );
});
AtImage.displayName = 'AtImage';

const AtDisplayName = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={sx({ marginRight: '5px', color: '#14171a', wordBreak: 'break-all', fontWeight: 'bold' })}
    />
  );
});
AtDisplayName.displayName = 'AtDisplayName';

const AtUsername = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return <span {...props} ref={ref} css={css({ color: '#657786' })} />;
});
AtUsername.displayName = 'AtUsername';

/**
 * Render the suggestions for mentioning a user.
 */
export const AtSuggestions: FunctionComponent<UserSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirrorContext<SocialExtensions>();

  /**
   * Click handler for accepting a user suggestion
   */
  const onClickFactory = createOnClickMethodFactory({
    command: actions.updateMention,
    getMention,
    setExitTriggeredInternally,
    view,
  });

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

const HashTagText = forwardRef<HTMLSpanElement, SpanProps>((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={theme => css`
        font-weight: bold;
        color: #66757f;

        &:hover {
          text-decoration: underline;
          color: ${theme.colors.primary};
        }
      `}
    />
  );
});
HashTagText.displayName = 'HashTagText';

/**
 * Render the suggestions for tagging.
 */
export const TagSuggestions: FunctionComponent<TagSuggestionsProps> = ({
  getMention,
  data,
  setExitTriggeredInternally,
}) => {
  const { view, actions } = useRemirrorContext<SocialExtensions>();

  /**
   * Click handler for accepting a tag suggestion
   */
  const onClickFactory = createOnClickMethodFactory({
    command: actions.updateMention,
    getMention,
    setExitTriggeredInternally,
    view,
  });

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
